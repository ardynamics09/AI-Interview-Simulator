/**
 * Voice Audio Utilities (TTS & STT)
 * Uses native Web Speech API for zero-latency in-browser Speech Synthesis & Recognition
 */

let cachedVoices = [];

function loadVoices() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (cachedVoices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }
}

if (typeof window !== "undefined") {
  loadVoices();
}

/**
 * Speaks text aloud in male or female voice with robust browser autoplay unlock
 * @param {string} text - Text to speak
 * @param {'male' | 'female'} gender - Desired voice gender
 * @param {Function} [onStart] - Callback when speech starts
 * @param {Function} [onEnd] - Callback when speech finishes
 */
export function speakText(text, gender = "male", onStart, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech & resume paused state
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  if (!text || text.trim().length === 0) {
    if (onEnd) onEnd();
    return;
  }

  // Strip markdown symbols and backticks for clean speech
  const cleanText = text
    .replace(/[`*#_~]/g, "")
    .replace(/\bQ\d+:\s*/i, "")
    .replace(/\bRound\s*\d+:\s*/i, "")
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.98;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }

  const isFemale = gender.toLowerCase() === "female";

  if (isFemale) {
    utterance.pitch = 1.15;
    const femaleVoice = cachedVoices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes("female") ||
        name.includes("zira") ||
        name.includes("samantha") ||
        name.includes("victoria") ||
        name.includes("karen") ||
        name.includes("catherine") ||
        name.includes("heera") ||
        name.includes("google uk english female")
      );
    });
    if (femaleVoice) utterance.voice = femaleVoice;
  } else {
    utterance.pitch = 0.92;
    const maleVoice = cachedVoices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes("male") ||
        name.includes("david") ||
        name.includes("george") ||
        name.includes("mark") ||
        name.includes("alex") ||
        name.includes("guy") ||
        name.includes("google us english") ||
        name.includes("google uk english male")
      );
    });
    if (maleVoice) utterance.voice = maleVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      onEnd();
    };
  }

  // Ensure speech synthesis is active
  window.speechSynthesis.speak(utterance);

  // Chrome bug fix: sometimes speechSynthesis pauses after speaking
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

/**
 * Stops all speech synthesis
 */
export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Unlocks audio context on initial page load / user interaction
 */
export function unlockAudio() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

/**
 * Speech to Text (STT) Recognition Hook / Manager
 */
export function createSpeechRecognizer({ onResult, onStateChange, onError }) {
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  if (!SpeechRecognition) {
    return {
      isSupported: false,
      start: () => {
        if (onError) onError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      },
      stop: () => {}
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let isListening = false;

  recognition.onstart = () => {
    isListening = true;
    if (onStateChange) onStateChange(true);
  };

  recognition.onend = () => {
    isListening = false;
    if (onStateChange) onStateChange(false);
  };

  recognition.onerror = (event) => {
    console.warn("STT Error:", event.error);
    isListening = false;
    if (onStateChange) onStateChange(false);
    if (onError) onError(event.error);
  };

  recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const trans = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += trans + " ";
      } else {
        interimTranscript += trans;
      }
    }

    if (onResult) {
      onResult({
        finalText: finalTranscript,
        interimText: interimTranscript
      });
    }
  };

  return {
    isSupported: true,
    start: () => {
      try {
        if (!isListening) recognition.start();
      } catch (err) {
        console.warn("Recognition start error:", err);
      }
    },
    stop: () => {
      try {
        if (isListening) recognition.stop();
      } catch (err) {
        console.warn("Recognition stop error:", err);
      }
    },
    get isListening() {
      return isListening;
    }
  };
}
