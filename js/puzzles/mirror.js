import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "mirror",
  tier: 2,
  name: { et: "Peegelpilt", en: "Mirror picture" },
  blurb: { et: "Joon kui peegel.", en: "The line is a mirror." },
};

export const PICTURES = ["heart", "house", "butterfly", "tree", "rocket", "cat-face"];

function signature(opt) {
  return opt.pieces.map((piece) => `${piece.file}:${piece.align}`).join("|");
}

function option(pieces, rightFile, rightAlign) {
  return { key: signature({ pieces }), pieces, rightFile, rightAlign };
}

function halfRight(name) {
  const file = `${name}-right-half`;
  return option([{ file, align: "right" }], file, "right");
}

function halfLeft(name) {
  const file = `${name}-left-half`;
  return option([{ file, align: "left" }], file, "left");
}

function whole(leftName, rightName) {
  const rightFile = `${rightName}-right-half`;
  return option([
    { file: `${leftName}-left-half`, align: "left" },
    { file: rightFile, align: "right" },
  ], rightFile, "right");
}

function duplicate(name) {
  const file = `${name}-left-half`;
  return option([
    { file, align: "left" },
    { file, align: "left" },
  ], file, "left");
}

function pictureOf(file) {
  return file.replace(/-(left|right)-half$/, "");
}

function isTrueMirror(opt, name) {
  return opt.key === `${name}-left-half:left|${name}-right-half:right`;
}

const COPY = {
  1: {
    prompt: { et: "Vaata joont kui peeglit ja vali õige pool.", en: "Treat the line as a mirror and choose the matching half." },
    hint: { et: "Joon on peegel. Õige pool jätkab pilti.", en: "The line is a mirror. The right half continues the picture." },
    nudge: { et: "Pööra vasak pool mõttes üle joone.", en: "Turn the left side over in your mind, across the line." },
    explain: { et: "Õige pool on vasaku poole peegel, mitte sama pool uuesti.", en: "The right half mirrors the left side. A copy of the left side does not." },
  },
  2: {
    prompt: { et: "Vaata joont kui peeglit ja vali õige pool.", en: "Treat the line as a mirror and choose the matching half." },
    hint: { et: "Iga valik puudutab joont. Ainult üks jätkab sama pilti.", en: "Each choice meets the line. Only one continues the same picture." },
    nudge: { et: "Vaata, milline pool on sama pildi teine pool.", en: "See which half is the other side of the same picture." },
    explain: { et: "Õige pool on selle pildi parem pool. Teised pildid ei sobi.", en: "The right half belongs to this picture. The other pictures do not." },
  },
  3: {
    prompt: { et: "Vali terve pilt, mis sobib vasaku poolega.", en: "Choose the whole picture that matches the left half." },
    hint: { et: "Vasak pool on juba ees. Leia pilt, mis seda jätkab.", en: "The left half is already there. Find the picture that continues it." },
    nudge: { et: "Terve pilt peab algama sama vasaku poolega.", en: "The whole picture has to start with the same left half." },
    explain: { et: "Terve pilt on vasak pool koos selle õige peegelpoolega.", en: "The whole picture is the left half together with its true mirror half." },
  },
  4: {
    prompt: { et: "Vali pilt, mis on õige peegelpilt.", en: "Choose the picture that is a true mirror." },
    hint: { et: "Üks pilt on mõlemalt poolt peegel. Teised on valesti kokku pandud.", en: "One picture mirrors on both sides. The others are joined the wrong way." },
    nudge: { et: "Vaata, kas parem pool on vasaku poole peegel.", en: "See whether the right side mirrors the left side." },
    explain: { et: "Õige pilt on ühe pildi kaks poolt. Teised on erinevad pooled või sama pool kaks korda.", en: "The true picture is both halves of one drawing. The others mix different halves, or repeat one half." },
  },
  5: {
    prompt: { et: "Vali pilt, mille parem pool on õige peegel.", en: "Choose the picture whose right side is the true mirror." },
    hint: { et: "Vasak pool on igal pildil sama. Vaata paremat poolt.", en: "The left side is the same on every picture. Look at the right side." },
    nudge: { et: "Õige parem pool jätkab joont. Sama vasak pool uuesti ei sobi.", en: "The true right half continues across the line. The left half repeated does not." },
    explain: { et: "Õige pildi parem pool on selle pildi peegel. Teised paremad pooled ei ole.", en: "The right side of the true picture is that picture's mirror. The other right sides are not." },
  },
};

