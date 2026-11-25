import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "shapes",
  tier: 1,
  name: { et: "Kujundid", en: "Shapes" },
  blurb: { et: "Ring, kolmnurk, nelinurk.", en: "Circle, triangle, quadrilateral." },
};

const FLAT = ["circle", "triangle", "square", "rectangle"];
const COLORS = [
  { id: "ink", hex: "#1a1714", et: "must", en: "black" },
  { id: "red", hex: "#c44536", et: "punane", en: "red" },
  { id: "blue", hex: "#2f6fad", et: "sinine", en: "blue" },
];

const NAME = {
  circle: { et: "ring", en: "circle" },
  triangle: { et: "kolmnurk", en: "triangle" },
  square: { et: "ruut", en: "square" },
  rectangle: { et: "ristkülik", en: "rectangle" },
  quad: { et: "nelinurk", en: "quadrilateral" },
  sphere: { et: "kera", en: "sphere" },
  cube: { et: "kuup", en: "cube" },
};

function cornersOf(shape) {
  if (shape === "triangle") return 3;
  if (shape === "square" || shape === "rectangle" || shape === "quad") return 4;
  return 0;
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `shapes-${level}`));

  if (level === 1 || level === 5) {
    const want = level === 5 ? rng.pick(["triangle", "circle", "square"]) : rng.pick(FLAT);
    const color = level === 5 ? rng.pick(COLORS.slice(1)) : COLORS[0];
    const items = [];
    const n = level === 5 ? 6 : 5;
    let targets = 0;
    for (let i = 0; i < n; i++) {
      const shape = rng.pick(level === 5 ? ["circle", "triangle", "square"] : FLAT);
      const col = level === 5 ? rng.pick(COLORS) : COLORS[0];
      const hit = shape === want && (level < 5 || col.id === color.id);
      if (hit) targets += 1;
      items.push({
        id: `s${i}`,
        shape,
        color: col.hex,
        rotation: shape === "triangle" ? rng.pick([0, 0, 20, -15]) : 0,
      });
    }
    if (targets < 1 || (level === 1 && targets === n)) return generate(level, seed + 4);
    const solution = items.filter((it, i) => it.shape === want && (level < 5 || it.color === color.hex)).map((it) => it.id).sort();
    const alt = items.map((it) => it.id).filter((id) => !solution.includes(id)).slice(0, 1);
    const plural = {
      circle: ["ringid", "circles"],
      triangle: ["kolmnurgad", "triangles"],
      square: ["ruudud", "squares"],
      rectangle: ["ristkülikud", "rectangles"],
    }[want];
    const colorWord = color.id === "red" ? "punased" : "sinised";
    return basePuzzle(meta, level, seed, {
      view: "shapes",
      mode: "tap",
      prompt: level === 5
        ? { et: `Leia kõik ${colorWord} ${plural[0]}.`, en: `Find every ${color.en} ${plural[1]}.` }
        : { et: `Leia kõik ${plural[0]}.`, en: `Find all the ${plural[1]}.` },
      hint: { et: "Vaata kuju, mitte suurust.", en: "Look at the shape, not the size." },
      nudge: { et: level === 5 ? `Otsi ${color.et} ${NAME[want].et}.` : `Otsi kujundit „${NAME[want].et}“.`, en: `Look for the ${NAME[want].en}.` },
      praise: { et: "Kõik õiged kujundid on leitud.", en: "You found every right shape." },
      explain: { et: `Neid oli ${solution.length}.`, en: `There were ${solution.length}.` },
      items,
      solution,
      alt,
    });
  }

  if (level === 2) {
    const shape = rng.pick(["circle", "triangle", "square"]);
    const names = ["circle", "triangle", "square"].map((id) => ({ id, et: NAME[id].et, en: NAME[id].en }));
    return basePuzzle(meta, level, seed, {
      view: "shapes",
      mode: "name",
      prompt: { et: "Mis kujund see on? Vali õige sõna.", en: "What shape is this? Choose the right word." },
      hint: { et: "Loe nurgad või vaata, kas see on ümmargune.", en: "Count the corners, or see if it is round." },
      nudge: { et: `Sellel kujundil on ${cornersOf(shape)} nurka.`, en: `This shape has ${cornersOf(shape)} corners.` },
      praise: { et: "Nimi on õige.", en: "The name is right." },
      explain: { et: `See on ${NAME[shape].et}.`, en: `This is a ${NAME[shape].en}.` },
      figure: { shape, color: "#1a1714" },
      options: names,
      solution: shape,
      alt: names.find((n) => n.id !== shape).id,
    });
  }

  if (level === 3) {
    const shape = rng.pick(["triangle", "square", "circle", "rectangle"]);
    const answer = String(cornersOf(shape));
    const options = ["0", "3", "4"].map((id) => ({ id, et: id, en: id }));
    return basePuzzle(meta, level, seed, {
      view: "shapes",
      mode: "name",
      prompt: { et: "Mitu nurka on sellel kujundil?", en: "How many corners does this shape have?" },
      hint: { et: "Ringil ei ole nurki. Kolmnurgal on kolm.", en: "A circle has no corners. A triangle has three." },
      nudge: { et: "Puuduta iga nurka sõrmega.", en: "Touch each corner with your finger." },
      praise: { et: "Nurgad on kokku loetud.", en: "You counted the corners." },
      explain: { et: `${NAME[shape].et} — ${answer} nurka.`, en: `A ${NAME[shape].en} has ${answer} corners.` },
      figure: { shape, color: "#1a1714" },
      options,
      solution: answer,
      alt: answer === "3" ? "4" : "3",
    });
  }

  const pair = rng.chance(0.5)
    ? ["sphere", "circle"]
    : ["cube", "square"];
  const ask = rng.pick(pair);
  const options = pair.map((id) => ({ id, et: NAME[id].et, en: NAME[id].en, shape: id }));
  return basePuzzle(meta, level, seed, {
    view: "shapes",
    mode: "which",
    prompt: { et: `Kumb on ${NAME[ask].et}?`, en: `Which one is the ${NAME[ask].en}?` },
    hint: {
      et: ask === "sphere" || ask === "circle" ? "Kera on ümmargune nagu pall. Ring on lame." : "Kuup on nagu täring. Ruut on lame.",
      en: ask === "sphere" || ask === "circle" ? "A sphere is round like a ball. A circle is flat." : "A cube is like a dice. A square is flat.",
    },
    nudge: { et: "Üks on paks, teine on lame pilt.", en: "One is fat and solid, the other is a flat picture." },
    praise: { et: "Õige kujund.", en: "The right shape." },
    explain: { et: `See on ${NAME[ask].et}.`, en: `That is a ${NAME[ask].en}.` },
    options,
    solution: ask,
    alt: pair.find((id) => id !== ask),
  });
}

export function grade(puzzle, answer) {
  if (puzzle.mode === "tap") return Array.isArray(answer) && same([...answer].sort(), puzzle.solution);
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.mode === "tap" && p.solution.length < 1) errs.push("none");
  if (p.mode === "name" && !p.options.some((o) => o.id === p.solution)) errs.push("opt");
  return errs;
}
