import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "mirror",
  tier: 2,
  name: { et: "Peegelpilt", en: "Mirror picture" },
  blurb: { et: "Joon kui peegel.", en: "The line is a mirror." },
};

function empty(h, w) {
  return Array.from({ length: h }, () => Array(w).fill(false));
}

function randomHalf(rng, h, w) {
  const g = empty(h, w);
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) g[r][c] = rng.chance(0.45);
  if (g.flat().every((v) => !v)) g[0][0] = true;
  return g;
}

export function reflectVertical(grid) {
  return grid.map((row) => [...row].reverse());
}

export function reflectHorizontal(grid) {
  return grid.slice().reverse().map((row) => row.slice());
}

function joinHalves(left, right) {
  return left.map((row, r) => row.concat(right[r]));
}

function rotate180(grid) {
  return grid.slice().reverse().map((row) => row.slice().reverse());
}

function flipCell(grid, r, c) {
  const g = grid.map((row) => row.slice());
  g[r][c] = !g[r][c];
  return g;
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `mirror-${level}`));
  const axis = level === 4 ? "h" : "v";

  if (level === 2 || level === 4) {
    const h = 4;
    const w = 4;
    const full = empty(h, w);
    if (axis === "v") {
      const left = randomHalf(rng, h, 2);
      const right = reflectVertical(left);
      for (let r = 0; r < h; r++) for (let c = 0; c < 2; c++) {
        full[r][c] = left[r][c];
        full[r][c + 2] = right[r][c];
      }
    } else {
      const top = randomHalf(rng, 2, w);
      const bottom = reflectHorizontal(top);
      for (let r = 0; r < 2; r++) for (let c = 0; c < w; c++) {
        full[r][c] = top[r][c];
        full[r + 2][c] = bottom[r][c];
      }
    }
    const editable = axis === "v"
      ? full.map((row) => row.slice(2))
      : full.slice(2).map((row) => row.slice());
    return basePuzzle(meta, level, seed, {
      view: "mirror",
      mode: "tap",
      axis,
      prompt: {
        et: "Vaata joont kui peeglit. Täida teine pool.",
        en: "Treat the line as a mirror. Fill in the other half.",
      },
      hint: { et: "Peegel pöörab vasaku poole paremale, ülevalt alla.", en: "A mirror swaps left with right, or top with bottom." },
      nudge: { et: "Iga täidetud ruudu vastas on samasugune ruut.", en: "Opposite every filled square is the same kind of square." },
      praise: { et: "Peegelpilt on valmis.", en: "The reflection is complete." },
      explain: { et: "Teine pool on esimese poole peegel.", en: "The other half is the mirror of the first." },
      full,
      solution: editable,
      alt: flipCell(editable, 0, 0),
    });
  }

  if (level === 5) {
    const figures = [];
    for (let i = 0; i < 4; i++) {
      const left = randomHalf(rng, 3, 2);
      const right = reflectVertical(left);
      const bad = i === 0;
      const shownRight = bad ? flipCell(right, rng.int(0, 2), rng.int(0, 1)) : right;
      if (same(shownRight, right) && bad) shownRight[0][0] = !right[0][0];
      figures.push({ left, right: shownRight, bad });
    }
    const order = rng.shuffle(figures);
    const solution = order.findIndex((f) => f.bad);
    return basePuzzle(meta, level, seed, {
      view: "mirror",
      mode: "odd",
      axis: "v",
      prompt: { et: "Milline pilt ei ole õige peegelpilt?", en: "Which picture is not a true reflection?" },
      hint: { et: "Kontrolli iga ruutu üle joone.", en: "Check each square across the line." },
      nudge: { et: "Ühel pildil on üks ruut vales kohas.", en: "One picture has a single square in the wrong place." },
      praise: { et: "Leidsid katkise peegli.", en: "You found the broken mirror." },
      explain: { et: "Kolm pilti on õiged peeglid. Üks ei ole.", en: "Three pictures are true mirrors. One is not." },
      figures: order,
      solution,
      alt: (solution + 1) % 4,
    });
  }

  const left = randomHalf(rng, 4, 2);
  const right = reflectVertical(left);
  const options = [right];
  options.push(left.map((row) => row.slice()));
  options.push(rotate180(right));
  options.push(flipCell(right, 0, 0));
  const unique = [];
  for (const opt of options) {
    if (!unique.some((u) => same(u, opt))) unique.push(opt);
  }
  while (unique.length < 4) unique.push(flipCell(right, unique.length % 4, 0));
  const cleaned = [];
  for (const opt of unique) if (!cleaned.some((c) => same(c, opt))) cleaned.push(opt);
  if (!cleaned.some((c) => same(c, right)) || cleaned.filter((c) => same(c, right)).length !== 1) {
    return generate(level, seed + 8);
  }
  const shuffled = rng.shuffle(cleaned.slice(0, 4));
  if (!shuffled.some((c) => same(c, right))) shuffled[0] = right;
  const solution = shuffled.findIndex((c) => same(c, right));
  if (shuffled.filter((c) => same(c, right)).length !== 1) return generate(level, seed + 8);

  return basePuzzle(meta, level, seed, {
    view: "mirror",
    mode: level === 3 ? "full" : "half",
    axis: "v",
    prompt: level === 3
      ? { et: "Kumb pilt on õige peegelpilt?", en: "Which picture is the right reflection?" }
      : { et: "Vaata joont kui peeglit. Kumb pool on õige peegelpilt?", en: "Treat the line as a mirror. Which half is the right reflection?" },
    hint: { et: "Peegel vahetab vasaku ja parema poole.", en: "A mirror swaps the left side and the right side." },
    nudge: { et: "Pööra vasak pool mõttes ümber.", en: "Turn the left side over in your mind." },
    praise: { et: "See on õige peegel.", en: "That is the right mirror." },
    explain: { et: "Õige pilt on vasaku poole peegel, mitte pööre.", en: "The right picture is a mirror of the left side, not a turn." },
    left,
    options: level === 3 ? shuffled.map((half) => joinHalves(left, half)) : shuffled,
    solution,
    alt: (solution + 1) % shuffled.length,
  });
}

export function grade(puzzle, answer) {
  if (puzzle.mode === "tap") return same(answer, puzzle.solution);
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.mode === "tap") {
    if (p.axis === "v") {
      const left = p.full.map((row) => row.slice(0, 2));
      if (!same(reflectVertical(left), p.solution)) errs.push("reflect");
    } else {
      const top = p.full.slice(0, 2);
      if (!same(reflectHorizontal(top), p.solution)) errs.push("reflect h");
    }
  }
  if (p.mode === "half" || p.mode === "full") {
    const correct = p.mode === "full" ? joinHalves(p.left, reflectVertical(p.left)) : reflectVertical(p.left);
    if (!same(p.options[p.solution], correct)) errs.push("choice");
    const hits = p.options.filter((o) => same(o, correct)).length;
    if (hits !== 1) errs.push("unique");
  }
  if (p.mode === "odd") {
    const bad = p.figures.filter((f) => !same(f.right, reflectVertical(f.left)));
    if (bad.length !== 1 || p.figures[p.solution].bad !== true) errs.push("odd");
  }
  return errs;
}
