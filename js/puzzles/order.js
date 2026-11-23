import { makeRng, mixSeed } from "../rng.js";
import { WEEKDAYS, SEASONS, MONTHS, DAY_PARTS, TIME_WORDS } from "../content.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "order",
  tier: 2,
  name: { et: "Järjestamine", en: "Putting in order" },
  blurb: { et: "Lühemast pikemani, päevad ja aastaajad.", en: "Shortest to longest, days and seasons." },
};

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `order-${level}`));

  if (level <= 2) {
    const n = level === 1 ? 3 : rng.pick([4, 5]);
    const sizes = rng.shuffle([1, 2, 3, 4, 5, 6]).slice(0, n);
    if (new Set(sizes).size !== sizes.length) throw new Error("sizes");
    const items = sizes.map((size, i) => ({ id: `s${i}`, size }));
    const solution = [...items].sort((a, b) => a.size - b.size).map((it) => it.id);
    const alt = [...solution].reverse();
    return basePuzzle(meta, level, seed, {
      view: "order",
      display: "sticks",
      prompt: { et: "Järjesta lühemast pikemani.", en: "Put them in order from shortest to longest." },
      hint: { et: "Kõige lühem tuleb esimeseks.", en: "The shortest one comes first." },
      nudge: { et: "Võrdle kahte pulka korraga.", en: "Compare two sticks at a time." },
      praise: { et: "Järjekord on õige.", en: "The order is right." },
      explain: { et: "Vasakule jääb lühim, paremale pikim.", en: "The shortest is on the left, the longest on the right." },
      items: rng.shuffle(items),
      solution,
      alt,
    });
  }

  let source;
  let prompt;
  let explain;
  if (level === 3) {
    source = rng.chance(0.5) ? TIME_WORDS : DAY_PARTS;
    prompt = source === TIME_WORDS
      ? { et: "Pane päevad õigesse järjekorda: eile, täna, homme.", en: "Put the days in order: yesterday, today, tomorrow." }
      : { et: "Pane päeva osad õigesse järjekorda.", en: "Put the parts of the day in order." };
    explain = { et: source.map((s) => s.et).join(", ") + ".", en: source.map((s) => s.en).join(", ") + "." };
  } else if (level === 4) {
    source = rng.chance(0.5) ? WEEKDAYS.slice(0, 4) : SEASONS;
    prompt = source.length === 4 && source[0].id === "mon"
      ? { et: "Pane päevad õigesse järjekorda. Alusta esmaspäevast.", en: "Put the days in order. Start from Monday." }
      : source[0].id === "spring"
        ? { et: "Pane aastaajad õigesse järjekorda. Alusta kevadest.", en: "Put the seasons in order. Start from spring." }
        : { et: "Pane õigesse järjekorda.", en: "Put them in the right order." };
    explain = { et: source.map((s) => s.et).join(", ") + ".", en: source.map((s) => s.en).join(", ") + "." };
  } else {
    const start = rng.pick([0, 6]);
    source = MONTHS.slice(start, start + 6);
    prompt = {
      et: `Pane kuud õigesse järjekorda. Alusta: ${source[0].et}.`,
      en: `Put the months in order. Start with ${source[0].en}.`,
    };
    explain = { et: source.map((s) => s.et).join(", ") + ".", en: source.map((s) => s.en).join(", ") + "." };
  }

  const items = source.map((s) => ({ id: s.id, et: s.et, en: s.en }));
  const solution = items.map((s) => s.id);
  const alt = [...solution].reverse();
  return basePuzzle(meta, level, seed, {
    view: "order",
    display: "words",
    prompt,
    hint: { et: "Ütle järjekord endale sosinal ette.", en: "Say the order quietly to yourself first." },
    nudge: { et: `Esimene on „${items[0].et}“.`, en: `The first is “${items[0].en}”.` },
    praise: { et: "Järjekord on paigas.", en: "The order is in place." },
    explain,
    items: rng.shuffle(items.map((s) => ({ ...s }))),
    solution,
    alt,
  });
}

export function grade(puzzle, answer) {
  return Array.isArray(answer) && same(answer, puzzle.solution);
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.display === "sticks") {
    const sizes = p.items.map((it) => it.size);
    if (new Set(sizes).size !== sizes.length) errs.push("tie");
    const ordered = p.solution.map((id) => p.items.find((it) => it.id === id).size);
    for (let i = 1; i < ordered.length; i++) if (ordered[i] <= ordered[i - 1]) errs.push("sort");
    if (p.level === 1 && p.items.length !== 3) errs.push("l1");
  }
  if (p.level === 5 && p.solution.length !== 6) errs.push("months");
  return errs;
}
