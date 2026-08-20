/**
 * Ultra-Realistic & Crystal-Clear Human Voice AI (TTS & STT)
 * Features phonetic acronym expansion, natural pauses, and studio-clarity Neural voice calibration.
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
 * High-definition Neural and Natural voices in browser
 */
function findBestVoice(isFemale) {
  const voices = window.speechSynthesis.getVoices();
  const available = voices.length > 0 ? voices : cachedVoices;

  if (available.length === 0) return null;

  if (isFemale) {
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
      "catherine"
    ];

    for (const p of priorityFemale) {
      const match = available.find(v => v.name.toLowerCase().includes(p) && v.lang.startsWith("en"));
      if (match) return match;
    }

    const genericFemale = available.find(v => v.lang.startsWith("en") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman")));
    if (genericFemale) return genericFemale;

  } else {
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
      "mark"
    ];

    for (const p of priorityMale) {
      const match = available.find(v => v.name.toLowerCase().includes(p) && v.lang.startsWith("en"));
      if (match) return match;
    }

    const genericMale = available.find(v => v.lang.startsWith("en") && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("man")));
    if (genericMale) return genericMale;
  }

  return available.find(v => v.lang.startsWith("en")) || available[0] || null;
}

/**
 * Phonetic Dictionary for Crystal-Clear Pronunciation
 * Expands technical abbreviations and acronyms that browsers mispronounce
 */
const PHONETIC_MAP = [
  [/\bDSA\b/g, "Data Structures and Algorithms"],
  [/\bDBMS\b/g, "D.B.M.S."],
  [/\bOOP\b/g, "Object Oriented Programming"],
  [/\bOOPs\b/g, "Object Oriented Programming"],
  [/\bSQL\b/g, "Sequel"],
  [/\bNoSQL\b/g, "No Sequel"],
  [/\bREST API\b/gi, "REST A.P.I."],
  [/\bAPI\b/g, "A.P.I."],
  [/\bAPIs\b/g, "A.P.I.s"],
  [/\bJWT\b/g, "J.W.T."],
  [/\bRTL\b/g, "R.T.L."],
  [/\bHDL\b/g, "H.D.L."],
  [/\bVerilog\b/gi, "Verilog"],
  [/\bFSM\b/g, "Finite State Machine"],
  [/\bFSMs\b/g, "Finite State Machines"],
  [/\bFIFO\b/g, "First In, First Out"],
  [/\bLIFO\b/g, "Last In, First Out"],
  [/\bO\(1\)/gi, "O of 1"],
  [/\bO\(n\)/gi, "O of n"],
  [/\bO\(n\^2\)/gi, "O of n squared"],
  [/\bO\(n log n\)/gi, "O of n log n"],
  [/\bO\(log n\)/gi, "O of log n"],
  [/\bUI\/UX\b/gi, "U.I. and U.X."],
  [/\bUI\b/g, "U.I."],
  [/\bUX\b/g, "U.X."],
  [/\bSTAR\b/g, "S.T.A.R."],
  [/\be\.g\.,?\b/gi, "for example,"],
  [/\bi\.e\.,?\b/gi, "that is,"],
  [/\betc\.?\b/gi, "and so on"],
  [/\bvs\.?\b/gi, "versus"],
  [/\bw\.r\.t\.?\b/gi, "with respect to"],
  [/\bAI\b/g, "A.I."],
  [/\bML\b/g, "Machine Learning"],
  [/\bNLP\b/g, "N.L.P."],
  [/\bCSE\b/g, "Computer Science"],
  [/\bECE\b/g, "Electronics and Communication"],
  [/\bMNC\b/g, "Mathematics and Computing"],
  [/\bEV\b/g, "Electric Vehicle"]
];

/**
 * Normalizes question text for ultra-clear human pronunciation and natural cadence
 */
function prepareSpeechText(text) {
  let cleaned = text
    .replace(/[`*#_~]/g, "")
    .replace(/\bQ\d+:\s*/i, "")
    .replace(/\bRound\s*\d+:\s*/i, "")
    .replace(/http\S+/g, "")
    .trim();

  // Apply Phonetic Clarifications
  PHONETIC_MAP.forEach(([regex, replacement]) => {
    cleaned = cleaned.replace(regex, replacement);
  });

  // Ensure natural punctuation pauses
  cleaned = cleaned
    .replace(/([.?!])\s*/g, "$1 ")
    .replace(/([,;:])\s*/g, "$1 ");

  return cleaned;
}

/**
 * Speaks text aloud in ultra-clear, natural human tone
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

  // Crystal-Clear Human Diction & Tempo
  if (isFemale) {
    utterance.pitch = 1.01; // Warm, natural human female pitch
    utterance.rate = 0.93;  // Deliberate, crystal-clear pacing
  } else {
    utterance.pitch = 0.98; // Grounded, executive human male pitch
    utterance.rate = 0.93;  // Deliberate, confident pacing
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

  window.speechSynthesis.speak(utterance);

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function unlockAudio() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

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

