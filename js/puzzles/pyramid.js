import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "pyramid",
  tier: 2,
  name: { et: "Arvupüramiid", en: "Number pyramid" },
  blurb: { et: "Kaks kõrvuti kasti liidetakse üles.", en: "Two neighbours add up to the box above." },
};

function binom(n, k) {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

/** Coefficient row of a cell in terms of the bottom variables. Row 0 is the bottom. */
export function coefficients(width, row, index) {
  const c = Array(width).fill(0);
  for (let k = 0; k <= row; k++) c[index + k] = binom(row, k);
  return c;
}

export function buildRows(bottom) {
  const rows = [bottom.slice()];
  while (rows[rows.length - 1].length > 1) {
    const prev = rows[rows.length - 1];
    const next = [];
    for (let i = 0; i < prev.length - 1; i++) next.push(prev[i] + prev[i + 1]);
    rows.push(next);
  }
  return rows;
}

export function rankOf(rows, given) {
  const width = rows[0].length;
  const matrix = [];
  for (let r = 0; r < rows.length; r++) {
    for (let i = 0; i < rows[r].length; i++) {
      if (given[r][i]) matrix.push(coefficients(width, r, i));
    }
  }
  if (!matrix.length) return 0;
  const a = matrix.map((row) => row.map(Number));
  let rank = 0;
  for (let col = 0; col < width; col++) {
    let pivot = -1;
    for (let i = rank; i < a.length; i++) {
      if (Math.abs(a[i][col]) > 1e-8) {
        pivot = i;
        break;
      }
    }
    if (pivot < 0) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    const div = a[rank][col];
    for (let j = col; j < width; j++) a[rank][j] /= div;
    for (let i = 0; i < a.length; i++) {
      if (i === rank) continue;
      const f = a[i][col];
      if (Math.abs(f) < 1e-10) continue;
      for (let j = col; j < width; j++) a[i][j] -= f * a[rank][j];
    }
    rank++;
  }
  return rank;
}

export function propagate(rows, given) {
  const known = given.map((row, r) => row.map((g, i) => (g ? rows[r][i] : null)));
  let subtractions = 0;
  let guard = 0;
  while (guard++ < 40) {
    let progress = false;
    for (let r = 0; r < rows.length - 1; r++) {
      for (let i = 0; i < rows[r].length - 1; i++) {
        const a = known[r][i];
        const b = known[r][i + 1];
        const c = known[r + 1][i];
        const missing = [a, b, c].filter((v) => v == null).length;
        if (missing !== 1) continue;
        if (c == null) known[r + 1][i] = a + b;
        else if (a == null) {
          known[r][i] = c - b;
          subtractions++;
        } else {
          known[r][i + 1] = c - a;
          subtractions++;
        }
        progress = true;
      }
    }
    if (!progress) break;
  }
  const solved = known.every((row) => row.every((v) => v != null));
  const matches = solved && known.every((row, r) => row.every((v, i) => v === rows[r][i]));
  return { solved: matches, subtractions, known };
}

function capFor(level) {
  if (level === 1) return 10;
  if (level === 2) return 12;
  return 20;
}

function blankPlan(level, rows, rng) {
  const height = rows.length;
  const cells = [];
  for (let r = 0; r < height; r++) for (let i = 0; i < rows[r].length; i++) cells.push([r, i]);
  if (level === 1) return [[height - 1, 0]];
  if (level === 2) {
    const mids = cells.filter(([r]) => r === 1);
    return [rng.chance(0.7) ? rng.pick(mids) : [height - 1, 0]];
  }
  if (level === 3) {
    const bottoms = cells.filter(([r]) => r === 0);
    return [rng.pick(bottoms)];
  }
  if (level === 4) return rng.shuffle(cells).slice(0, 2);
  const n = rng.chance(0.5) ? 1 : 2;
  return rng.shuffle(cells).slice(0, n);
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `pyr-${level}`));
  const height = level === 5 ? 4 : 3;
  const cap = capFor(level);
  const bottomMax = level === 1 ? 4 : level === 5 ? 4 : 8;

  for (let attempt = 0; attempt < 400; attempt++) {
    const bottom = Array.from({ length: height }, () => rng.int(1, bottomMax));
    const rows = buildRows(bottom);
    if (rows.some((row) => row.some((v) => v > cap || v < 1))) continue;
    const blanks = blankPlan(level, rows, rng);
    const given = rows.map((row) => row.map(() => true));
    for (const [r, i] of blanks) given[r][i] = false;
    const step = propagate(rows, given);
    if (!step.solved) continue;
    if (rankOf(rows, given) !== bottom.length) continue;
    if ((level === 3 || level === 4 || level === 5) && step.subtractions < 1) continue;
    if (level === 4 && blanks.length !== 2) continue;
    if (level === 1 && (blanks.length !== 1 || blanks[0][0] !== rows.length - 1)) continue;

    const altRows = rows.map((row) => row.slice());
    const [br, bi] = blanks[0];
    altRows[br][bi] = rows[br][bi] + 1;

    return basePuzzle(meta, level, seed, {
      view: "pyramid",
      prompt: {
        et: "Kaks kõrvuti kasti liidetakse. Kirjuta summa ülemisse kasti.",
        en: "Two boxes next to each other add up to the box above them. Write the sum.",
      },
      hint: {
        et: "Kui kaks alumist on teada, liida need. Kui ülal ja üks all on teada, lahuta.",
        en: "If the two below are known, add them. If the top and one below are known, subtract.",
      },
      nudge: {
        et: "Otsi kolmik, kus kaks kasti on juba täis. Kolmas tuleb nende põhjal.",
        en: "Find a trio where two boxes are already filled. The third follows from them.",
      },
      praise: { et: "Sa said püramiidi ise kätte.", en: "You worked the pyramid out yourself." },
      explain: {
        et: "Iga ülemine kast on kahe tema all oleva kasti summa.",
        en: "Each upper box is the sum of the two boxes under it.",
      },
      rows,
      given,
      subtractions: step.subtractions,
      solution: rows,
      alt: altRows,
      max: cap,
    });
  }
  throw new Error(`pyramid generation failed (${seed}, level ${level})`);
}

