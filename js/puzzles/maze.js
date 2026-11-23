import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "maze",
  tier: 2,
  name: { et: "Labürint", en: "Maze" },
  blurb: { et: "Leia tee koju.", en: "Find the way home." },
};

function key(c, r) {
  return `${c},${r}`;
}

function neighbors(c, r) {
  return [
    [c + 1, r],
    [c - 1, r],
    [c, r + 1],
    [c, r - 1],
  ];
}

export function canStep(puzzle, a, b) {
  if (!a || !b) return false;
  const dc = Math.abs(a.c - b.c);
  const dr = Math.abs(a.r - b.r);
  if (dc + dr !== 1) return false;
  if (puzzle.kind === "walls") {
    if (a.r === b.r && b.c === a.c + 1) return !puzzle.vWall[a.r][a.c + 1];
    if (a.r === b.r && b.c === a.c - 1) return !puzzle.vWall[a.r][a.c];
    if (a.c === b.c && b.r === a.r + 1) return !puzzle.hWall[a.r + 1][a.c];
    if (a.c === b.c && b.r === a.r - 1) return !puzzle.hWall[a.r][a.c];
    return false;
  }
  const sb = puzzle.symbols[key(b.c, b.r)];
  if (!ruleOk(puzzle.rule, sb)) return false;
  const sa = puzzle.symbols[key(a.c, a.r)];
  return ruleOk(puzzle.rule, sa);
}

function ruleOk(rule, symbol) {
  if (rule === "even") return typeof symbol === "number" && symbol % 2 === 0;
  if (rule === "circle") return symbol === "circle";
  return true;
}

export function countPaths(puzzle, limit = 2) {
  let n = 0;
  function walk(c, r, seen) {
    if (n >= limit) return;
    const k = key(c, r);
    if (seen.has(k)) return;
    if (c === puzzle.end.c && r === puzzle.end.r) {
      n++;
      return;
    }
    seen.add(k);
    for (const [nc, nr] of neighbors(c, r)) {
      if (nc < 0 || nr < 0 || nc >= puzzle.cols || nr >= puzzle.rows) continue;
      if (canStep(puzzle, { c, r }, { c: nc, r: nr })) walk(nc, nr, seen);
    }
    seen.delete(k);
  }
  walk(puzzle.start.c, puzzle.start.r, new Set());
  return n;
}

function pathBetween(puzzle) {
  const prev = new Map();
  const q = [[puzzle.start.c, puzzle.start.r]];
  const seen = new Set([key(puzzle.start.c, puzzle.start.r)]);
  while (q.length) {
    const [c, r] = q.shift();
    if (c === puzzle.end.c && r === puzzle.end.r) {
      const path = [{ c, r }];
      let cur = key(c, r);
      while (prev.has(cur)) {
        cur = prev.get(cur);
        const [pc, pr] = cur.split(",").map(Number);
        path.push({ c: pc, r: pr });
      }
      return path.reverse();
    }
    for (const [nc, nr] of neighbors(c, r)) {
      if (nc < 0 || nr < 0 || nc >= puzzle.cols || nr >= puzzle.rows) continue;
      const k = key(nc, nr);
      if (seen.has(k)) continue;
      if (!canStep(puzzle, { c, r }, { c: nc, r: nr })) continue;
      seen.add(k);
      prev.set(k, key(c, r));
      q.push([nc, nr]);
    }
  }
  return null;
}

function carve(cols, rows, rng) {
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const hWall = Array.from({ length: rows + 1 }, () => Array(cols).fill(true));
  const vWall = Array.from({ length: rows }, () => Array(cols + 1).fill(true));
  function go(c, r) {
    seen[r][c] = true;
    for (const [dc, dr] of rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]])) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || seen[nr][nc]) continue;
      if (dc === 1) vWall[r][c + 1] = false;
      if (dc === -1) vWall[r][c] = false;
      if (dr === 1) hWall[r + 1][c] = false;
      if (dr === -1) hWall[r][c] = false;
      go(nc, nr);
    }
  }
  go(0, 0);
  return { hWall, vWall };
}

