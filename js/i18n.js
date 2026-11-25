export const UI = {
  hello: { et: "Tere, Mia!", en: "Hello, Mia!" },
  stickerGoal: {
    et: "Tee {n} ülesannet ja saad kleepsu.",
    en: "Finish {n} puzzles to win a sticker.",
  },
  progressSay: {
    et: "Tehtud on {have}. Kokku on {n}.",
    en: "{have} done. {n} in all.",
  },
  levelNeed: {
    et: "Uueks tasemeks on vaja {n}.",
    en: "A new level needs {n}.",
  },
  levelSay: {
    et: "Uue taseme poole on {have}. Vaja on {n}.",
    en: "{have} toward the next level. {n} are needed.",
  },
  sessionDone: {
    et: "{n} ülesannet on tehtud. Said kleepsu.",
    en: "{n} puzzles done. You got a sticker.",
  },
  sessionDoneStar: {
    et: "{n} ülesannet on tehtud. Said kuldse tähe.",
    en: "{n} puzzles done. You got a gold star.",
  },
  meterSticker: { et: "kleeps", en: "sticker" },
  meterLevel: { et: "tase", en: "level" },
  start: { et: "Hakkame pihta", en: "Let’s begin" },
  pick: { et: "Vali ülesanne", en: "Choose a puzzle" },
  stickers: { et: "Kleebiseraamat", en: "Sticker book" },
  how: { et: "Kuidas läheb", en: "How it’s going" },
  parent: {
    et: "See on rahulik harjutamine, mitte koolikatse.",
    en: "This is calm practice, not a school test.",
  },
  listen: { et: "Kuula", en: "Listen" },
  hint: { et: "Vihje", en: "Hint" },
  done: { et: "Valmis", en: "Done" },
  try: { et: "Proovin ise", en: "I’ll try" },
  next: { et: "Edasi", en: "Next" },
  again: { et: "Proovi veel", en: "Try again" },
  quit: { et: "Lõpeta", en: "Finish" },
  home: { et: "Avaleht", en: "Home" },
  back: { et: "Tagasi", en: "Back" },
  example: { et: "Vaata, kuidas see käib", en: "Watch how this works" },
  guided: { et: "Esimene samm on ees", en: "The first step is ready" },
  oneMore: { et: "Veel üks", en: "One more" },
  enough: { et: "Aitab tänaseks", en: "That’s enough for today" },
  bye: { et: "Nägemiseni! Jätkame teinekord.", en: "See you soon. We’ll carry on another time." },
  almost: { et: "Peaaegu. Proovi veel.", en: "Almost. Have another go." },
  yes: { et: "Jah", en: "Yes" },
  no: { et: "Ei", en: "No" },
  equal: { et: "võrdselt", en: "the same" },
  level: { et: "Tase", en: "Level" },
  now: { et: "praegu", en: "now" },
  emptyBook: {
    et: "Kleeps tuleb siia, kui 6 ülesannet on tehtud.",
    en: "A sticker comes here when 6 puzzles are finished.",
  },
  newSticker: { et: "Uus kleeps raamatusse.", en: "A new sticker for the book." },
  bookFull: { et: "Raamat on täis. Said kuldse tähe.", en: "The book is full. You got a gold star." },
  sessionPraise: { et: "Ilus harjutus.", en: "A good practice." },
  effort: { et: "Sa jäid proovima. See ongi nuputamine.", en: "You kept trying. That is what puzzling is." },
  levelUp: { et: "Uus tase", en: "A new level" },
  minutes: { et: "min", en: "min" },
  typesTitle: { et: "Ülesanded", en: "Puzzles" },
  playThis: { et: "Tee see", en: "Do this one" },
  another: { et: "Järgmine", en: "Another" },
  show: { et: "Näita", en: "Show me" },
  seen: { et: "Vaata veel korra", en: "Look once more" },
  remember: { et: "Hoia meeles…", en: "Hold it in your mind…" },
  place: { et: "Puuduta kasti, kuhu see käib.", en: "Tap the box where it belongs." },
  clear: { et: "Kustuta", en: "Clear" },
  auto: { et: "Hääl", en: "Voice" },
};

export function tx(key, lang) {
  const row = UI[key];
  if (!row) return key;
  return row[lang] || row.et;
}

export function txf(key, lang, vars = {}) {
  let text = tx(key, lang);
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}
