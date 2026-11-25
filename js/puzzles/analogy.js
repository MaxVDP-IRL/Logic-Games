import { makeRng, mixSeed } from "../rng.js";
import { ANALOGIES, labelOf } from "../content.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "analogy",
  tier: 3,
  name: { et: "Analoogiad", en: "Analogies" },
  blurb: { et: "See on sellele nagu too on …", en: "This is to that as that is to …" },
};

const NUMBER_PAIRS = [
  { a: 2, b: 3, c: 5, answer: 6, rule: "next" },
  { a: 1, b: 2, c: 4, answer: 5, rule: "next" },
  { a: 2, b: 4, c: 3, answer: 6, rule: "double" },
  { a: 1, b: 3, c: 2, answer: 4, rule: "plus2" },
  { a: 4, b: 2, c: 6, answer: 3, rule: "half" },
];

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `ana-${level}`));
  if (level === 4) {
    const rule = rng.pick(NUMBER_PAIRS);
    const wrong = [rule.answer + 1, rule.answer - 1, rule.c, rule.b].filter((n) => n !== rule.answer && n > 0);
    const options = rng.shuffle([rule.answer, ...new Set(wrong)].slice(0, 3).concat(rule.answer)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
    if (!options.includes(rule.answer)) options[0] = rule.answer;
    const solution = options.indexOf(rule.answer);
    return basePuzzle(meta, level, seed, {
      view: "analogy",
      mode: "number",
      prompt: { et: `${rule.a} on ${rule.b}-le nagu ${rule.c} on …?`, en: `${rule.a} is to ${rule.b} as ${rule.c} is to …?` },
      hint: { et: "Vaata, mis arvuga juhtub. Tee sama teise arvuga.", en: "See what happens to the number. Do the same to the other one." },
      nudge: { et: rule.rule === "double" ? "Arv läheb kaks korda suuremaks." : rule.rule === "half" ? "Arv läheb poole väiksemaks." : "Arv kasvab ühe võrra.", en: rule.rule === "double" ? "The number doubles." : rule.rule === "half" ? "The number is halved." : "The number grows by one." },
      praise: { et: "Seos on õige.", en: "The link is right." },
      explain: { et: `${rule.a} → ${rule.b}, ${rule.c} → ${rule.answer}.`, en: `${rule.a} → ${rule.b}, ${rule.c} → ${rule.answer}.` },
      stem: rule,
      options: options.map(String),
      solution,
      alt: (solution + 1) % options.length,
    });
  }

  const item = rng.pick(ANALOGIES);
  const near = level >= 2 ? item.distractors : item.distractors.slice(0, 2);
  let optionIds = rng.shuffle([item.answer, ...near]).slice(0, level === 1 ? 3 : 4);
  if (!optionIds.includes(item.answer)) optionIds[0] = item.answer;
  optionIds = [...new Set(optionIds)];
  if (!optionIds.includes(item.answer)) optionIds.push(item.answer);
  const options = optionIds.map((id) => ({ id, ...labelOf(id) }));
  const solution = options.findIndex((o) => o.id === item.answer);
  return basePuzzle(meta, level, seed, {
    view: "analogy",
    mode: "picture",
    prompt: { et: item.et, en: item.en },
    hint: { et: "Mõtle, kuidas kaks esimest kokku käivad.", en: "Think how the first two belong together." },
    nudge: { et: "Otsi samasugune paar.", en: "Look for the same kind of pair." },
    praise: { et: "Leidlik valik.", en: "A clever choice." },
    explain: { et: item.et.replace("…?", labelOf(item.answer).et) , en: item.en.replace("…?", labelOf(item.answer).en) },
    stem: {
      a: labelOf(item.a),
      b: labelOf(item.b),
      c: labelOf(item.c),
    },
    options,
    solution,
    alt: options.findIndex((o) => o.id !== item.answer),
  });
}

export function grade(puzzle, answer) {
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.mode === "picture") {
    const ids = p.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) errs.push("dup");
    if (!p.prompt.et.includes("nagu") && !p.prompt.et.includes("…")) errs.push("prompt");
  } else if (p.options.filter((o) => o === String(p.stem.answer)).length !== 1) errs.push("num");
  return errs;
}
