/**
 * Ultra-Realistic Human Voice AI Audio Utilities (TTS & STT)
 * Prioritizes high-fidelity Neural and Natural voices in Chrome, Edge, Safari and Firefox.
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
 * Finds the most natural, human-sounding voice available in the client browser
 */
function findBestVoice(isFemale) {
  const voices = window.speechSynthesis.getVoices();
  const available = voices.length > 0 ? voices : cachedVoices;

  if (available.length === 0) return null;

  if (isFemale) {
    // 1. Natural / Neural High-Def Female Voices
    const priorityFemale = [
      "microsoft jenny online (natural)",
      "microsoft aria online (natural)",
      "microsoft ava online (natural)",
      "microsoft emma online (natural)",
      "google uk english female",
      "google us english",
      "samantha",
      "karen",
      "victoria",
      "zira",
      "catherine",
      "fiona",
      "veena"
    ];

    for (const p of priorityFemale) {
      const match = available.find(v => v.name.toLowerCase().includes(p) && v.lang.startsWith("en"));
      if (match) return match;
    }

    // Generic English Female Fallback
    const genericFemale = available.find(v => v.lang.startsWith("en") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman")));
    if (genericFemale) return genericFemale;

  } else {
    // 1. Natural / Neural High-Def Male Voices
    const priorityMale = [
      "microsoft guy online (natural)",
      "microsoft christopher online (natural)",
      "microsoft ryan online (natural)",
      "microsoft andrew online (natural)",
      "microsoft brian online (natural)",
      "google uk english male",
      "google us english",
      "alex",
      "daniel",
      "david",
      "george",
      "mark",
      "oliver",
      "rishi"
    ];

    for (const p of priorityMale) {
      const match = available.find(v => v.name.toLowerCase().includes(p) && v.lang.startsWith("en"));
      if (match) return match;
    }

    // Generic English Male Fallback
    const genericMale = available.find(v => v.lang.startsWith("en") && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("man")));
    if (genericMale) return genericMale;
  }

  // Any English voice fallback
  return available.find(v => v.lang.startsWith("en")) || available[0] || null;
}

/**
 * Normalizes question text into clean, conversational human speech with natural cadence
 */
function prepareSpeechText(text) {
  return text
    .replace(/[`*#_~]/g, "")
    .replace(/Q\d+:\s*/i, "")
    .replace(/Round\s*\d+:\s*/i, "")
    .replace(/http\S+/g, "")
    .replace(/([.?!])\s+/g, "$1 ")
    .trim();
}

/**
 * Speaks text aloud in ultra-realistic human male or female tone
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

  // Cancel any ongoing speech & resume paused audio contexts
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  if (!text || text.trim().length === 0) {
    if (onEnd) onEnd();
    return;
  }

  const cleanText = prepareSpeechText(text);
  const isFemale = gender.toLowerCase() === "female";

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Natural Human Conversational Acoustics
  if (isFemale) {
    utterance.pitch = 1.02; // Warm, professional human female pitch
    utterance.rate = 0.96;  // Clear, thoughtful pacing
  } else {
    utterance.pitch = 0.98; // Grounded, professional human male pitch
    utterance.rate = 0.96;  // Clear, confident pacing
  }

  const selectedVoice = findBestVoice(isFemale);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || "en-US";
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      onEnd();
    };
  }

  // Speak with browser resume lock
  window.speechSynthesis.speak(utterance);

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
