import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "sudoku",
  tier: 2,
  name: { et: "Sudoku", en: "Sudoku" },
  blurb: { et: "Iga pilt üks kord reas ja veerus.", en: "Each picture once in every row and column." },
};

const BASE4 = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

function clone(g) {
  return g.map((r) => r.slice());
}

function swapRows(g, a, b) {
  const n = clone(g);
  [n[a], n[b]] = [n[b], n[a]];
  return n;
}

function swapCols(g, a, b) {
  return g.map((r) => {
    const n = r.slice();
    [n[a], n[b]] = [n[b], n[a]];
    return n;
  });
}

export function candidates(grid, size, r, c) {
  const used = new Set();
  for (let i = 0; i < size; i++) {
    if (grid[r][i] != null) used.add(grid[r][i]);
    if (grid[i][c] != null) used.add(grid[i][c]);
  }
  if (size === 4) {
    const br = Math.floor(r / 2) * 2;
    const bc = Math.floor(c / 2) * 2;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const v = grid[br + i][bc + j];
        if (v != null) used.add(v);
      }
    }
  }
  const all = size === 2 ? [1, 2] : [1, 2, 3, 4];
  return all.filter((v) => !used.has(v));
}

function units(size) {
  const list = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    const col = [];
    for (let j = 0; j < size; j++) {
      row.push([i, j]);
      col.push([j, i]);
    }
    list.push(row, col);
  }
  if (size === 4) {
    for (let br = 0; br < 4; br += 2) {
      for (let bc = 0; bc < 4; bc += 2) {
        const block = [];
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) block.push([br + i, bc + j]);
        list.push(block);
      }
    }
  }
  return list;
}

/** Fill only naked singles and hidden singles. */
export function elementary(grid, size) {
  const g = clone(grid);
  const all = size === 2 ? [1, 2] : [1, 2, 3, 4];
  let guard = 0;
  while (guard++ < 80) {
    let progress = false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (g[r][c] != null) continue;
        const cand = candidates(g, size, r, c);
        if (cand.length === 1) {
          g[r][c] = cand[0];
          progress = true;
        }
      }
    }
    for (const unit of units(size)) {
      for (const n of all) {
        const places = unit.filter(([r, c]) => g[r][c] == null && candidates(g, size, r, c).includes(n));
        if (places.length === 1) {
          const [r, c] = places[0];
          g[r][c] = n;
          progress = true;
        }
      }
    }
    if (!progress) break;
  }
  const solved = g.every((row) => row.every((v) => v != null));
  return { solved, grid: g };
}

export function countSolutions(grid, size, limit = 2) {
  const g = clone(grid);
  let n = 0;
  function walk() {
    if (n >= limit) return;
    let best = null;
    let bestCand = null;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (g[r][c] != null) continue;
        const cand = candidates(g, size, r, c);
        if (best == null || cand.length < bestCand.length) {
          best = [r, c];
          bestCand = cand;
        }
      }
    }
    if (!best) {
      n++;
      return;
    }
    if (bestCand.length === 0) return;
    const [r, c] = best;
    for (const v of bestCand) {
      g[r][c] = v;
      walk();
      g[r][c] = null;
      if (n >= limit) return;
    }
  }
  walk();
  return n;
}

function transformed(rng) {
  let g = clone(BASE4);
  const perm = rng.shuffle([1, 2, 3, 4]);
  g = g.map((r) => r.map((v) => perm[v - 1]));
  if (rng.chance(0.5)) g = swapRows(g, 0, 1);
  if (rng.chance(0.5)) g = swapRows(g, 2, 3);
  if (rng.chance(0.5)) g = [...g.slice(2, 4), ...g.slice(0, 2)];
  if (rng.chance(0.5)) g = swapCols(g, 0, 1);
  if (rng.chance(0.5)) g = swapCols(g, 2, 3);
  if (rng.chance(0.5)) g = g.map((r) => [r[2], r[3], r[0], r[1]]);
  if (rng.chance(0.5)) g = g[0].map((_, c) => g.map((r) => r[c]));
  return g;
}

function punch(solution, rng, minEmpty, maxEmpty) {
  const size = solution.length;
  let clues = clone(solution);
  const cells = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) cells.push([r, c]);
  for (const [r, c] of rng.shuffle(cells)) {
    const empty = clues.flat().filter((v) => v == null).length;
    if (empty >= maxEmpty) break;
    const keep = clues[r][c];
    clues[r][c] = null;
    const solved = elementary(clues, size);
    if (!solved.solved || !same(solved.grid, solution)) clues[r][c] = keep;
  }
  const empty = clues.flat().filter((v) => v == null).length;
  if (empty < minEmpty) return null;
  return clues;
}

