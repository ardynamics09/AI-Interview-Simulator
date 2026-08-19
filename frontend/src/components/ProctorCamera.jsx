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
  const [gazeStatus, setGazeStatus] = useState("CALIBRATING"); // "NORMAL", "LOOKING_AWAY", "NO_FACE", "LOOKING_DOWN"
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

  // Frame analysis loop for head pose and gaze orientation
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

      // 1. Try Native FaceDetector API if available
      if (faceDetector) {
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

      // 2. Optical Center-of-Mass fallback (skin-tone & brightness luminance distribution)
      if (!faceFound) {
        const frameData = ctx.getImageData(0, 0, width, height).data;
        let sumX = 0;
        let sumY = 0;
        let totalWeight = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = frameData[idx];
            const g = frameData[idx + 1];
            const b = frameData[idx + 2];

            // Skin / facial luminance heuristic
            const isSkin = r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 12;
            if (isSkin) {
              sumX += x;
              sumY += y;
              totalWeight += 1;
            }
          }
        }

        if (totalWeight > width * height * 0.05) {
          faceX = sumX / totalWeight / width;
          faceY = sumY / totalWeight / height;
          faceFound = true;
        }
      }

      // 3. Orientation & Gaze Tolerance Analysis (~15 degrees offset)
      // Center is around x: 0.5, y: 0.5
      // 15 degrees angle corresponds to ~0.16 deviation from center.
      // Looking DOWN (faceY > 0.65) is permitted for typing on keyboard.
      if (!faceFound) {
        outOfBoundsCounterRef.current += 1;
        setGazeStatus("NO_FACE");
      } else {
        const deltaX = Math.abs(faceX - 0.5); // Horizontal turn (Left / Right)
        const isLookingUp = faceY < 0.16;     // Looking too far UP (>25 degrees)
        const isLookingDown = faceY > 0.62;   // Looking down at keyboard (ALLOWED!)
        const isLookingFarSide = deltaX > 0.26; // Looking too far LEFT or RIGHT (>25 degrees)

        if (isLookingFarSide || isLookingUp) {
          outOfBoundsCounterRef.current += 1;
          setGazeStatus("LOOKING_AWAY");
        } else if (isLookingDown) {
          // Looking down at keyboard is safe & allowed
          outOfBoundsCounterRef.current = Math.max(0, outOfBoundsCounterRef.current - 1);
          setGazeStatus("LOOKING_DOWN");
        } else {
          // Centered and focused
          outOfBoundsCounterRef.current = 0;
          setGazeStatus("NORMAL");
        }
      }

      // Deduct 2% focus points if out of bounds for > 3 consecutive checks (~2.4s)
      if (outOfBoundsCounterRef.current >= 3) {
        const now = Date.now();
        // Cooldown of 4 seconds between penalties
        if (now - lastPenaltyTimeRef.current > 4000) {
          lastPenaltyTimeRef.current = now;
          violationCountRef.current += 1;

          if (onFocusPenalty) {
            onFocusPenalty(2, "Gaze or head orientation deviated beyond 25 degrees");
          }

          setWarningMessage("⚠️ Focus Alert: Keep your eyes on the screen! (-2% Focus)");
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
      return { text: "🟢 Focus: Locked on Screen", color: "#00e676", bg: "rgba(0,230,118,0.15)" };
    }
    if (gazeStatus === "LOOKING_DOWN") {
      return { text: "⌨️ Typing / Reading Screen (OK)", color: "#64b5f6", bg: "rgba(100,181,246,0.15)" };
    }
    if (gazeStatus === "NO_FACE") {
      return { text: "🔴 Face Not Centered", color: "#ff5252", bg: "rgba(255,82,82,0.2)" };
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
      {/* CAMERA PREVIEW */}
      <div
        style={{
          width: "160px",
          height: "115px",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#000",
          position: "relative",
          border: gazeStatus === "LOOKING_AWAY" ? "2px solid #ff9800" : (gazeStatus === "NO_FACE" ? "2px solid #ff5252" : "1px solid #333")
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
            transform: "scaleX(-1)" // Mirror view
          }}
        />

        {/* Hidden sampling canvas */}
        <canvas ref={canvasRef} width="64" height="48" style={{ display: "none" }} />

        {/* AI Proctor HUD Overlay */}
        <div
          style={{
            position: "absolute",
            top: "4px",
            left: "6px",
            fontSize: "10px",
            color: "#fff",
            background: "rgba(0,0,0,0.6)",
            padding: "1px 5px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "3px"
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cameraActive ? "#00e676" : "#ff5252" }}></span>
          AI Proctor
        </div>
      </div>

      {/* STATUS BADGE */}
      <div
        style={{
          marginTop: "8px",
          fontSize: "11px",
          fontWeight: "600",
          color: badge.color,
          background: badge.bg,
          padding: "3px 8px",
          borderRadius: "10px",
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        {badge.text}
      </div>

      {/* REAL-TIME WARNING TOAST */}
      {warningMessage && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            color: "#ff5252",
            fontWeight: "bold",
            textAlign: "center",
            animation: "fadeIn 0.2s ease"
          }}
        >
          {warningMessage}
        </div>
      )}

      {cameraError && (
        <span style={{ fontSize: "10px", color: "#ff5252", marginTop: "4px", textAlign: "center" }}>
          {cameraError}
        </span>
      )}
    </div>
  );
}

export default ProctorCamera;
