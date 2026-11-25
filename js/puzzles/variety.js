import { mixSeed } from "../rng.js";
import { generate } from "./index.js";

/** What makes two puzzles feel the same: the answer, the numbers, and the layout.
 *  Option order and wording that only restates those are ignored.
 */
export function feelKey(puzzle) {
  const t = puzzle.type;
  if (t === "missing") return `missing:${JSON.stringify(puzzle.seq || puzzle.tokens)}`;
  if (t === "arithmetic") {
    if (puzzle.view === "match") return `arith:${puzzle.left.map((x) => x.et).sort().join(",")}`;
    const bits = (puzzle.slots || []).map((s) => {
      if (s.t === "pics") return `${s.icon}*${s.n}`;
      if (s.t === "n") return String(s.v);
      if (s.t === "op") return s.v;
      return "_";
    });
    return `arith:${bits.join(" ")}=${puzzle.solution}`;
  }
  if (t === "compare") {
    if (puzzle.mode === "groups") {
      return `cmp:${puzzle.groups.map((g) => `${g.icon}:${g.count}`).join(",")}:${puzzle.prompt.et}`;
    }
    if (puzzle.mode === "numerals") return `cmp:${puzzle.numerals.map((n) => n.n).join(",")}`;
    if (puzzle.mode === "sign") return `cmp:${puzzle.left}?${puzzle.right}`;
    return `cmp:${puzzle.base}+${puzzle.add}?${puzzle.other}`;
  }
  if (t === "bonds") {
    if (puzzle.mode === "pairs") {
      return `bonds:${puzzle.target}:${puzzle.options.map((o) => `${o.a}+${o.b}`).sort().join(",")}`;
    }
    return `bonds:${puzzle.target}:${puzzle.visible}:${puzzle.icon}:${puzzle.mode}`;
  }
  if (t === "patterns") {
    const tiles = (puzzle.tiles || []).map((tile) => (tile ? `${tile.shape}:${tile.color}` : "_")).join(",");
    return `pat:${tiles}:${(puzzle.motif || []).join(",")}`;
  }
  if (t === "oddone") {
    const ids = puzzle.items.map((i) => i.id).sort().join(",");
    if (puzzle.view === "sort") return `odd:${ids}`;
    const oddId = puzzle.needReason ? puzzle.solution.id : puzzle.solution;
    return `odd:${ids}:${oddId}`;
  }
  if (t === "position") {
    if (puzzle.mode === "grid") {
      return `pos:${puzzle.cells.map((c) => c.icon).join(",")}:${puzzle.start}:${puzzle.solution}`;
    }
    return `pos:${puzzle.items.map((i) => `${i.icon}@${i.slot}`).sort().join(",")}:${puzzle.phrase}`;
  }
  if (t === "shapes") {
    if (puzzle.figure) return `shp:${puzzle.mode}:${puzzle.figure.shape}`;
    if (puzzle.items) return `shp:${puzzle.prompt.et}:${puzzle.items.map((i) => i.shape).join("")}`;
    return `shp:${puzzle.solution}`;
  }
  if (t === "matching") {
    return `match:${puzzle.left.map((l) => l.et).sort().join(",")}:${puzzle.right.map((r) => r.et).sort().join(",")}`;
  }
  if (t === "stories") return `story:${puzzle.text.et}`;
  if (t === "memory") {
    return `mem:${puzzle.mode}:${puzzle.show.map((s) => s.id).join(",")}:${JSON.stringify(puzzle.solution)}`;
  }
  if (t === "listen") {
    return `lis:${puzzle.steps.map((s) => `${s.id}:${s.color || ""}:${s.circle ? "o" : ""}`).join(",")}`;
  }
  if (t === "pyramid") return `pyr:${JSON.stringify(puzzle.rows)}:${JSON.stringify(puzzle.given)}`;
  if (t === "sudoku") {
    const icons = (puzzle.symbols || []).map((s) => s.icon || s.text).join(",");
    return `sud:${JSON.stringify(puzzle.clues)}:${icons}`;
  }
  if (t === "wordlogic") {
    const clues = (puzzle.clues || []).map((c) => c.et).join("|");
    const ask = puzzle.question ? puzzle.question.et : "";
    return `word:${clues}:${ask}:${JSON.stringify(puzzle.solution)}`;
  }
  if (t === "maze") {
    return `maze:${JSON.stringify(puzzle.hWall || null)}:${JSON.stringify(puzzle.vWall || null)}:${puzzle.end?.c},${puzzle.end?.r}:${JSON.stringify(puzzle.symbols || {})}`;
  }
  if (t === "mirror") {
    const parts = (puzzle.options || []).map((opt) => opt.key).sort().join(",");
    return `mir:${puzzle.picture}:${puzzle.mode}:${parts}`;
  }
  if (t === "order") {
    if (puzzle.display === "sticks") return `ord:${puzzle.items.map((i) => i.size).sort((a, b) => a - b).join(",")}`;
    return `ord:${puzzle.solution.join(",")}`;
  }
  if (t === "analogy") return `ana:${puzzle.prompt.et}`;
  if (t === "matrix") return `mtx:${JSON.stringify(puzzle.grid)}`;
  if (t === "clock") {
    const time = puzzle.mode === "set" ? puzzle.solution : puzzle.faces[puzzle.solution];
    return `clk:${puzzle.mode}:${time.h}:${time.m}`;
  }
  if (t === "money") {
    const bag = (puzzle.coins || []).map((c) => c.id).sort().join(",");
    const ask = (puzzle.coins || []).find((c) => c.uid === puzzle.solution);
    return `mon:${puzzle.mode}:${bag}:${ask ? ask.id : puzzle.solution}:${puzzle.price || ""}`;
  }
  return `${t}:${JSON.stringify(puzzle.solution)}:${puzzle.prompt?.et || ""}`;
}

/** Next puzzle of this type, skipping feels already seen in this run. */
export function generateFresh(type, level, seed, recent = []) {
  const avoid = new Set(recent);
  const last = recent.length ? recent[recent.length - 1] : null;
  let fallback = null;
  let notLast = null;
  for (let i = 0; i < 40; i++) {
    let puzzle;
    try {
      puzzle = generate(type, level, mixSeed(seed, i));
    } catch {
      continue;
    }
    const key = feelKey(puzzle);
    if (!fallback) fallback = { puzzle, key };
    if (key !== last) notLast = { puzzle, key };
    if (!avoid.has(key)) return { puzzle, key };
  }
  if (notLast) return notLast;
  if (fallback) return fallback;
  const puzzle = generate(type, 1, 1);
  return { puzzle, key: feelKey(puzzle) };
}

/** One early-level run, used by the app and by the variety tests. */
export function generateRun(type, level, count, seed) {
  const items = [];
  const recent = [];
  for (let i = 0; i < count; i++) {
    const next = generateFresh(type, level, mixSeed(seed, `run:${level}:${i}`), recent);
    items.push(next.puzzle);
    recent.push(next.key);
  }
  return items;
}
