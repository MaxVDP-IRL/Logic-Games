import { makeRng, mixSeed } from "../rng.js";
import { THINGS, NAMES } from "../content.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "stories",
  tier: 1,
  name: { et: "Jutuke", en: "Word problem" },
  blurb: { et: "Väike lugu arvudega.", en: "A short story with numbers." },
};

function countEt(n, thing) {
  return n === 1 ? `1 ${thing.et}` : `${n} ${thing.part}`;
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `story-${level}`));
  const thing = rng.pick(THINGS.filter((t) => ["apple", "ball", "bird", "star", "flower", "fish"].includes(t.id)));
  const who = rng.shuffle(NAMES).slice(0, 2);
  const cap = level <= 2 ? 5 : level === 5 ? 12 : level === 4 ? 12 : 10;

  let a;
  let b;
  let c = 0;
  let kind;
  if (level === 1) kind = "join";
  else if (level === 2) kind = "away";
  else if (level === 5) kind = "two";
  else if (level === 4 && rng.chance(0.55)) kind = "more";
  else kind = rng.chance(0.5) ? "join" : "away";

  if (kind === "join") {
    a = rng.int(1, Math.max(1, cap - 1));
    b = rng.int(1, cap - a);
  } else if (kind === "away") {
    a = rng.int(2, cap);
    b = rng.int(1, a - 1);
  } else if (kind === "more") {
    a = rng.int(2, cap);
    b = rng.int(1, a - 1);
  } else {
    a = rng.int(3, cap);
    b = rng.int(1, a - 1);
    const left = a - b;
    c = rng.int(1, cap - left);
  }
  const answer = kind === "join" ? a + b : kind === "away" || kind === "more" ? a - b : a - b + c;
  if (answer < 0 || answer > cap || a > cap) throw new Error("story range");

  let text;
  let scenes;
  if (kind === "join") {
    text = {
      et: `Oli ${countEt(a, thing)}. Juurde tuli ${b}. Mitu on nüüd?`,
      en: `There were ${a} ${a === 1 ? thing.en : thing.ens}. ${b} more came. How many are there now?`,
    };
    scenes = [
      { icon: thing.icon, count: a },
      { icon: thing.icon, count: b, plus: true },
    ];
  } else if (kind === "away") {
    text = {
      et: `Oli ${countEt(a, thing)}. Ära läks ${b}. Mitu on alles?`,
      en: `There were ${a} ${a === 1 ? thing.en : thing.ens}. ${b} went away. How many are left?`,
    };
    scenes = [{ icon: thing.icon, count: a }];
  } else if (kind === "more") {
    text = {
      et: `${who[0].ad} on ${countEt(a, thing)}. ${who[1].ad} on ${countEt(b, thing)}. Kui mitu rohkem on ${who[0].ad}?`,
      en: `${who[0].et} has ${a} ${a === 1 ? thing.en : thing.ens}. ${who[1].et} has ${b}. How many more does ${who[0].et} have?`,
    };
    scenes = [
      { icon: thing.icon, count: a, caption: who[0].et },
      { icon: thing.icon, count: b, caption: who[1].et },
    ];
  } else {
    text = {
      et: `Oli ${countEt(a, thing)}. Ära läks ${b}. Siis tuli ${c} juurde. Mitu on nüüd?`,
      en: `There were ${a} ${thing.ens}. ${b} went away. Then ${c} more came. How many are there now?`,
    };
    scenes = [{ icon: thing.icon, count: a }];
  }

  return basePuzzle(meta, level, seed, {
    view: "story",
    prompt: { et: "Kuula lugu. Mitu on nüüd? Kirjuta arv.", en: "Listen to the story. How many are there now? Write the number." },
    hint: {
      et: kind === "away" || kind === "more" ? "Siin võetakse ära. Lahuta." : kind === "two" ? "Tee üks samm korraga." : "Siin tuleb juurde. Liida.",
      en: kind === "away" || kind === "more" ? "Some go away. Subtract." : kind === "two" ? "Do one step at a time." : "More arrive. Add.",
    },
    nudge: {
      et: kind === "two" ? `Kõigepealt ${a} − ${b} = ${a - b}.` : `Alusta arvust ${a}.`,
      en: kind === "two" ? `First ${a} − ${b} = ${a - b}.` : `Start from ${a}.`,
    },
    praise: { et: "Lugu on lahendatud.", en: "You solved the story." },
    explain: { et: `Vastus on ${answer}.`, en: `The answer is ${answer}.` },
    text,
    scenes,
    say: text,
    solution: answer,
    alt: answer === 0 ? 1 : answer - 1,
    max: cap,
    kind,
  });
}

export function grade(puzzle, answer) {
  return Number(answer) === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  const cap = p.level <= 2 ? 5 : 12;
  if (p.solution < 0 || p.solution > cap) errs.push("range");
  if (p.level === 5 && p.kind !== "two") errs.push("two");
  if (p.level === 1 && p.kind !== "join") errs.push("join");
  if (p.level === 2 && p.kind !== "away") errs.push("away");
  if (!p.text.et || !p.text.en) errs.push("text");
  return errs;
}
