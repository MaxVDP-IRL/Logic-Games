import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "position",
  tier: 1,
  name: { et: "Asukohasõnad", en: "Position words" },
  blurb: { et: "Peal, all, vasakul, paremal.", en: "On, under, left and right." },
};

const FIGURES = ["cat", "dog", "bird", "rabbit", "ball", "apple", "star", "flower"];

const SLOTS = [
  { id: "on-left", x: 38, y: 46, on: "table", edge: false },
  { id: "on-right", x: 62, y: 46, on: "table", edge: false },
  { id: "under", x: 50, y: 74, on: "under", edge: false },
  { id: "left", x: 16, y: 58, on: "ground", edge: false },
  { id: "right", x: 84, y: 58, on: "ground", edge: false },
  { id: "above", x: 50, y: 16, on: "above", edge: false },
  { id: "front", x: 50, y: 88, on: "front", edge: false },
  { id: "back", x: 50, y: 6, on: "back", edge: false },
  { id: "edge", x: 8, y: 18, on: "edge", edge: true },
];

function describe(slot) {
  if (slot.on === "table") return { et: "laua peal", en: "on the table" };
  if (slot.on === "under") return { et: "laua all", en: "under the table" };
  if (slot.id === "left") return { et: "lauast vasakul", en: "on the left of the table" };
  if (slot.id === "right") return { et: "lauast paremal", en: "on the right of the table" };
  if (slot.on === "above") return { et: "laua kohal", en: "above the table" };
  if (slot.on === "front") return { et: "laua ees", en: "in front of the table" };
  if (slot.on === "back") return { et: "laua taga", en: "behind the table" };
  return { et: "äärel", en: "at the edge" };
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `pos-${level}`));

  if (level === 5) {
    const icons = rng.shuffle([...FIGURES, "house"]).slice(0, 9);
    const cells = icons.map((icon, i) => ({ id: `c${i}`, icon, c: i % 3, r: Math.floor(i / 3) }));
    const steps = rng.shuffle([
      ["down", "right"],
      ["right", "down"],
      ["down", "left"],
      ["right"],
      ["down"],
    ])[0];
    for (let attempt = 0; attempt < 30; attempt++) {
      const start = cells[rng.int(0, cells.length - 1)];
      let c = start.c;
      let r = start.r;
      let ok = true;
      for (const step of steps) {
        if (step === "down") r += 1;
        if (step === "up") r -= 1;
        if (step === "left") c -= 1;
        if (step === "right") c += 1;
        if (c < 0 || r < 0 || c > 2 || r > 2) ok = false;
      }
      if (!ok) continue;
      const target = cells.find((cell) => cell.c === c && cell.r === r);
      if (!target || target.id === start.id) continue;
      const stepEt = steps
        .map((s) => ({ down: "alla", up: "üles", left: "vasakule", right: "paremale" })[s])
        .join(", siis ");
      const stepEn = steps.join(", then ");
      const names = {
        cat: ["kass", "the cat"],
        dog: ["koer", "the dog"],
        bird: ["lind", "the bird"],
        rabbit: ["jänes", "the rabbit"],
        ball: ["pall", "the ball"],
        apple: ["õun", "the apple"],
        star: ["täht", "the star"],
        flower: ["lill", "the flower"],
        house: ["maja", "the house"],
      };
      const [etName, enName] = names[start.icon];
      return basePuzzle(meta, level, seed, {
        view: "scene",
        mode: "grid",
        prompt: {
          et: `Alusta sealt, kus on ${etName}. Mine üks samm ${stepEt}. Mis seal on?`,
          en: `Start where ${enName} is. Take one step ${stepEn}. What is there?`,
        },
        hint: { et: "Liiguta sõrme ruudult ruudule. Ära hüppa diagonaalis.", en: "Move your finger from square to square. Do not jump diagonally." },
        nudge: { et: `Esimene samm on ${steps[0] === "down" ? "alla" : steps[0] === "right" ? "paremale" : steps[0] === "left" ? "vasakule" : "üles"}.`, en: `The first step is ${steps[0]}.` },
        praise: { et: "Jõudsid õigesse ruutu.", en: "You landed on the right square." },
        explain: { et: `Sealt jõuad pildini „${names[target.icon][0]}“.`, en: `That path ends on the ${names[target.icon][1]}.` },
        cells,
        solution: target.id,
        alt: start.id,
        start: start.id,
      });
    }
    throw new Error("position grid failed " + seed);
  }

  const names = { cat: "kass", dog: "koer", bird: "lind", rabbit: "jänes", ball: "pall", apple: "õun", star: "täht", flower: "lill" };
  let items;
  let phrase;
  let target;
  if (level >= 4) {
    const icons = rng.shuffle(FIGURES.filter((f) => f !== "cat"));
    const layout = [
      SLOTS.find((s) => s.id === "on-left"),
      SLOTS.find((s) => s.id === "on-right"),
      SLOTS.find((s) => s.id === "left"),
      SLOTS.find((s) => s.id === "under"),
      SLOTS.find((s) => s.id === "above"),
    ];
    const pics = ["cat", icons[0], icons[1], icons[2], icons[3]];
    items = layout.map((slot, i) => ({
      id: `o${i}`,
      icon: pics[i],
      x: slot.x,
      y: slot.y,
      slot: slot.id,
      on: slot.on,
      et: names[pics[i]],
      en: pics[i],
    }));
    // pics[0] is the cat, placed on the left of the table. Swap so the cat is on the right
    // and another object is on the left of the table: that object is left of the cat AND on the table.
    const cat = items[0];
    const other = items[1];
    cat.x = 62;
    cat.slot = "on-right";
    cat.on = "table";
    other.x = 38;
    other.slot = "on-left";
    other.on = "table";
    target = other;
    phrase = { et: "kassist vasakul ja laua peal", en: "to the left of the cat and on the table" };
  } else {
    const pool = level === 1
      ? SLOTS.filter((s) => s.id === "on-left" || s.id === "under" || s.id === "above")
      : level === 2
        ? SLOTS.filter((s) => s.id === "left" || s.id === "right" || s.id === "on-left")
        : SLOTS;
    const take = level === 1 ? rng.int(2, 3) : 4;
    const chosen = rng.shuffle(pool).slice(0, Math.min(take, pool.length));
    const icons = rng.shuffle(FIGURES);
    items = chosen.map((slot, i) => ({
      id: `o${i}`,
      icon: icons[i],
      x: slot.x,
      y: slot.y,
      slot: slot.id,
      on: slot.on,
      et: names[icons[i]],
      en: icons[i],
    }));
    const phrases = items.map((it) => ({ it, phrase: describe(SLOTS.find((s) => s.id === it.slot)) }));
    const unique = phrases.filter(({ phrase: ph, it }) => phrases.filter((p) => p.phrase.et === ph.et).length === 1 && (level < 2 || true) && it);
    const pick = unique[rng.int(0, unique.length - 1)];
    if (!pick) return generate(level, seed + 11);
    target = pick.it;
    phrase = pick.phrase;
  }

  return basePuzzle(meta, level, seed, {
    view: "scene",
    mode: "place",
    prompt: {
      et: `Mis on ${phrase.et}? Tõmba ring ümber.`,
      en: `What is ${phrase.en}? Circle it.`,
    },
    hint: { et: "Vaata lauda ja ütle asukoht endale uuesti.", en: "Look at the table and say the place again." },
    nudge: { et: `Otsi see, mis on ${phrase.et}.`, en: `Look for the one ${phrase.en}.` },
    praise: { et: "Õige koht.", en: "The right place." },
    explain: { et: `${target.et} on ${phrase.et}.`, en: `The ${target.en} is ${phrase.en}.` },
    items,
    solution: target.id,
    alt: items.find((it) => it.id !== target.id).id,
    phrase: phrase.et,
  });
}

export function grade(puzzle, answer) {
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.mode === "grid") {
    const byId = Object.fromEntries(p.cells.map((c) => [c.id, c]));
    if (p.solution === p.start) errs.push("same");
    const goal = byId[p.solution];
    const start = byId[p.start];
    if (!goal || !start) errs.push("ids");
    if (goal && (goal.c < 0 || goal.c > 2 || goal.r < 0 || goal.r > 2)) errs.push("bounds");
  } else if (new Set(p.items.map((i) => i.slot)).size !== p.items.length) errs.push("slots");
  return errs;
}
