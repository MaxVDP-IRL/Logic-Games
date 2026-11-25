import { makeRng, mixSeed } from "../rng.js";
import { PAIRS, labelOf } from "../content.js";
import { basePuzzle, same, sortedKeys } from "./util.js";

export const meta = {
  id: "matching",
  tier: 1,
  name: { et: "Paarid", en: "Matching" },
  blurb: { et: "Ühenda, mis käib kokku.", en: "Join what belongs together." },
};

const PART_WHOLE = [
  ["wheel", "car"],
  ["wing", "bird"],
  ["leaf", "tree"],
  ["apple", "tree"],
  ["key", "lock"],
];

const MOTHER = [
  ["cat", "kitten"],
  ["dog", "puppy"],
  ["cow", "calf"],
  ["bird", "nest"],
];

function board(rng, pairs, { shadow = false, text = false } = {}) {
  const left = pairs.map((p, i) => ({
    id: `l${i}`,
    icon: text ? null : labelOf(p[0]).icon,
    et: text ? p[0] : labelOf(p[0]).et,
    en: text ? p[0] : labelOf(p[0]).en,
  }));
  const order = rng.shuffle(pairs.map((_, i) => i));
  const right = order.map((i) => ({
    id: `r${i}`,
    icon: text ? null : labelOf(pairs[i][1]).icon,
    et: text ? String(pairs[i][1]) : labelOf(pairs[i][1]).et,
    en: text ? String(pairs[i][1]) : labelOf(pairs[i][1]).en,
    shadow: shadow,
  }));
  return { left, right, solution: sortedKeys(pairs.map((_, i) => [`l${i}`, `r${i}`])) };
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `match-${level}`));
  const n = level >= 4 ? 4 : 3;
  let pairs;
  let shadow = false;
  let text = false;
  let prompt = { et: "Ühenda, mis käib kokku.", en: "Join the ones that belong together." };
  if (level === 1) {
    const icons = rng.shuffle(["apple", "dog", "star", "house", "fish", "flower", "ball", "bird"]).slice(0, n);
    pairs = icons.map((id) => [id, id]);
    prompt = { et: "Ühenda samad pildid.", en: "Join the matching pictures." };
  } else if (level === 2) {
    pairs = rng.shuffle(MOTHER.concat(PAIRS.filter((p) => ["sock", "glove", "cup", "key", "rain"].includes(p.a)).map((p) => [p.a, p.b]))).slice(0, n);
  } else if (level === 3) {
    const icons = rng.shuffle(["apple", "cat", "car", "tree", "moon", "hat", "fish", "star"]).slice(0, n);
    pairs = icons.map((id) => [id, id]);
    shadow = true;
    prompt = { et: "Ühenda pilt oma varjuga.", en: "Join each picture to its shadow." };
  } else if (level === 4) {
    const used = new Set();
    pairs = [];
    while (pairs.length < n) {
      const op = rng.chance(0.5) ? "+" : "-";
      const a = rng.int(0, 12);
      const b = op === "+" ? rng.int(0, 12 - a) : rng.int(0, a);
      const sum = op === "+" ? a + b : a - b;
      const label = `${a} ${op} ${b}`;
      if (used.has(label) || [...used].includes(String(sum))) continue;
      if ([...pairs].some((p) => p[1] === sum)) continue;
      used.add(label);
      used.add(String(sum));
      pairs.push([label, sum]);
    }
    text = true;
    prompt = { et: "Ühenda tehe vastusega.", en: "Join each sum to its answer." };
  } else {
    pairs = rng.shuffle(PART_WHOLE).slice(0, n);
    prompt = { et: "Ühenda osa ja tervik.", en: "Join the part to the whole." };
  }
  const built = board(rng, pairs, { shadow, text });
  const alt = sortedKeys([
    [built.left[0].id, built.right.find((r) => r.id !== `r0`).id],
    ...built.solution.filter((k) => !k.startsWith("l0>")),
  ]);
  return basePuzzle(meta, level, seed, {
    view: "match",
    prompt,
    hint: { et: "Ühenda üks paar korraga.", en: "Join one pair at a time." },
    nudge: { et: "Alusta vasakult esimesest pildist.", en: "Start with the first picture on the left." },
    praise: { et: "Kõik paarid on koos.", en: "All the pairs are together." },
    explain: { et: "Igal vasakul pildil on üks õige paariline paremal.", en: "Each picture on the left has one partner on the right." },
    ...built,
    alt,
  });
}

export function grade(puzzle, answer) {
  return Array.isArray(answer) && same([...answer].sort(), puzzle.solution);
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.left.length !== p.right.length || p.left.length < 3) errs.push("size");
  const rights = new Set(p.solution.map((k) => k.split(">")[1]));
  if (rights.size !== p.solution.length) errs.push("dup right");
  if (p.level === 4) {
    for (const key of p.solution) {
      const [l, r] = key.split(">");
      const expr = p.left.find((x) => x.id === l).et;
      const ans = Number(p.right.find((x) => x.id === r).et);
      const [a, op, b] = expr.split(" ");
      const expect = op === "+" ? Number(a) + Number(b) : Number(a) - Number(b);
      if (expect !== ans || ans > 12 || ans < 0) errs.push("arith " + expr);
    }
  }
  return errs;
}
