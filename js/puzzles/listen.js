import { makeRng, mixSeed } from "../rng.js";
import { COLORS } from "../content.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "listen",
  tier: 1,
  name: { et: "Kuula ja tee", en: "Listen and do" },
  blurb: { et: "Kuula juhist ja tee nii.", en: "Listen, then do it." },
};

const OBJECTS = [
  { id: "apple", icon: "apple", et: "õun", all: "õunale", en: "apple", x: 22, y: 42 },
  { id: "ball", icon: "ball", et: "pall", all: "pallile", en: "ball", x: 78, y: 42 },
  { id: "star", icon: "star", et: "täht", all: "tähele", en: "star", x: 22, y: 78 },
  { id: "flower", icon: "flower", et: "lill", all: "lillele", en: "flower", x: 78, y: 78 },
  { id: "house", icon: "house", et: "maja", all: "majale", en: "house", x: 50, y: 28 },
];

function colorSentence(obj, color) {
  return {
    et: `Värvi ${obj.et} ${color.etIll}.`,
    en: `Colour the ${obj.en} ${color.en}.`,
  };
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `listen-${level}`));
  const objects = OBJECTS.map((o) => ({ ...o }));
  const steps = [];
  const used = new Set();

  const takeObj = (preferLeft = null) => {
    const pool = objects.filter((o) => !used.has(o.id) && (preferLeft == null || (preferLeft ? o.x < 50 : o.x > 50)));
    const obj = rng.pick(pool.length ? pool : objects.filter((o) => !used.has(o.id)));
    used.add(obj.id);
    return obj;
  };

  const n = [1, 2, 1, 3, 3][level - 1];
  if (level === 3 || level === 5) {
    const left = objects.filter((o) => o.x < 50);
    const obj = rng.pick(left);
    used.add(obj.id);
    const color = rng.pick(COLORS);
    steps.push({ id: obj.id, color: color.id, say: colorSentence(obj, color), where: "left" });
  }
  while (steps.length < n) {
    const obj = takeObj();
    if (!obj) break;
    if (level >= 2 && steps.length === n - 1 && rng.chance(0.45)) {
      steps.push({
        id: obj.id,
        circle: true,
        say: { et: `Tõmba ${obj.all} ring ümber.`, en: `Circle the ${obj.en}.` },
      });
    } else {
      const color = rng.pick(COLORS);
      steps.push({ id: obj.id, color: color.id, say: colorSentence(obj, color) });
    }
  }
  if (level === 5 && steps.length < 3) return generate(level, seed + 1);

  const say = {
    et: steps.map((s) => s.say.et).join(" "),
    en: steps.map((s) => s.say.en).join(" "),
  };
  const solution = {};
  for (const step of steps) {
    solution[step.id] = {};
    if (step.color) solution[step.id].color = step.color;
    if (step.circle) solution[step.id].circle = true;
  }
  const alt = {};
  return basePuzzle(meta, level, seed, {
    view: "listen",
    prompt: { et: "Kuula juhist ja tee nii.", en: "Listen to the instruction and do it." },
    hint: { et: "Tee üks lause korraga.", en: "Do one sentence at a time." },
    nudge: { et: steps[0].say.et, en: steps[0].say.en },
    praise: { et: "Tegid nii, nagu juhis ütles.", en: "You did what the instruction said." },
    explain: say,
    say,
    objects,
    steps,
    solution,
    alt,
    colors: COLORS.map((c) => ({ id: c.id, hex: c.hex, et: c.et, en: c.en })),
  });
}

export function grade(puzzle, answer) {
  if (!answer) return false;
  const keys = Object.keys(puzzle.solution);
  return keys.every((id) => {
    const want = puzzle.solution[id];
    const got = answer[id] || {};
    if (want.color && got.color !== want.color) return false;
    if (want.circle && !got.circle) return false;
    return true;
  }) && Object.keys(answer).every((id) => keys.includes(id) || (!answer[id].color && !answer[id].circle));
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  const expect = [1, 2, 1, 3, 3][p.level - 1];
  if (p.steps.length < expect) errs.push("steps");
  if (p.level === 3 || p.level === 5) {
    const leftish = p.steps.some((s) => {
      const obj = p.objects.find((o) => o.id === s.id);
      return obj && obj.x < 50;
    });
    if (!leftish && p.level === 3) errs.push("position");
  }
  const ids = p.steps.map((s) => s.id);
  if (new Set(ids).size !== ids.length) errs.push("dup");
  return errs;
}
