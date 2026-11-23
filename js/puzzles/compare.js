import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "compare",
  tier: 1,
  name: { et: "Võrdlemine", en: "Comparing" },
  blurb: { et: "Rohkem, vähem või võrdselt.", en: "More, less or the same." },
};

const ICONS = ["apple", "berry", "ball", "star", "flower", "fish"];

function cap(level) {
  if (level <= 2) return 5;
  if (level === 3) return 10;
  return 12;
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `compare-${level}`));
  const icon = rng.pick(ICONS);
  const max = cap(level);

  if (level === 4) {
    const a = rng.int(1, max);
    let b = rng.int(1, max);
    if (rng.chance(0.34)) b = a;
    const solution = a > b ? "more" : a < b ? "less" : "equal";
    return basePuzzle(meta, level, seed, {
      view: "compare",
      mode: "sign",
      prompt: {
        et: "Kumb arv on suurem, kumb väiksem — või on nad võrdsed?",
        en: "Which number is greater, which is smaller — or are they equal?",
      },
      hint: { et: "Võrdle kahte arvu.", en: "Compare the two numbers." },
      nudge: {
        et: a === b ? "Need kaks arvu on ühesugused." : `Vaata, kumb on loendamisel eespool.`,
        en: a === b ? "These two numbers are the same." : "Think which one you meet first when you count.",
      },
      praise: { et: "Võrdlus on õige.", en: "That comparison is right." },
      explain: {
        et: a === b ? `${a} ja ${b} on võrdsed.` : a > b ? `${a} on suurem kui ${b}.` : `${a} on väiksem kui ${b}.`,
        en: a === b ? `${a} and ${b} are equal.` : a > b ? `${a} is greater than ${b}.` : `${a} is smaller than ${b}.`,
      },
      left: a,
      right: b,
      options: [
        { id: "more", et: "vasak on suurem", en: "the left one is greater" },
        { id: "less", et: "vasak on väiksem", en: "the left one is smaller" },
        { id: "equal", et: "võrdsed", en: "equal" },
      ],
      solution,
      alt: solution === "equal" ? "more" : "equal",
    });
  }

  if (level === 5) {
    const base = rng.int(1, 8);
    const add = rng.int(1, 3);
    const other = rng.int(1, 10);
    const total = base + add;
    const solution = total > other ? "left" : total < other ? "right" : "equal";
    return basePuzzle(meta, level, seed, {
      view: "compare",
      mode: "extra",
      prompt: {
        et: `Siin on ${base} asja ja juurde tuleb ${add}. Kummal pool on siis rohkem?`,
        en: `There are ${base} things and ${add} more arrive. Which side has more then?`,
      },
      hint: { et: "Liida kõigepealt juurde tulnud asjad, siis võrdle.", en: "Add the new ones first, then compare." },
      nudge: { et: `${base} ja ${add} on kokku ${total}.`, en: `${base} and ${add} make ${total}.` },
      praise: { et: "Said võrdluse kätte.", en: "You worked out the comparison." },
      explain: {
        et: `${base} + ${add} = ${total}. ${solution === "equal" ? "Mõlemal pool on ühepalju." : solution === "left" ? "Vasakul on rohkem." : "Paremal on rohkem."}`,
        en: `${base} + ${add} = ${total}. ${solution === "equal" ? "Both sides match." : solution === "left" ? "The left side has more." : "The right side has more."}`,
      },
      icon,
      base,
      add,
      other,
      solution,
      alt: solution === "left" ? "right" : "left",
    });
  }

  if (level === 3) {
    let a = rng.int(1, max);
    let b = rng.int(1, max);
    if (a === b) b = a === max ? a - 1 : a + 1;
    const bigger = a > b ? "a" : "b";
    return basePuzzle(meta, level, seed, {
      view: "compare",
      mode: "numerals",
      prompt: { et: "Kumb arv on suurem? Tõmba ring ümber.", en: "Which number is greater? Circle it." },
      hint: { et: "Suurem arv on see, mis tuleb loendamisel hiljem.", en: "The greater number is the one you reach later when you count." },
      nudge: { et: `Võrdle arve ${a} ja ${b}.`, en: `Compare ${a} and ${b}.` },
      praise: { et: "Õige arv.", en: "The right number." },
      explain: { et: `${Math.max(a, b)} on suurem kui ${Math.min(a, b)}.`, en: `${Math.max(a, b)} is greater than ${Math.min(a, b)}.` },
      numerals: [
        { id: "a", n: a },
        { id: "b", n: b },
      ],
      solution: bigger,
      alt: bigger === "a" ? "b" : "a",
    });
  }

  const count = level === 2 ? 3 : 2;
  const wantSmallest = level === 2 && rng.chance(0.4);
  const equalTask = level === 1 && rng.chance(0.22);
  let groups;
  if (equalTask) {
    const n = rng.int(1, max);
    groups = [
      { id: "g0", icon, count: n },
      { id: "g1", icon, count: n },
    ];
  } else {
    const nums = rng.shuffle(Array.from({ length: max }, (_, i) => i + 1)).slice(0, count);
    groups = nums.map((n, i) => ({ id: `g${i}`, icon, count: n }));
  }
  const counts = groups.map((g) => g.count);
  const solution = equalTask
    ? "equal"
    : groups.reduce((best, g) => (wantSmallest ? (g.count < best.count ? g : best) : g.count > best.count ? g : best)).id;

  const prompt =
    solution === "equal"
      ? { et: "Kas mõlemal on ühepalju? Kui jah, vali „võrdselt“.", en: "Do both have the same amount? If so, choose “the same”." }
      : wantSmallest && level === 2
        ? { et: "Kus on kõige vähem? Tõmba ring ümber.", en: "Which has the fewest? Circle it." }
        : level === 2
          ? { et: "Kus on kõige rohkem? Tõmba ring ümber.", en: "Which has the most? Circle it." }
          : { et: "Kummall on rohkem? Tõmba ring ümber.", en: "Which has more? Circle it." };

  return basePuzzle(meta, level, seed, {
    view: "compare",
    mode: "groups",
    prompt,
    hint: { et: "Loe iga hunnik kokku ja võrdle.", en: "Count each group, then compare." },
    nudge: { et: "Loe ühe hunniku asjad näpuga üle.", en: "Count one group with your finger." },
    praise: { et: "Loendus on õige.", en: "You counted it right." },
    explain: {
      et: groups.map((g) => `${g.count}`).join(" ja ") + (solution === "equal" ? " — võrdselt." : "."),
      en: groups.map((g) => `${g.count}`).join(" and ") + (solution === "equal" ? " — the same." : "."),
    },
    groups,
    allowEqual: level === 1,
    solution,
    alt: solution === "equal" ? groups[0].id : "equal",
  });
}

export function grade(puzzle, answer) {
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.mode === "groups") {
    const counts = p.groups.map((g) => g.count);
    if (counts.some((n) => n < 1 || n > cap(p.level))) errs.push("range");
    if (p.solution !== "equal") {
      const target = p.groups.find((g) => g.id === p.solution);
      const extreme = p.prompt.et.includes("vähem") ? Math.min(...counts) : Math.max(...counts);
      if (target.count !== extreme) errs.push("extreme");
      if (p.groups.filter((g) => g.count === target.count).length !== 1) errs.push("unique");
    } else if (p.groups[0].count !== p.groups[1].count) errs.push("equal");
  }
  if (p.mode === "numerals") {
    const [a, b] = p.numerals;
    if (Math.max(a.n, b.n) > 10 || a.n === b.n) errs.push("num");
  }
  if (p.mode === "sign" && ![p.left, p.right].every((n) => n >= 1 && n <= 12)) errs.push("sign range");
  if (p.mode === "extra") {
    const total = p.base + p.add;
    const expect = total > p.other ? "left" : total < p.other ? "right" : "equal";
    if (p.solution !== expect || total > 12) errs.push("extra");
  }
  return errs;
}
