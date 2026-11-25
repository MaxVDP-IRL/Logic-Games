import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "bonds",
  tier: 1,
  name: { et: "Arvu koostis", en: "Number bonds" },
  blurb: { et: "Kaks osa, üks summa.", en: "Two parts that make one number." },
};

function targetFor(level) {
  if (level <= 2) return 5;
  if (level === 3) return 10;
  if (level === 4) return 12;
  return null;
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `bonds-${level}`));
  const icon = rng.pick(["apple", "ball", "star", "flower"]);

  if (level === 5) {
    const n = rng.int(6, 12);
    const correct = new Set();
    while (correct.size < 2) correct.add(rng.int(0, n));
    const options = [...correct].map((a) => ({ id: `p${a}`, a, b: n - a, ok: true }));
    let guard = 0;
    while (options.length < 4 && guard++ < 20) {
      const a = rng.int(0, n);
      const b = rng.int(0, n);
      if (a + b === n) continue;
      const id = `w${a}-${b}`;
      if (options.some((o) => o.id === id)) continue;
      options.push({ id, a, b, ok: false });
    }
    const shuffled = rng.shuffle(options);
    const solution = shuffled.filter((o) => o.ok).map((o) => o.id).sort();
    const alt = shuffled.filter((o) => !o.ok).slice(0, 1).map((o) => o.id);
    return basePuzzle(meta, level, seed, {
      view: "bonds",
      mode: "pairs",
      prompt: { et: `Leia paarid, mille summa on ${n}.`, en: `Find the pairs that add up to ${n}.` },
      hint: { et: `Kaks arvu peavad kokku andma ${n}.`, en: `The two numbers must make ${n}.` },
      nudge: { et: `Üks õige paar on ${[...correct][0]} ja ${n - [...correct][0]}.`, en: `One true pair is ${[...correct][0]} and ${n - [...correct][0]}.` },
      praise: { et: "Õiged paarid on leitud.", en: "You found the right pairs." },
      explain: {
        et: solution.map((id) => shuffled.find((o) => o.id === id)).map((o) => `${o.a} + ${o.b} = ${n}`).join(". ") + ".",
        en: solution.map((id) => shuffled.find((o) => o.id === id)).map((o) => `${o.a} + ${o.b} = ${n}`).join(". ") + ".",
      },
      target: n,
      options: shuffled.map(({ id, a, b }) => ({ id, a, b })),
      solution,
      alt,
    });
  }

  const target = targetFor(level);
  const visible = rng.int(level === 1 ? 1 : 0, level === 1 ? target - 1 : target);
  const hidden = target - visible;
  const pictures = level === 1;
  return basePuzzle(meta, level, seed, {
    view: "bonds",
    mode: pictures ? "pictures" : "number",
    prompt: pictures
      ? { et: `Mul on ${target} asja. ${visible} on näha. Mitu on peidus?`, en: `I have ${target} things. ${visible} are showing. How many are hidden?` }
      : { et: `Kaks arvu kokku on ${target}. Üks arv on ${visible}. Mis on teine?`, en: `Two numbers add up to ${target}. One number is ${visible}. What is the other?` },
    hint: { et: `Mõtle, mis arvuga ${visible} saab kokku ${target}.`, en: `Think what joins ${visible} to make ${target}.` },
    nudge: { et: `Loe ${visible}-st edasi kuni ${target}-ni.`, en: `Count on from ${visible} up to ${target}.` },
    praise: { et: "Peidus olev arv on käes.", en: "You found the hidden part." },
    explain: { et: `${visible} + ${hidden} = ${target}.`, en: `${visible} + ${hidden} = ${target}.` },
    icon,
    target,
    visible,
    solution: hidden,
    alt: hidden === target ? hidden - 1 : hidden + 1,
    max: target,
  });
}

export function grade(puzzle, answer) {
  if (puzzle.mode === "pairs") return Array.isArray(answer) && same([...answer].sort(), puzzle.solution);
  return Number(answer) === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.mode === "pairs") {
    const good = p.options.filter((o) => p.solution.includes(o.id));
    const bad = p.options.filter((o) => !p.solution.includes(o.id));
    if (good.length < 1 || bad.some((o) => o.a + o.b === p.target) || good.some((o) => o.a + o.b !== p.target)) errs.push("pairs");
  } else if (p.visible + p.solution !== p.target) errs.push("bond");
  if (p.level <= 2 && p.mode !== "pairs" && p.target !== 5) errs.push("t5");
  if (p.level === 3 && p.target !== 10) errs.push("t10");
  if (p.level === 4 && p.target !== 12) errs.push("t12");
  return errs;
}
