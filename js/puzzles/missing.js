import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "missing",
  tier: 1,
  name: { et: "Puuduv arv", en: "Missing number" },
  blurb: { et: "Arvurida ja naabrid.", en: "A number line and its neighbours." },
};

export function boundsFor(level) {
  if (level <= 1) return [1, 5];
  if (level === 2) return [1, 10];
  if (level === 3 || level === 4) return [1, 12];
  return [0, 20];
}

/** Other simple +1 / +2 / −1 lines that agree with the visible cells. */
export function plausibleSequences(visible, length, [lo, hi]) {
  const found = new Set();
  for (const step of [1, 2, -1]) {
    for (let start = lo; start <= hi; start++) {
      const seq = [];
      let ok = true;
      for (let i = 0; i < length; i++) {
        const v = start + i * step;
        if (v < lo || v > hi || !Number.isInteger(v)) {
          ok = false;
          break;
        }
        if (visible[i] != null && visible[i] !== v) {
          ok = false;
          break;
        }
        seq.push(v);
      }
      if (ok) found.add(seq.join(","));
    }
  }
  return [...found];
}

function wrong(solution, lo) {
  const alt = solution.slice();
  alt[0] = alt[0] === lo ? alt[0] + 1 : alt[0] - 1;
  return alt;
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `missing-${level}`));
  const [lo, hi] = boundsFor(level);

  if (level === 3) {
    const n = rng.int(lo + 1, hi - 1);
    const solution = [n - 1, n + 1];
    return basePuzzle(meta, level, seed, {
      view: "blanks",
      prompt: { et: "Kirjuta arv enne ja arv pärast.", en: "Write the number before and the number after." },
      hint: { et: "Üks samm tagasi, siis üks samm edasi.", en: "One step back, then one step forward." },
      nudge: {
        et: `Enne arvu ${n} on ${n - 1}. Kirjuta ka see, mis tuleb pärast.`,
        en: `Before ${n} is ${n - 1}. Write the one that comes after, too.`,
      },
      praise: { et: "Mõlemad naabrid on õiged.", en: "Both neighbours are right." },
      explain: {
        et: `Arvu ${n} ees on ${n - 1} ja järel on ${n + 1}.`,
        en: `Before ${n} comes ${n - 1}, and after it comes ${n + 1}.`,
      },
      tokens: [{ blank: 0 }, { n }, { blank: 1 }],
      solution,
      alt: [n - 1, n + 2],
      max: hi,
    });
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    const step = level === 1 ? (rng.chance(0.35) ? -1 : 1) : level <= 2 ? 1 : level === 4 ? rng.pick([2, -1]) : rng.pick([1, 2, -1]);
    const length = level === 1 ? rng.int(3, 5) : level >= 5 ? rng.int(5, 7) : rng.int(4, 6);
    const span = step * (length - 1);
    const start = step > 0 ? rng.int(lo, hi - span) : rng.int(lo - span, hi);
    const seq = Array.from({ length }, (_, i) => start + i * step);
    if (seq.some((v) => v < lo || v > hi)) continue;

    let hide;
    if (level === 1) hide = [length - 1];
    else if (level >= 5 && rng.chance(0.75)) {
      const pool = seq.map((_, i) => i).filter((i) => i > 0);
      hide = rng.shuffle(pool).slice(0, 2).sort((a, b) => a - b);
    } else if (level === 2) hide = [rng.int(1, length - 2)];
    else hide = [rng.int(1, length - 1)];

    const visible = seq.map((v, i) => (hide.includes(i) ? null : v));
    if (plausibleSequences(visible, length, [lo, hi]).length !== 1) continue;

    const solution = hide.map((i) => seq[i]);
    const tokens = seq.map((v, i) => (hide.includes(i) ? { blank: hide.indexOf(i) } : { n: v }));
    const anchor = seq[Math.max(0, hide[0] - 1)];
    const stepWord =
      step === 1
        ? { et: "Loe ühekaupa edasi.", en: "Count on by one." }
        : step === 2
          ? { et: "Siin hüpatakse kaks sammu korraga.", en: "This line jumps two steps at a time." }
          : { et: "Siin loetakse ühekaupa tagasi.", en: "This line counts back by one." };

    return basePuzzle(meta, level, seed, {
      view: "blanks",
      prompt: { et: "Kirjuta puuduv arv.", en: "Write the missing number." },
      hint: stepWord,
      nudge: {
        et: `Vaata arvu ${anchor}. Samm on ${step > 0 ? "+" + step : step}.`,
        en: `Look at ${anchor}. The step is ${step > 0 ? "+" + step : step}.`,
      },
      praise: { et: "Puuduv arv on käes.", en: "You found the missing number." },
      explain: {
        et: `Rida sammub ${step > 0 ? "+" + step : step}: ${seq.join(", ")}.`,
        en: `The line steps by ${step > 0 ? "+" + step : step}: ${seq.join(", ")}.`,
      },
      tokens,
      solution,
      alt: wrong(solution, lo),
      max: hi,
      seq,
      step,
    });
  }
  throw new Error(`missing generation failed (${seed})`);
}

export function grade(puzzle, answer) {
  return Array.isArray(answer) && answer.length === puzzle.solution.length && same(answer.map(Number), puzzle.solution);
}

export function invariants(p) {
  const errs = [];
  const [lo, hi] = boundsFor(p.level);
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.level === 3) {
    const n = p.tokens[1].n;
    if (n < lo || n > hi || p.solution[0] !== n - 1 || p.solution[1] !== n + 1) errs.push("neighbours");
    return errs;
  }
  if (p.seq.some((n) => n < lo || n > hi)) errs.push("range");
  const visible = p.seq.map((v, i) => (p.tokens[i].blank != null ? null : v));
  if (plausibleSequences(visible, p.seq.length, boundsFor(p.level)).length !== 1) errs.push("unique");
  if (p.level === 1 && p.tokens.filter((t) => t.blank != null).length !== 1) errs.push("l1");
  if (p.level === 1 && p.tokens[p.tokens.length - 1].blank == null) errs.push("l1 end");
  if (p.level === 2 && p.step !== 1) errs.push("l2 step");
  return errs;
}
