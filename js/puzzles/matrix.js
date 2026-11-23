import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "matrix",
  tier: 3,
  name: { et: "Puuduv kujund", en: "Missing shape" },
  blurb: { et: "Leia kujund, mis reegliga sobib.", en: "Find the shape that fits the rule." },
};

const SHAPES = ["circle", "triangle", "square"];
const PATTERNS = ["plain", "stripe", "dot"];

function cell(shape, pattern, turn = 0) {
  return { shape, pattern, turn };
}

function key(c) {
  return c ? `${c.shape}:${c.pattern}:${c.turn || 0}` : "null";
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `matrix-${level}`));
  const shapeRow = rng.shuffle(SHAPES);
  const pats = rng.shuffle(PATTERNS);

  let grid;
  let answer;
  if (level === 1) {
    const s1 = shapeRow[0];
    const s2 = shapeRow[1];
    const p1 = pats[0];
    const p2 = pats[1];
    grid = [
      [cell(s1, p1), cell(s1, p2)],
      [cell(s2, p1), null],
    ];
    answer = cell(s2, p2);
  } else if (level === 2) {
    const s1 = shapeRow[0];
    const s2 = shapeRow[1];
    const p1 = pats[0];
    const p2 = pats[1];
    grid = [
      [cell(s1, p1), cell(s2, p1)],
      [cell(s1, p2), null],
    ];
    answer = cell(s2, p2);
  } else if (level === 5) {
    const s = shapeRow[0];
    grid = [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : cell(s, "plain", (r + c) % 4))));
    answer = cell(s, "plain", (2 + 2) % 4);
  } else {
    const size = 3;
    grid = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => {
      if (r === size - 1 && c === size - 1) return null;
      return cell(shapeRow[c % shapeRow.length], level === 4 ? pats[r % pats.length] : pats[0], 0);
    }));
    answer = cell(shapeRow[(size - 1) % shapeRow.length], level === 4 ? pats[(size - 1) % pats.length] : pats[0], 0);
  }

  const distractors = [];
  const push = (c) => {
    if (!c || key(c) === key(answer)) return;
    if (distractors.some((d) => key(d) === key(c))) return;
    distractors.push(c);
  };
  push(cell(answer.shape, pats.find((p) => p !== answer.pattern) || "dot", answer.turn));
  push(cell(SHAPES.find((s) => s !== answer.shape) || "triangle", answer.pattern, answer.turn));
  if (level === 5) push(cell(answer.shape, answer.pattern, (answer.turn + 1) % 4));
  push(cell("square", "stripe", 0));
  let guard = 0;
  while (distractors.length < 3 && guard++ < 30) push(cell(rng.pick(SHAPES), rng.pick(PATTERNS), level === 5 ? rng.int(0, 3) : 0));

  const options = rng.shuffle([answer, ...distractors.slice(0, 3)]);
  const solution = options.findIndex((o) => key(o) === key(answer));
  const fitting = options.filter((o) => fits(grid, o, level));
  if (fitting.length !== 1) return generate(level, seed + 6);

  return basePuzzle(meta, level, seed, {
    view: "matrix",
    prompt: { et: "Leia puuduv kujund.", en: "Find the missing shape." },
    hint: { et: "Vaata, mis reas kordub ja mis veerus muutub.", en: "See what repeats in the row and what changes in the column." },
    nudge: { et: "Õige pilt peab sobima nii oma rea kui oma veeruga.", en: "The right picture has to fit both its row and its column." },
    praise: { et: "Puuduv kujund on leitud.", en: "You found the missing shape." },
    explain: { et: "Rida ja veerg ütlevad koos, milline kujund puudub.", en: "The row and the column together say which shape is missing." },
    grid,
    options,
    solution,
    alt: (solution + 1) % options.length,
    rule: level,
  });
}

export function fits(grid, candidate, level) {
  const g = grid.map((row) => row.slice());
  let hr = 0;
  let hc = 0;
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[r].length; c++) {
      if (!g[r][c]) {
        hr = r;
        hc = c;
        g[r][c] = candidate;
      }
    }
  }
  if (level === 5) {
    return g.every((row, r) => row.every((cell, c) => cell.turn === (r + c) % 4 && cell.shape === g[0][0].shape && cell.pattern === "plain"));
  }
  if (level === 4) {
    return g.every((row) => row.every((cell) => cell.pattern === row[0].pattern))
      && g[0].every((_, c) => g.every((row) => row[c].shape === g[0][c].shape));
  }
  if (level === 3) {
    return g.every((row) => row.every((cell) => cell.pattern === g[0][0].pattern))
      && g[0].every((_, c) => g.every((row) => row[c].shape === g[0][c].shape));
  }
  // 2x2: shape constant down a column? Level 1: row shape constant, column pattern constant.
  if (level === 1) {
    return g.every((row) => row.every((cell) => cell.shape === row[0].shape))
      && g[0].every((_, c) => g.every((row) => row[c].pattern === g[0][c].pattern));
  }
  const shapeDown = g.every((row, r) => row.every((cell, c) => cell.shape === g[0][c].shape));
  const patternAcross = g.every((row) => row.every((cell) => cell.pattern === row[0].pattern));
  return shapeDown && patternAcross;
}

export function grade(puzzle, answer) {
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  const hits = p.options.filter((o) => fits(p.grid, o, p.level));
  if (hits.length !== 1 || key(hits[0]) !== key(p.options[p.solution])) errs.push("fit");
  if (p.level <= 2 && p.grid.length !== 2) errs.push("size");
  if (p.level >= 3 && p.level <= 5 && p.grid.length !== 3) errs.push("size3");
  return errs;
}
