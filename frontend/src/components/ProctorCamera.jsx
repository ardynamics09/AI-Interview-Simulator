import React, { useEffect, useRef, useState } from "react";

function ProctorCamera({
  onFocusPenalty,
  integrityScore = 100,
  isPaused = false
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [gazeStatus, setGazeStatus] = useState("CALIBRATING"); // "NORMAL", "LOOKING_AWAY", "NO_FACE", "BLOCKED", "LOOKING_DOWN"
  const [warningMessage, setWarningMessage] = useState("");

  const violationCountRef = useRef(0);
  const lastPenaltyTimeRef = useRef(0);
  const outOfBoundsCounterRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Initialize WebCam stream
  useEffect(() => {
    let stream = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: "user"
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn("Video play:", e));
          setCameraActive(true);
          setGazeStatus("NORMAL");
        }
      } catch (err) {
        console.warn("Camera access error:", err);
        setCameraError("Camera permission denied or unavailable.");
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Frame analysis loop for head pose, gaze orientation, thumb lens blocking & missing face detection
  useEffect(() => {
    if (!cameraActive || isPaused) return;

    let faceDetector = null;
    if (typeof window !== "undefined" && "FaceDetector" in window) {
      try {
        // @ts-ignore
        faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch (e) {
        faceDetector = null;
      }
    }

    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (video.readyState !== 4) return;

      const width = canvas.width || 64;
      const height = canvas.height || 48;
      ctx.drawImage(video, 0, 0, width, height);

      let faceX = 0.5;
      let faceY = 0.5;
      let faceFound = false;
      let isCameraBlocked = false;

      // 1. Analyze Frame Luminance & Lens Coverage (Detects thumb over lens or pitch black / solid block)
      const frameData = ctx.getImageData(0, 0, width, height).data;
      let sumX = 0;
      let sumY = 0;
      let totalSkinPixels = 0;
      let totalBrightness = 0;
      let minBrightness = 255;
      let maxBrightness = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = frameData[idx];
          const g = frameData[idx + 1];
          const b = frameData[idx + 2];
          const brightness = (r + g + b) / 3;

          totalBrightness += brightness;
          if (brightness < minBrightness) minBrightness = brightness;
          if (brightness > maxBrightness) maxBrightness = brightness;

          // Multi-tier skin and human facial luminance heuristic
          const isStandardSkin = r > 45 && g > 28 && b > 18 && r > g && r > b && (r - g) > 8;
          const isLowLightSkin = r > 20 && g > 14 && b > 10 && r >= g && r >= b && (r + g + b) > 42;

          if (isStandardSkin || isLowLightSkin) {
            sumX += x;
            sumY += y;
            totalSkinPixels += 1;
          }
        }
      }

      const totalPixels = width * height;
      const avgBrightness = totalBrightness / totalPixels;
      const skinRatio = totalSkinPixels / totalPixels;
      const brightnessVariance = maxBrightness - minBrightness;

      // Lens Blocking Check:
      // A) Pitch dark / covered camera (avgBrightness < 12)
      // B) Thumb covering lens: Excessive solid skin/red flood (skinRatio > 0.78 with low brightness variance < 60)
      if (avgBrightness < 12 || (skinRatio > 0.78 && brightnessVariance < 65)) {
        isCameraBlocked = true;
        faceFound = false;
      }

      // 2. Try Native FaceDetector API if available and camera not blocked
      if (!isCameraBlocked && faceDetector) {
        try {
          const faces = await faceDetector.detect(video);
          if (faces && faces.length > 0) {
            const box = faces[0].boundingBox;
            faceX = (box.x + box.width / 2) / video.videoWidth;
            faceY = (box.y + box.height / 2) / video.videoHeight;
            faceFound = true;
          }
        } catch (e) {
          faceFound = false;
        }
      }

      // 3. Optical Center-of-Mass for face position (if faceDetector is unavailable)
      if (!isCameraBlocked && !faceFound) {
        // Face normally occupies 5% to 65% of the camera frame
        if (skinRatio >= 0.04 && skinRatio <= 0.75 && brightnessVariance >= 25) {
          faceX = sumX / totalSkinPixels / width;
          faceY = sumY / totalSkinPixels / height;
          faceFound = true;
        }
      }

      // 4. Orientation & Gaze Tolerance Analysis
      if (isCameraBlocked) {
        outOfBoundsCounterRef.current += 1;
        setGazeStatus("BLOCKED");
      } else if (!faceFound) {
        outOfBoundsCounterRef.current += 1;
        setGazeStatus("NO_FACE");
      } else {
        const deltaX = Math.abs(faceX - 0.5); // Horizontal turn
        const isLookingUp = faceY < 0.16;     // Looking too far up
        const isLookingDown = faceY > 0.62;   // Looking down at keyboard/typing (ALLOWED & SAFE)
        const isLookingFarSide = deltaX > 0.28; // Looking far left or right (>25 degrees)

        if (isLookingFarSide || isLookingUp) {
          outOfBoundsCounterRef.current += 1;
          setGazeStatus("LOOKING_AWAY");
        } else if (isLookingDown) {
          // Typing / Looking down at desk is safe
          outOfBoundsCounterRef.current = Math.max(0, outOfBoundsCounterRef.current - 1);
          setGazeStatus("LOOKING_DOWN");
        } else {
          // Centered and focused
          outOfBoundsCounterRef.current = 0;
          setGazeStatus("NORMAL");
        }
      }

      // Trigger Penalty after 3 consecutive out-of-bounds checks (~2.4s)
      if (outOfBoundsCounterRef.current >= 3) {
        const now = Date.now();
        if (now - lastPenaltyTimeRef.current > 4000) {
          lastPenaltyTimeRef.current = now;
          violationCountRef.current += 1;

          let reason = "Face not detected / Looking away (>25 degrees)";
          if (isCameraBlocked) {
            reason = "Camera blocked or covered";
          }

          if (onFocusPenalty) {
            onFocusPenalty(2, reason);
          }

          if (isCameraBlocked) {
            setWarningMessage("⚠️ Camera Blocked: Do not cover lens! (-2% Focus)");
          } else if (!faceFound) {
            setWarningMessage("⚠️ Face Missing: Look at the camera! (-2% Focus)");
          } else {
            setWarningMessage("⚠️ Focus Alert: Keep your eyes on the screen! (-2% Focus)");
          }

          setTimeout(() => setWarningMessage(""), 3000);
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [cameraActive, isPaused, onFocusPenalty]);

  const getStatusBadge = () => {
    if (!cameraActive) {
      return { text: "📷 Camera Offline", color: "#ff5252", bg: "rgba(255,82,82,0.15)" };
    }
    if (gazeStatus === "NORMAL") {
      return { text: "🟢 Focus: Centered on Screen", color: "#00e676", bg: "rgba(0,230,118,0.15)" };
    }
    if (gazeStatus === "LOOKING_DOWN") {
      return { text: "⌨️ Typing / Reading Screen (OK)", color: "#64b5f6", bg: "rgba(100,181,246,0.15)" };
    }
    if (gazeStatus === "BLOCKED") {
      return { text: "🚫 Camera Blocked / Covered", color: "#ff5252", bg: "rgba(255,82,82,0.25)" };
    }
    if (gazeStatus === "NO_FACE") {
      return { text: "🔴 Face Not in Frame", color: "#ff5252", bg: "rgba(255,82,82,0.2)" };
    }
    return { text: "⚠️ Looking Away (>25°)", color: "#ffb74d", bg: "rgba(255,183,77,0.2)" };
  };

  const badge = getStatusBadge();

  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        maxWidth: "200px"
      }}
    >
      <div
        style={{
          width: "100%",
          position: "relative",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#000",
          aspectRatio: "4/3"
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)"
          }}
        />

        {/* Hidden Canvas for Optical Image Processing */}
        <canvas ref={canvasRef} width="64" height="48" style={{ display: "none" }} />

        {/* HUD Focus Bounding Reticle */}
        {cameraActive && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              height: "65%",
              border: `2px dashed ${badge.color}`,
              borderRadius: "50%",
              pointerEvents: "none",
              transition: "border-color 0.3s ease"
            }}
          />
        )}

        {/* Active Warning Overlay */}
        {warningMessage && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(255, 82, 82, 0.9)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "bold",
              padding: "4px",
              textAlign: "center",
              animation: "fadeIn 0.2s"
            }}
          >
            {warningMessage}
          </div>
        )}
      </div>

      {/* Camera Live Status Badge */}
      <div style={{ marginTop: "8px", width: "100%" }}>
        <div
          style={{
            background: badge.bg,
            color: badge.color,
            fontSize: "11px",
            fontWeight: "bold",
            padding: "4px 8px",
            borderRadius: "6px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px"
          }}
        >
          {badge.text}
        </div>
      </div>

      {/* Proctor Integrity Meter */}
      <div style={{ width: "100%", marginTop: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#888", marginBottom: "2px" }}>
          <span>Integrity Score</span>
          <span style={{ color: integrityScore >= 80 ? "#00e676" : "#ff5252", fontWeight: "bold" }}>
            {integrityScore}%
          </span>
        </div>
        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{
              width: `${integrityScore}%`,
              height: "100%",
              background: integrityScore >= 80 ? "#00e676" : integrityScore >= 60 ? "#ffb74d" : "#ff5252",
              transition: "width 0.4s ease"
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProctorCamera;