export function grade(puzzle, answer) {
  return Array.isArray(answer) && same(answer, puzzle.solution);
}

/** The next cell a child can fill from the current grid, if any. */
export function nextStep(puzzle, current) {
  const known = current.map((row) => row.slice());
  for (let r = 0; r < puzzle.rows.length - 1; r++) {
    for (let i = 0; i < puzzle.rows[r].length - 1; i++) {
      const a = known[r][i];
      const b = known[r][i + 1];
      const c = known[r + 1] ? known[r + 1][i] : null;
      const vals = [a, b, c];
      if (vals.filter((v) => v == null).length !== 1) continue;
      if (c == null) return { r: r + 1, i, value: a + b };
      if (a == null) return { r, i, value: c - b };
      return { r, i: i + 1, value: c - a };
    }
  }
  return null;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  const step = propagate(p.rows, p.given);
  if (!step.solved) errs.push("stepwise");
  if (rankOf(p.rows, p.given) !== p.rows[0].length) errs.push("rank");
  if (p.rows.some((row) => row.some((v) => v < 1 || v > (p.level === 1 ? 10 : p.level === 2 ? 12 : 20)))) errs.push("cap");
  if (p.level === 1) {
    const blanks = p.given.flatMap((row, r) => row.map((g, i) => (g ? null : r))).filter((v) => v != null);
    if (blanks.length !== 1 || blanks[0] !== p.rows.length - 1) errs.push("l1");
  }
  if (p.level === 5 && p.rows[0].length !== 4) errs.push("l5");
  if (p.level < 5 && p.rows[0].length !== 3) errs.push("height");
  if ((p.level === 3 || p.level === 4 || p.level === 5) && p.subtractions < 1) errs.push("sub");
  const blanks = [];
  p.given.forEach((row, r) => row.forEach((g, i) => { if (!g) blanks.push([r, i]); }));
  if (p.level === 4 && blanks.length !== 2) errs.push("l4 blanks");
  return errs;
}
