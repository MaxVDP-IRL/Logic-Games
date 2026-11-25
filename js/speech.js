/** Read instructions aloud. Prefer et-EE, otherwise an English voice. */

let cached = [];

function voices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const list = window.speechSynthesis.getVoices();
  if (list.length) cached = list;
  return cached.length ? cached : list;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cached = window.speechSynthesis.getVoices();
  });
}

export function pickVoice(lang) {
  const list = voices();
  const et = list.find((v) => /^et([-_]|$)/i.test(v.lang));
  const en = list.find((v) => /^en([-_]|$)/i.test(v.lang));
  if (lang === "et" && et) return { voice: et, lang: et.lang, fallback: false };
  if (lang !== "et" && en) return { voice: en, lang: en.lang, fallback: false };
  if (en) return { voice: en, lang: en.lang, fallback: lang === "et" };
  if (list[0]) return { voice: list[0], lang: list[0].lang, fallback: true };
  return { voice: null, lang: lang === "et" ? "et-EE" : "en-GB", fallback: lang === "et" };
}

export function speak(text, lang, { onWord } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return false;
  const synth = window.speechSynthesis;
  const chosen = pickVoice(lang);
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = chosen.lang;
  if (chosen.voice) utter.voice = chosen.voice;
  utter.rate = 0.92;
  utter.pitch = 1.02;
  if (onWord) {
    utter.onboundary = (event) => {
      if (event.name && event.name !== "word") return;
      onWord(event.charIndex || 0, event.charLength || 0);
    };
  }
  synth.cancel();
  synth.speak(utter);
  return true;
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}