const PICTURES = [
  { id: 1, icon: "cat" },
  { id: 2, icon: "dog" },
  { id: 3, icon: "bird" },
  { id: 4, icon: "fish" },
];

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `sudoku-${level}`));
  if (level <= 2) {
    let grid = rng.chance(0.5)
      ? [[1, 2], [2, 1]]
      : [[2, 1], [1, 2]];
    const clues = clone(grid);
    const cells = rng.shuffle([[0, 0], [0, 1], [1, 0], [1, 1]]);
    const blanks = level === 1 ? 1 : 2;
    for (let i = 0; i < blanks; i++) clues[cells[i][0]][cells[i][1]] = null;
    const symbols = PICTURES.slice(0, 2);
    return finish(level, seed, clues, grid, symbols, false);
  }

  const [minE, maxE] = level === 3 ? [4, 5] : level === 4 ? [6, 8] : [8, 10];
  for (let attempt = 0; attempt < 80; attempt++) {
    const solution = transformed(rng);
    const clues = punch(solution, rng, minE, maxE);
    if (!clues) continue;
    const symbols = level === 3 ? PICTURES.slice() : [1, 2, 3, 4].map((n) => ({ id: n, text: String(n) }));
    return finish(level, seed, clues, solution, symbols, true);
  }
  throw new Error("sudoku generation failed " + seed);
}

function finish(level, seed, clues, solution, symbols, regions) {
  const alt = clone(solution);
  for (let r = 0; r < alt.length; r++) {
    for (let c = 0; c < alt.length; c++) {
      if (clues[r][c] == null) {
        alt[r][c] = alt[r][c] === 1 ? 2 : 1;
        break;
      }
    }
  }
  const block = regions
    ? {
        et: " Igas reas, veerus ja väikeses 2×2 kastis tohib iga märk olla ainult üks kord.",
        en: " Each mark may appear only once in every row, every column and every small 2×2 block.",
      }
    : {
        et: " Igas reas ja veerus tohib iga pilt olla ainult üks kord.",
        en: " Each picture may appear only once in every row and every column.",
      };
  return basePuzzle(meta, level, seed, {
    view: "sudoku",
    prompt: { et: `Mis kuulub tühja kasti?${block.et}`, en: `What belongs in the empty box?${block.en}` },
    hint: {
      et: "Vaata, mis selles reas ja veerus juba on.",
      en: "Look at what is already in that row and column.",
    },
    nudge: {
      et: regions ? "Vaata ka väikest 2×2 kasti." : "Tühjas kastis saab olla ainult see, mida reas veel ei ole.",
      en: regions ? "Look at the small 2×2 block as well." : "The empty box can only be what is still missing in the row.",
    },
    praise: { et: "Iga märk on omal kohal.", en: "Every mark is in its place." },
    explain: {
      et: "Kui reas on üks märk juba olemas, ei tohi seda sinna uuesti panna.",
      en: "If a row already has a mark, you cannot put it there again.",
    },
    size: solution.length,
    regions,
    symbols,
    clues,
    solution,
    alt,
  });
}

export function grade(puzzle, answer) {
  return Array.isArray(answer) && same(answer, puzzle.solution);
}

export function isLatin(grid, regions) {
  const n = grid.length;
  for (let i = 0; i < n; i++) {
    const row = new Set(grid[i]);
    const col = new Set(grid.map((r) => r[i]));
    if (row.size !== n || col.size !== n) return false;
  }
  if (regions) {
    for (let br = 0; br < n; br += 2) {
      for (let bc = 0; bc < n; bc += 2) {
        const s = new Set();
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) s.add(grid[br + i][bc + j]);
        if (s.size !== 4) return false;
      }
    }
  }
  return true;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (!isLatin(p.solution, p.regions)) errs.push("latin");
  const solved = elementary(p.clues, p.size);
  if (!solved.solved || !same(solved.grid, p.solution)) errs.push("elementary");
  if (countSolutions(p.clues, p.size, 2) !== 1) errs.push("unique");
  const empty = p.clues.flat().filter((v) => v == null).length;
  if (p.level === 1 && (p.size !== 2 || empty !== 1)) errs.push("l1");
  if (p.level === 2 && (p.size !== 2 || empty !== 2)) errs.push("l2");
  if (p.level >= 3 && p.size !== 4) errs.push("size");
  if (p.level === 3 && (empty < 4 || empty > 5)) errs.push("l3 empty");
  if (p.level === 4 && (empty < 6 || empty > 8)) errs.push("l4 empty");
  if (p.level === 5 && (empty < 8 || empty > 10)) errs.push("l5 empty");
  return errs;
}
