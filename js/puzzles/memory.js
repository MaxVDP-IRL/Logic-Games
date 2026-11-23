import { makeRng, mixSeed } from "../rng.js";
import { THINGS } from "../content.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "memory",
  tier: 1,
  name: { et: "Lühimälu", en: "Memory" },
  blurb: { et: "Vaata hoolega, siis meenuta.", en: "Look carefully, then remember." },
};

const POOL = ["apple", "dog", "star", "house", "fish", "flower", "ball", "bird", "car", "hat", "moon", "tree"];

function cards(ids) {
  return ids.map((id) => {
    const t = THINGS.find((x) => x.id === id);
    return { id, icon: t.icon, et: t.et, en: t.en };
  });
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `mem-${level}`));
  const len = [2, 3, 4, 4, 5][level - 1];
  const picked = rng.shuffle(POOL).slice(0, len);
  const show = cards(picked);

  if (level === 2 || (level === 5 && rng.chance(0.4))) {
    if (level === 5 && rng.chance(0.5)) {
      const animals = show.filter((c) => THINGS.find((t) => t.id === c.id).tags.includes("animal"));
      const others = rng.shuffle(POOL.filter((id) => !picked.includes(id))).slice(0, 3);
      const options = rng.shuffle(cards([...new Set([...picked, ...others])]));
      const solution = animals.map((a) => a.id).sort();
      if (solution.length < 1) return generate(level, seed + 2);
      return basePuzzle(meta, level, seed, {
        view: "memory",
        mode: "filter",
        prompt: { et: "Vaata hoolikalt. Millised olid loomad?", en: "Look carefully. Which ones were animals?" },
        hint: { et: "Jäta meelde ainult loomad.", en: "Remember only the animals." },
        nudge: { et: "Koer, kass, lind ja kala on loomad.", en: "A dog, a cat, a bird and a fish are animals." },
        praise: { et: "Mälu ja sorteerimine koos.", en: "Memory and sorting together." },
        explain: { et: "Loomad, mis olid pildil, on vastus.", en: "The animals that were in the picture are the answer." },
        show,
        options,
        hold: 3,
        solution,
        alt: options.map((o) => o.id).filter((id) => !solution.includes(id)).slice(0, 1),
      });
    }
    const gone = show[rng.int(0, show.length - 1)];
    const distract = cards(rng.shuffle(POOL.filter((id) => !picked.includes(id))).slice(0, 2));
    const options = rng.shuffle([gone, ...distractorsSafe(show, distract)]);
    return basePuzzle(meta, level, seed, {
      view: "memory",
      mode: "gone",
      prompt: { et: "Vaata hoolikalt. Mis kadus ära?", en: "Look carefully. What disappeared?" },
      hint: { et: "Üks piltidest ei tule enam tagasi.", en: "One of the pictures does not come back." },
      nudge: { et: "Mõtle, millist pilti sa enam ei näe.", en: "Think which picture you no longer see." },
      praise: { et: "Said kadunud pildi kätte.", en: "You found the missing picture." },
      explain: { et: `Kadus ${gone.et}.`, en: `The ${gone.en} disappeared.` },
      show,
      remain: show.filter((s) => s.id !== gone.id),
      options,
      hold: level >= 4 ? 3 : 0,
      solution: gone.id,
      alt: options.find((o) => o.id !== gone.id).id,
    });
  }

  const extra = cards(rng.shuffle(POOL.filter((id) => !picked.includes(id))).slice(0, 2));
  const bank = rng.shuffle([...show, ...extra]);
  return basePuzzle(meta, level, seed, {
    view: "memory",
    mode: "sequence",
    prompt: { et: "Vaata järjekorda. Pane pildid samasse järjekorda.", en: "Watch the order. Put the pictures back in the same order." },
    hint: { et: "Jäta meelde esimene pilt, siis järgmine.", en: "Remember the first picture, then the next." },
    nudge: { et: `Esimene oli ${show[0].et}.`, en: `The first one was the ${show[0].en}.` },
    praise: { et: "Järjekord on meeles.", en: "You remembered the order." },
    explain: { et: show.map((s) => s.et).join(", ") + ".", en: show.map((s) => s.en).join(", ") + "." },
    show,
    bank,
    hold: level >= 4 ? 3 : 0,
    solution: show.map((s) => s.id),
    alt: [...show].reverse().map((s) => s.id),
  });
}

function distractorsSafe(show, distract) {
  const ids = new Set(show.map((s) => s.id));
  return distract.filter((d) => !ids.has(d.id)).slice(0, 2);
}

export function grade(puzzle, answer) {
  if (puzzle.mode === "gone") return answer === puzzle.solution;
  return Array.isArray(answer) && same(puzzle.mode === "filter" ? [...answer].sort() : answer, puzzle.solution);
}

export function invariants(p) {
  const errs = [];
  if (p.mode === "sequence" && p.show.length < 2) errs.push("len");
  if (p.mode === "sequence" && same(p.solution, p.alt) ) errs.push("alt same");
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  const ids = p.show.map((s) => s.id);
  if (new Set(ids).size !== ids.length) errs.push("dup");
  if (p.level === 1 && p.show.length !== 2) errs.push("l1");
  if (p.level === 3 && p.mode !== "sequence") errs.push("l3");
  if ((p.level === 4 || p.level === 5) && p.mode === "sequence" && p.hold < 3 && p.mode !== "filter") errs.push("hold");
  return errs;
}