function snake(cols, rows) {
  const hWall = Array.from({ length: rows + 1 }, () => Array(cols).fill(true));
  const vWall = Array.from({ length: rows }, () => Array(cols + 1).fill(true));
  // A single corridor: right along row 0, down, left along row 1 if it exists.
  for (let c = 0; c < cols - 1; c++) vWall[0][c + 1] = false;
  if (rows > 1) {
    hWall[1][cols - 1] = false;
    for (let c = cols - 1; c > 0; c--) vWall[1][c] = false;
  }
  return { hWall, vWall, end: rows > 1 ? { c: 0, r: 1 } : { c: cols - 1, r: 0 } };
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `maze-${level}`));
  if (level <= 3) {
    const cols = level === 1 ? 4 : level === 2 ? 5 : 6;
    const rows = level === 1 ? 2 : level === 2 ? 5 : 6;
    const carved = level === 1 ? snake(cols, rows) : { ...carve(cols, rows, rng), end: { c: cols - 1, r: rows - 1 } };
    const puzzle = {
      kind: "walls",
      rule: null,
      cols,
      rows,
      hWall: carved.hWall,
      vWall: carved.vWall,
      symbols: {},
      start: { c: 0, r: 0 },
      end: carved.end,
    };
    const solution = pathBetween(puzzle);
    if (!solution || countPaths(puzzle) !== 1) return generate(level, seed + 7);
    return pack(level, seed, puzzle, solution, {
      et: "Aita tegelane koju. Jää teele.",
      en: "Help them get home. Stay on the path.",
    });
  }

  const cols = 5;
  const rows = 5;
  const rule = level === 4 ? (rng.chance(0.5) ? "even" : "circle") : "even";
  for (let attempt = 0; attempt < 60; attempt++) {
    const start = { c: 0, r: rng.int(0, rows - 1) };
    const end = { c: cols - 1, r: rng.int(0, rows - 1) };
    const walk = selfAvoid(start, end, cols, rows, rng, 6);
    if (!walk) continue;
    const symbols = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        symbols[key(c, r)] = rule === "even" ? rng.pick([1, 3, 5, 7, 9]) : "square";
      }
    }
    const evens = [2, 4, 6, 8];
    walk.forEach((cell, i) => {
      symbols[key(cell.c, cell.r)] = rule === "even" ? evens[i % evens.length] : "circle";
    });
    // A dangling extra valid cell, if it does not open a second path.
    const spur = walk[rng.int(0, walk.length - 1)];
    for (const [nc, nr] of rng.shuffle(neighbors(spur.c, spur.r))) {
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      if (walk.some((w) => w.c === nc && w.r === nr)) continue;
      const prev = symbols[key(nc, nr)];
      symbols[key(nc, nr)] = rule === "even" ? 2 : "circle";
      const trial = { kind: "symbols", rule, cols, rows, symbols, start, end, hWall: null, vWall: null };
      if (countPaths(trial) === 1) break;
      symbols[key(nc, nr)] = prev;
    }
    const puzzle = { kind: "symbols", rule, cols, rows, symbols, start, end, hWall: null, vWall: null };
    if (countPaths(puzzle) !== 1) continue;
    const solution = pathBetween(puzzle);
    const mouths = neighbors(start.c, start.r).filter(([c, r]) => c >= 0 && r >= 0 && c < cols && r < rows);
    if (level === 5 && mouths.length < 2) continue;
    const prompt = rule === "even"
      ? { et: "Käi ainult paarisarvudel. Aita tegelane koju.", en: "Step only on even numbers. Help them get home." }
      : { et: "Käi ainult ringidel. Aita tegelane koju.", en: "Step only on the circles. Help them get home." };
    return pack(level, seed, puzzle, solution, prompt);
  }
  throw new Error("maze failed " + seed);
}

function selfAvoid(start, end, cols, rows, rng, minLen) {
  const path = [{ ...start }];
  const seen = new Set([key(start.c, start.r)]);
  let guard = 0;
  while (guard++ < 80) {
    const last = path[path.length - 1];
    if (last.c === end.c && last.r === end.r && path.length >= minLen) return path;
    const opts = rng.shuffle(neighbors(last.c, last.r)).filter(([c, r]) => c >= 0 && r >= 0 && c < cols && r < rows && !seen.has(key(c, r)));
    if (!opts.length) return null;
    const prefer = opts.find(([c, r]) => Math.abs(c - end.c) + Math.abs(r - end.r) < Math.abs(last.c - end.c) + Math.abs(last.r - end.r));
    const next = prefer && rng.chance(0.7) ? [prefer] : opts;
    const [c, r] = rng.pick(next);
    path.push({ c, r });
    seen.add(key(c, r));
  }
  return null;
}

function pack(level, seed, puzzle, solution, prompt) {
  return basePuzzle(meta, level, seed, {
    view: "maze",
    prompt,
    hint: { et: "Mine ühe sammu kaupa. Seinast ei saa läbi.", en: "Move one step at a time. You cannot pass through a wall." },
    nudge: { et: "Kui tee haruneb, proovi üht haru ja tule tagasi.", en: "If the path splits, try one branch and come back." },
    praise: { et: "Kojujõudmine oli ilus.", en: "You found the way home." },
    explain: { et: "Õige tee jõuab majani ega lähe läbi seina.", en: "The right path reaches the house and does not cross a wall." },
    ...puzzle,
    solution,
    alt: [puzzle.start],
  });
}

export function grade(puzzle, path) {
  if (!Array.isArray(path) || path.length < 2) return false;
  const last = path[path.length - 1];
  if (last.c !== puzzle.end.c || last.r !== puzzle.end.r) return false;
  for (let i = 1; i < path.length; i++) {
    if (!canStep(puzzle, path[i - 1], path[i])) return false;
  }
  return true;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (countPaths(p) !== 1) errs.push("paths");
  if (p.level === 1 && (p.cols !== 4 || p.rows !== 2)) errs.push("l1");
  if (p.level >= 4 && p.kind !== "symbols") errs.push("rule");
  if (p.level === 5) {
    const open = neighbors(p.start.c, p.start.r).filter(([c, r]) => c >= 0 && r >= 0 && c < p.cols && r < p.rows);
    if (open.length < 2) errs.push("mouths");
  }
  return errs;
}
