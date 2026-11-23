import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "patterns",
  tier: 1,
  name: { et: "Mustrid", en: "Patterns" },
  blurb: { et: "Mis tuleb järgmisena?", en: "What comes next?" },
};

const SHAPES = ["circle", "triangle", "square"];
const COLORS = ["ink", "red", "blue", "gold"];

function tileKey(t) {
  return t ? `${t.shape}:${t.color}` : "empty";
}

function fitsMotif(seq, motif) {
  return seq.every((tile, i) => tile && tileKey(tile) === tileKey(motif[i % motif.length]));
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `pat-${level}`));
  let motifLen = 2;
  if (level === 2) motifLen = rng.pick([3, 3, 2]);
  if (level === 5) motifLen = rng.pick([2, 3, 4]);
  const twoAttr = level >= 4;
  const shape = rng.pick(SHAPES);
  const colors = rng.shuffle(COLORS);
  const shapes = rng.shuffle(SHAPES);
  const motif = [];
  for (let i = 0; i < motifLen; i++) {
    if (level === 5 && rng.chance(0.4) && motifLen === 2 && i === 0) {
      /* AABB built below */
    }
    motif.push({
      shape: twoAttr || level === 3 ? shapes[i % shapes.length] : shape,
      color: colors[i % Math.min(colors.length, motifLen === 2 ? 2 : motifLen)],
    });
  }
  if (level === 5 && rng.chance(0.5)) {
    const a = { shape: shapes[0], color: colors[0] };
    const b = { shape: twoAttr ? shapes[1] : shapes[0], color: colors[1] };
    motif.length = 0;
    motif.push(a, a, b, b);
  }
  if (level === 1) {
    motif.length = 0;
    motif.push({ shape, color: colors[0] }, { shape, color: colors[1] });
  }
  if (level === 2 && motif.length < 3 && rng.chance(0.5)) {
    motif.length = 0;
    const s = shapes[0];
    motif.push({ shape: s, color: colors[0] }, { shape: s, color: colors[0] }, { shape: s, color: colors[1] });
  }

  const repeats = motif.length >= 4 ? 2 : 3;
  const seq = [];
  for (let r = 0; r < repeats; r++) seq.push(...motif.map((t) => ({ ...t })));
  const hideAt = [];
  if (level === 3) hideAt.push(rng.int(motif.length, seq.length - motif.length));
  else hideAt.push(seq.length - 1);
  if (level === 5 && rng.chance(0.45) && seq.length >= 2) hideAt.push(seq.length - 2);

  const missing = hideAt.map((i) => ({ ...seq[i] }));
  const shown = seq.map((t, i) => (hideAt.includes(i) ? null : { ...t }));

  if (hideAt.length === 1) {
    const correct = missing[0];
    const distractors = [];
    const push = (t) => {
      if (!t) return;
      if (tileKey(t) === tileKey(correct)) return;
      if (distractors.some((d) => tileKey(d) === tileKey(t))) return;
      distractors.push(t);
    };
    push({ shape: correct.shape, color: colors.find((c) => c !== correct.color) || "red" });
    push({ shape: shapes.find((s) => s !== correct.shape) || "triangle", color: correct.color });
    const shifted = seq[(hideAt[0] + 1) % seq.length];
    push(shifted);
    push({ shape: "triangle", color: "gold" });
    push({ shape: "square", color: "blue" });
    while (distractors.length < 3) push({ shape: rng.pick(SHAPES), color: rng.pick(COLORS) });
    const options = rng.shuffle([correct, ...distractors.slice(0, 3)]);
    const solution = options.findIndex((o) => tileKey(o) === tileKey(correct));
    const filled = shown.slice();
    const only = options.filter((o) => {
      filled[hideAt[0]] = o;
      const ok = fitsMotif(filled, motif);
      filled[hideAt[0]] = null;
      return ok;
    });
    if (only.length !== 1) return generate(level, seed + 17);

    return basePuzzle(meta, level, seed, {
      view: "pattern",
      mode: "choice",
      prompt: { et: "Mis tuleb järgmisena? Vali õige pilt.", en: "What comes next? Choose the right picture." },
      hint: { et: "Vaata, mis kordub. Siis vali sama järg.", en: "See what repeats, then choose the same again." },
      nudge: { et: "Loe muster algusest peale veel kord.", en: "Read the pattern again from the start." },
      praise: { et: "Muster läheb edasi.", en: "The pattern continues." },
      explain: { et: "Sama järg kordub algusest peale.", en: "The same order starts again from the beginning." },
      tiles: shown,
      options,
      solution,
      alt: (solution + 1) % options.length,
      motif: motif.map(tileKey),
    });
  }

  const palette = [];
  const pushP = (t) => {
    if (palette.some((p) => tileKey(p) === tileKey(t))) return;
    palette.push(t);
  };
  missing.forEach(pushP);
  motif.forEach(pushP);
  while (palette.length < 4) pushP({ shape: rng.pick(SHAPES), color: rng.pick(COLORS) });
  return basePuzzle(meta, level, seed, {
    view: "pattern",
    mode: "build",
    prompt: { et: "Jätka mustrit. Pane kaks järgmist pilti.", en: "Carry the pattern on. Place the next two pictures." },
    hint: { et: "Muster kordub. Vaata algust.", en: "The pattern repeats. Look at the start." },
    nudge: { et: `Järgmine on sama mis mustri alguses.`, en: "The next one matches the start of the pattern." },
    praise: { et: "Sa ehitasid mustri edasi.", en: "You built the pattern on." },
    explain: { et: "Kaks järgmist kasti jätkavad sama kordust.", en: "The next two boxes keep the same repeat." },
    tiles: shown,
    palette: palette.slice(0, 4),
    solution: missing.map(tileKey),
    alt: ["zzz:zzz", "zzz:zzz"],
    motif: motif.map(tileKey),
  });
}

export function grade(puzzle, answer) {
  if (puzzle.mode === "choice") return answer === puzzle.solution;
  return Array.isArray(answer) && same(answer, puzzle.solution);
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || (p.mode === "choice" && grade(p, p.alt))) errs.push("grade");
  if (p.mode === "build" && grade(p, p.alt) && p.alt.join() !== p.solution.join()) errs.push("alt");
  if (p.mode === "choice") {
    const motif = p.motif;
    let fit = 0;
    p.options.forEach((o, idx) => {
      const seq = p.tiles.map((t) => (t ? { ...t } : null));
      const hole = seq.findIndex((t) => !t);
      seq[hole] = o;
      if (seq.every((t, i) => t && `${t.shape}:${t.color}` === motif[i % motif.length])) fit += idx === p.solution ? 1 : 10;
    });
    if (fit !== 1) errs.push("fit " + fit);
  }
  return errs;
}
