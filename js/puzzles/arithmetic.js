import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same, sortedKeys } from "./util.js";
import { thingById } from "../content.js";

export const meta = {
  id: "arithmetic",
  tier: 1,
  name: { et: "Liitmine ja lahutamine", en: "Add and subtract" },
  blurb: { et: "Tehted ja puuduv arv.", en: "Sums, differences and a missing number." },
};

export function capFor(level) {
  return [5, 5, 10, 12, 20][level - 1];
}

const ICONS = ["apple", "ball", "star", "flower", "bird"];

function equationPuzzle(level, seed, { a, b, op, hide, cap, pictures }) {
  const sum = op === "+" ? a + b : a - b;
  const shown = { a, op, b, sum };
  const names = { a: "a", b: "b", sum: "sum" };
  const solution = shown[hide];
  const slots = [];
  const pushVal = (key, val) => {
    if (key === hide) slots.push({ t: "blank" });
    else slots.push({ t: "n", v: val });
  };
  if (pictures) {
    slots.push({ t: "pics", icon: pictures, n: a });
    slots.push({ t: "op", v: "+" });
    slots.push({ t: "pics", icon: pictures, n: b });
    slots.push({ t: "op", v: "=" });
    slots.push({ t: "blank" });
  } else {
    pushVal("a", a);
    slots.push({ t: "op", v: op });
    pushVal("b", b);
    slots.push({ t: "op", v: "=" });
    pushVal("sum", sum);
  }
  const missing = hide !== "sum";
  return basePuzzle(meta, level, seed, {
    view: "equation",
    prompt: missing
      ? { et: "Milline arv puudub?", en: "Which number is missing?" }
      : { et: "Arvuta. Kirjuta vastus.", en: "Work it out. Write the answer." },
    hint: {
      et: op === "+" ? "Liida kaks arvu kokku." : "Lahuta väiksem arv suuremast.",
      en: op === "+" ? "Add the two numbers." : "Take the smaller number away from the larger one.",
    },
    nudge: {
      et: missing ? "Mõtle, mis arv tehte õigeks teeb." : `Proovi lugeda ${op === "+" ? "kokku" : "maha"}.`,
      en: missing ? "Think which number makes the sum true." : "Try counting it on your fingers.",
    },
    praise: { et: "Tehe on õige.", en: "The sum is right." },
    explain: {
      et: `${a} ${op} ${b} = ${sum}.`,
      en: `${a} ${op} ${b} = ${sum}.`,
    },
    slots,
    solution,
    alt: solution === 0 ? 1 : solution - 1,
    max: cap,
    op,
    crosses: op === "+" && a < 10 && b < 10 && a + b > 10,
  });
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `arith-${level}`));
  const cap = capFor(level);

  if (level === 4 && rng.chance(0.55)) {
    const used = new Set();
    const pairs = [];
    let guard = 0;
    while (pairs.length < 3 && guard++ < 40) {
      const op = rng.chance(0.5) ? "+" : "-";
      let a;
      let b;
      if (op === "+") {
        a = rng.int(0, cap);
        b = rng.int(0, cap - a);
      } else {
        a = rng.int(0, cap);
        b = rng.int(0, a);
      }
      const sum = op === "+" ? a + b : a - b;
      const label = `${a} ${op} ${b}`;
      if (used.has(label) || used.has(String(sum))) continue;
      used.add(label);
      used.add(String(sum));
      pairs.push({ label, sum });
    }
    if (pairs.length === 3 && new Set(pairs.map((p) => p.sum)).size === 3) {
      const left = pairs.map((p, i) => ({ id: `e${i}`, et: p.label, en: p.label }));
      const order = rng.shuffle(pairs.map((p, i) => i));
      const right = order.map((i) => ({ id: `a${i}`, et: String(pairs[i].sum), en: String(pairs[i].sum) }));
      const solution = sortedKeys(pairs.map((_, i) => [`e${i}`, `a${i}`]));
      const alt = sortedKeys([
        ["e0", "a1"],
        ["e1", "a0"],
        ["e2", "a2"],
      ]);
      return basePuzzle(meta, level, seed, {
        view: "match",
        prompt: { et: "Ühenda tehe vastusega.", en: "Join each sum to its answer." },
        hint: { et: "Arvuta üks tehe korraga ja tõmba joon.", en: "Work out one sum at a time, then draw the line." },
        nudge: { et: `Esimene tehe ${pairs[0].label} annab ${pairs[0].sum}.`, en: `The first sum, ${pairs[0].label}, makes ${pairs[0].sum}.` },
        praise: { et: "Kõik paarid on koos.", en: "Every pair is together." },
        explain: {
          et: pairs.map((p) => `${p.label} = ${p.sum}`).join(". ") + ".",
          en: pairs.map((p) => `${p.label} = ${p.sum}`).join(". ") + ".",
        },
        left,
        right,
        solution,
        alt,
      });
    }
  }

  for (let attempt = 0; attempt < 40; attempt++) {
    const op = level === 1 ? "+" : rng.chance(0.5) ? "+" : "-";
    let a;
    let b;
    if (op === "+") {
      if (level === 5 && rng.chance(0.45)) {
        a = rng.int(2, 9);
        const lo = Math.max(1, 11 - a);
        const hi = Math.min(9, cap - a);
        if (lo > hi) continue;
        b = rng.int(lo, hi);
        if (a + b <= 10) continue;
      } else if (level === 5) {
        a = rng.int(0, 10);
        b = rng.int(0, Math.min(10, cap - a));
        if (a + b > 10 && a < 10 && b < 10 && rng.chance(0.7)) continue;
      } else {
        a = rng.int(0, cap);
        b = rng.int(0, cap - a);
      }
    } else {
      a = rng.int(0, cap);
      b = rng.int(0, a);
    }
    const result = op === "+" ? a + b : a - b;
    if (result > cap || result < 0 || a > cap || b > cap) continue;
    let hide = "sum";
    if (level >= 3 && rng.chance(0.55)) hide = rng.pick(["a", "b", "sum"]);
    if (level < 3) hide = "sum";
    const pictures = level === 1 ? rng.pick(ICONS) : null;
    const puzzle = equationPuzzle(level, seed, { a, b, op, hide, cap, pictures });
    if (pictures) {
      const thing = thingById(pictures) || { et: "asja", en: "things" };
      puzzle.explain = {
        et: `${a} ja ${b} ${thing.et === "õun" ? "õuna" : "asja"} on kokku ${result}.`,
        en: `${a} and ${b} together make ${result}.`,
      };
    }
    return puzzle;
  }
  return equationPuzzle(level, seed, { a: 1, b: 1, op: "+", hide: "sum", cap, pictures: level === 1 ? "apple" : null });
}

export function grade(puzzle, answer) {
  if (puzzle.view === "match") return Array.isArray(answer) && same([...answer].sort(), puzzle.solution);
  return Number(answer) === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  const cap = capFor(p.level);
  if (p.view === "equation") {
    const nums = p.slots.filter((s) => s.t === "n" || s.t === "pics").map((s) => s.v ?? s.n);
    if (nums.some((n) => n < 0 || n > cap) || p.solution < 0 || p.solution > cap) errs.push("range");
    if (p.level < 5 && p.crosses) errs.push("cross");
    if (p.level === 1 && !p.slots.some((s) => s.t === "pics")) errs.push("pics");
  }
  return errs;
}