function make(level, seed) {
  const rng = makeRng(mixSeed(seed, `mirror-${level}`));
  const picture = rng.pick(PICTURES);
  const others = rng.shuffle(PICTURES.filter((name) => name !== picture));
  let options;
  let stem = { file: `${picture}-left-half`, align: "left" };
  let mode;
  if (level === 1) {
    mode = "half";
    options = [halfRight(picture), halfLeft(picture), halfRight(others[0])];
  } else if (level === 2) {
    mode = "half";
    options = [halfRight(picture), halfRight(others[0]), halfRight(others[1]), halfRight(others[2])];
  } else if (level === 3) {
    mode = "whole";
    options = [whole(picture, picture), whole(others[0], others[0]), whole(others[1], others[1])];
  } else if (level === 4) {
    mode = "which";
    stem = null;
    options = [whole(picture, picture), whole(picture, others[0]), duplicate(picture), whole(others[1], others[2])];
  } else {
    mode = "finish";
    options = [whole(picture, picture), whole(picture, others[0]), whole(picture, others[1]), duplicate(picture)];
  }
  const shuffled = rng.shuffle(options);
  if (new Set(shuffled.map((opt) => opt.key)).size !== shuffled.length) return null;
  const solution = shuffled.findIndex((opt) => opt.rightFile === `${picture}-right-half` && opt.rightAlign === "right" && (level >= 3 ? opt.pieces[0].file === `${picture}-left-half` : opt.pieces.length === 1));
  if (solution < 0) return null;
  const copy = COPY[level];
  return basePuzzle(meta, level, seed, {
    view: "mirror",
    mode,
    picture,
    stem,
    prompt: copy.prompt,
    hint: copy.hint,
    nudge: copy.nudge,
    praise: { et: "See on õige peegel.", en: "That is the right mirror." },
    explain: copy.explain,
    options: shuffled,
    solution,
    alt: (solution + 1) % shuffled.length,
  });
}

export function generate(level, seed) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const used = attempt === 0 ? seed : mixSeed(seed, attempt);
    const puzzle = make(level, used);
    if (puzzle && invariants(puzzle).length === 0) return puzzle;
  }
  throw new Error(`mirror failed L${level} seed ${seed}`);
}

export function grade(puzzle, answer) {
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (!p.prompt.et || !p.prompt.en) errs.push("prompt");
  if ((p.prompt.et.match(/\./g) || []).length !== 1 || (p.prompt.en.match(/\./g) || []).length !== 1) errs.push("sentence");
  const correct = p.options[p.solution];
  if (!correct) errs.push("index");
  else if (correct.rightFile !== `${p.picture}-right-half` || correct.rightAlign !== "right") errs.push("right");
  const keys = p.options.map((opt) => opt.key);
  if (new Set(keys).size !== keys.length) errs.push("dup");
  if (correct && p.options.filter((opt) => opt.key === correct.key).length !== 1) errs.push("unique");
  for (const opt of p.options) {
    if (opt.key !== signature(opt)) errs.push("key");
    for (const piece of opt.pieces) {
      if (!/-(left|right)-half$/.test(piece.file)) errs.push("file");
      if (piece.align !== "left" && piece.align !== "right") errs.push("align");
      if (!PICTURES.includes(pictureOf(piece.file))) errs.push("picture");
    }
    if (opt !== correct && correct && opt.key === correct.key) errs.push("same");
  }
  if (p.level === 1) {
    if (p.options.length !== 3 || p.mode !== "half") errs.push("l1");
    if (!p.options.some((opt) => opt.rightFile === `${p.picture}-left-half` && opt.rightAlign === "left")) errs.push("unflipped");
  }
  if (p.level === 2) {
    if (p.options.length !== 4 || p.mode !== "half") errs.push("l2");
    const distractors = p.options.filter((opt) => opt !== correct);
    if (distractors.some((opt) => opt.rightAlign !== "right" || !opt.rightFile.endsWith("-right-half") || opt.rightFile === correct.rightFile)) errs.push("l2 distractor");
  }
  if (p.level === 4) {
    if (p.stem) errs.push("stem");
    if (p.mode !== "which") errs.push("mode");
    const trues = p.options.filter((opt) => PICTURES.some((name) => isTrueMirror(opt, name)));
    if (trues.length !== 1 || !isTrueMirror(correct, p.picture)) errs.push("which");
    const joined = p.options.some((opt) => opt.pieces.length === 2 && pictureOf(opt.pieces[0].file) !== pictureOf(opt.pieces[1].file));
    const repeated = p.options.some((opt) => opt.pieces.length === 2 && opt.pieces[0].file === opt.pieces[1].file && opt.rightAlign === "left");
    if (!joined || !repeated) errs.push("fakes");
  } else if (!p.stem || p.stem.file !== `${p.picture}-left-half` || p.stem.align !== "left") errs.push("stem");
  if (p.level === 3) {
    if (p.options.length !== 3 || p.mode !== "whole") errs.push("l3");
    for (const opt of p.options) {
      const name = pictureOf(opt.pieces[0].file);
      if (!isTrueMirror(opt, name)) errs.push("l3 whole");
    }
    if (!isTrueMirror(correct, p.picture)) errs.push("l3 correct");
  }
  if (p.level === 5) {
    if (p.mode !== "finish" || p.options.length !== 4) errs.push("l5");
    const left = `${p.picture}-left-half`;
    if (p.options.some((opt) => opt.pieces[0].file !== left || opt.pieces[0].align !== "left")) errs.push("l5 left");
    const trues = p.options.filter((opt) => PICTURES.some((name) => isTrueMirror(opt, name)));
    if (trues.length !== 1 || !isTrueMirror(correct, p.picture)) errs.push("l5 true");
  }
  return errs;
}
