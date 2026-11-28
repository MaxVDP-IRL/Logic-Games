import { makeRng, mixSeed } from "../rng.js";
import { thingById } from "../content.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "signs",
  tier: 1,
  name: { et: "Väiksem ja suurem", en: "Less and greater" },
  blurb: { et: "Väiksem, suurem või võrdne.", en: "Less than, greater than or equal." },
};

const ET_NOM = [
  "null", "üks", "kaks", "kolm", "neli", "viis", "kuus", "seitse", "kaheksa", "üheksa",
  "kümme", "üksteist", "kaksteist", "kolmteist", "neliteist", "viisteist", "kuusteist",
  "seitseteist", "kaheksateist", "üheksateist",
];

const ET_GEN = [
  "nulli", "ühe", "kahe", "kolme", "nelja", "viie", "kuue", "seitsme", "kaheksa", "üheksa",
  "kümne", "üheteistkümne", "kaheteistkümne", "kolmeteistkümne", "neljateistkümne",
  "viieteistkümne", "kuueteistkümne", "seitsmeteistkümne", "kaheksateistkümne", "üheksateistkümne",
];

const ET_TENS_NOM = [null, null, "kakskümmend", "kolmkümmend", "nelikümmend", "viiskümmend"];
const ET_TENS_GEN = [null, null, "kahekümne", "kolmekümne", "neljakümne", "viiekümne"];

const EN = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const EN_TENS = [null, null, "twenty", "thirty", "forty", "fifty"];

const SIGN_OPTIONS = [
  { id: "<", et: "väiksem kui", en: "less than" },
  { id: "=", et: "võrdne", en: "equal" },
  { id: ">", et: "suurem kui", en: "greater than" },
];

const JUDGE_OPTIONS = [
  { id: "true", et: "õige", en: "true" },
  { id: "false", et: "vale", en: "false" },
];

function picture(id) {
  const thing = thingById(id);
  if (!thing?.part || !thing.ens) throw new Error(`signs picture ${id}`);
  return { art: id, et: thing.et, en: thing.en, part: thing.part, ens: thing.ens };
}

export const PICTURES = [
  "apple", "pear", "banana", "carrot", "fish", "bird", "butterfly", "cat", "dog", "rabbit",
].map(picture);

const MOUTH = {
  et: "Näljane suu avaneb suurema arvu poole.",
  en: "The hungry mouth opens toward the bigger number.",
};

const COPY = {
  1: {
    more: { et: "Puuduta hunnikut, kus on rohkem.", en: "Tap the group with more." },
    fewer: { et: "Puuduta hunnikut, kus on vähem.", en: "Tap the group with fewer." },
    hint: {
      et: `Loe mõlemad hunnikud. ${MOUTH.et}`,
      en: `Count both groups. ${MOUTH.en}`,
    },
    nudge: { et: "Loe ühe hunniku pildid näpuga üle.", en: "Count one group's pictures with your finger." },
  },
  2: {
    prompt: { et: "Vali märk, mis jääb arvude vahele.", en: "Choose the sign that goes between the numbers." },
    hint: MOUTH,
    nudge: { et: "Kui arvud on samad, vali võrdne.", en: "If the numbers are the same, choose equal." },
  },
  3: {
    prompt: { et: "Võrdle arve ja vali õige märk.", en: "Compare the numbers and choose the right sign." },
    hint: MOUTH,
    nudge: {
      et: "Ütle arvud loendamise järjekorras. Suu avaneb hilisema poole.",
      en: "Say the numbers in counting order. The mouth opens toward the later one.",
    },
  },
  4: {
    judge: { et: "Kas see võrdlus on õige?", en: "Is this comparison true?" },
    fill: { et: "Vali arv, mis teeb võrdluse õigeks.", en: "Choose the number that makes the comparison true." },
    hint: MOUTH,
    nudge: {
      et: "Ütle märk sõnadega: väiksem kui, suurem kui või võrdne.",
      en: "Say the sign in words: less than, greater than or equal.",
    },
  },
  5: {
    numerals: { et: "Võrdle ja vali õige märk.", en: "Compare and choose the right sign." },
    sum: { et: "Arvuta ja vali õige märk.", en: "Work it out and choose the right sign." },
    hint: MOUTH,
    nudge: {
      et: "Arvuta vasak pool ära. Siis vaata, kuhu suu avaneb.",
      en: "Work out the left side. Then see where the mouth opens.",
    },
  },
};

function cap(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function inRange(n, min, max) {
  return Number.isInteger(n) && n >= min && n <= max;
}

export function etNumber(n) {
  if (!inRange(n, 0, 50)) throw new Error(`et number ${n}`);
  if (n < 20) return ET_NOM[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${ET_TENS_NOM[tens]} ${ET_NOM[ones]}` : ET_TENS_NOM[tens];
}

export function etComitative(n) {
  if (!inRange(n, 0, 50)) throw new Error(`et comitative ${n}`);
  if (n < 20) return `${ET_GEN[n]}ga`;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${ET_TENS_GEN[tens]} ${ET_GEN[ones]}ga` : `${ET_TENS_GEN[tens]}ga`;
}

export function enNumber(n) {
  if (!inRange(n, 0, 50)) throw new Error(`en number ${n}`);
  if (n < 20) return EN[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${EN_TENS[tens]}-${EN[ones]}` : EN_TENS[tens];
}

export function relation(a, b) {
  if (a > b) return ">";
  if (a < b) return "<";
  return "=";
}

function otherSign(sign) {
  if (sign === "<") return ">";
  if (sign === ">") return "<";
  return "<";
}

export function comparisonSentence(left, right, rel, expr = null) {
  const leftWords = expr
    ? { et: `${etNumber(expr[0])} pluss ${etNumber(expr[1])}`, en: `${enNumber(expr[0])} plus ${enNumber(expr[1])}` }
    : { et: etNumber(left), en: enNumber(left) };
  const rightWords = { et: etNumber(right), en: enNumber(right) };
  if (rel === "=") {
    return {
      et: `${cap(leftWords.et)} on võrdne ${etComitative(right)}.`,
      en: `${cap(leftWords.en)} is equal to ${rightWords.en}.`,
    };
  }
  if (rel === ">") {
    return {
      et: `${cap(leftWords.et)} on suurem kui ${rightWords.et}.`,
      en: `${cap(leftWords.en)} is greater than ${rightWords.en}.`,
    };
  }
  return {
    et: `${cap(leftWords.et)} on väiksem kui ${rightWords.et}.`,
    en: `${cap(leftWords.en)} is less than ${rightWords.en}.`,
  };
}

export function judgeSentence(left, right, shown) {
  const truth = relation(left, right);
  const core = comparisonSentence(left, right, truth);
  const ok = shown === truth;
  return {
    et: `${ok ? "Jah" : "Ei"}. ${core.et}`,
    en: `${ok ? "Yes" : "No"}. ${core.en}`,
  };
}

function joinPrompt(lead, tail) {
  return { et: `${lead.et} ${tail.et}`, en: `${lead.en} ${tail.en}` };
}

function countPhrase(n, item) {
  return {
    et: `${etNumber(n)} ${n === 1 ? item.et : item.part}`,
    en: `${enNumber(n)} ${n === 1 ? item.en : item.ens}`,
  };
}

function signOptions() {
  return SIGN_OPTIONS.map((opt) => ({ ...opt }));
}

function oneInFive(rng) {
  return rng.int(1, 5) === 1;
}

function pairIn(rng, min, max, close) {
  const a = rng.int(min, max);
  if (oneInFive(rng)) return [a, a];
  const choices = [];
  for (let n = min; n <= max; n++) {
    if (n === a) continue;
    if (close && Math.abs(n - a) > 8) continue;
    choices.push(n);
  }
  if (!choices.length) {
    for (let n = min; n <= max; n++) if (n !== a) choices.push(n);
  }
  return [a, rng.pick(choices)];
}

function twoPictures(rng) {
  const first = rng.pick(PICTURES);
  const rest = PICTURES.filter((item) => item.art !== first.art);
  return [first, rng.pick(rest)];
}

function pack(level, seed, fields) {
  const spoken = fields.spoken;
  return basePuzzle(meta, level, seed, {
    view: "signs",
    praise: spoken,
    explain: spoken,
    spoken,
    ...fields,
  });
}

function makeGroups(rng, level, seed) {
  const ask = rng.int(1, 2) === 1 ? "more" : "fewer";
  const [leftItem, rightItem] = twoPictures(rng);
  let left = rng.int(1, 5);
  let right = rng.int(1, 5);
  if (left === right) right = left === 5 ? 4 : left + 1;
  const bigger = left > right ? "left" : "right";
  const solution = ask === "more" ? bigger : bigger === "left" ? "right" : "left";
  const copy = COPY[1];
  const names = { et: `${cap(leftItem.et)} ja ${rightItem.et}.`, en: `${cap(leftItem.en)} and ${rightItem.en}.` };
  const rel = relation(left, right);
  return pack(level, seed, {
    mode: "groups",
    ask,
    groups: [
      { id: "left", art: leftItem.art, count: left, et: leftItem.et, en: leftItem.en },
      { id: "right", art: rightItem.art, count: right, et: rightItem.et, en: rightItem.en },
    ],
    left,
    right,
    prompt: joinPrompt(names, copy[ask]),
    hint: copy.hint,
    nudge: copy.nudge,
    spoken: comparisonSentence(left, right, rel),
    solution,
    alt: solution === "left" ? "right" : "left",
  });
}

function makePictures(rng, level, seed) {
  const [leftItem, rightItem] = twoPictures(rng);
  const [left, right] = pairIn(rng, 1, 10, false);
  const rel = relation(left, right);
  const copy = COPY[2];
  const lead = {
    et: `${cap(countPhrase(left, leftItem).et)} ja ${countPhrase(right, rightItem).et}.`,
    en: `${cap(countPhrase(left, leftItem).en)} and ${countPhrase(right, rightItem).en}.`,
  };
  return pack(level, seed, {
    mode: "pictures",
    left,
    right,
    leftItem: { art: leftItem.art, et: leftItem.et, en: leftItem.en },
    rightItem: { art: rightItem.art, et: rightItem.et, en: rightItem.en },
    prompt: joinPrompt(lead, copy.prompt),
    hint: copy.hint,
    nudge: copy.nudge,
    spoken: comparisonSentence(left, right, rel),
    options: signOptions(),
    solution: rel,
    alt: otherSign(rel),
  });
}

function makeNumerals(rng, level, seed, min, max) {
  const close = rng.int(1, 2) === 1;
  const [left, right] = pairIn(rng, min, max, close);
  const rel = relation(left, right);
  const copy = level === 5 ? COPY[5] : COPY[3];
  const tail = level === 5 ? copy.numerals : copy.prompt;
  const lead = {
    et: `${cap(etNumber(left))} ja ${etNumber(right)}.`,
    en: `${cap(enNumber(left))} and ${enNumber(right)}.`,
  };
  return pack(level, seed, {
    mode: "numerals",
    left,
    right,
    prompt: joinPrompt(lead, tail),
    hint: copy.hint,
    nudge: copy.nudge,
    spoken: comparisonSentence(left, right, rel),
    options: signOptions(),
    solution: rel,
    alt: otherSign(rel),
  });
}

function makeJudge(rng, level, seed) {
  const [left, right] = pairIn(rng, 1, 20, rng.int(1, 2) === 1);
  const truth = relation(left, right);
  const shown = rng.int(1, 2) === 1 ? truth : rng.pick(["<", ">", "="].filter((sign) => sign !== truth));
  const claim = comparisonSentence(left, right, shown);
  const copy = COPY[4];
  return pack(level, seed, {
    mode: "judge",
    left,
    right,
    shown,
    prompt: joinPrompt(claim, copy.judge),
    hint: copy.hint,
    nudge: copy.nudge,
    spoken: judgeSentence(left, right, shown),
    options: JUDGE_OPTIONS.map((opt) => ({ ...opt })),
    solution: shown === truth ? "true" : "false",
    alt: shown === truth ? "false" : "true",
  });
}

function fits(n, rel, target) {
  if (rel === "<") return n < target;
  if (rel === ">") return n > target;
  return n === target;
}

function makeFill(rng, level, seed) {
  const rel = oneInFive(rng) ? "=" : rng.int(1, 2) === 1 ? "<" : ">";
  const target = rel === "=" ? rng.int(1, 20) : rng.int(2, 19);
  const goods = [];
  const bads = [];
  for (let n = 1; n <= 20; n++) (fits(n, rel, target) ? goods : bads).push(n);
  if (!goods.length || bads.length < 2) return null;
  const good = rng.pick(goods);
  const bad1 = rng.pick(bads);
  const bad2 = rng.pick(bads.filter((n) => n !== bad1));
  const options = rng.shuffle([good, bad1, bad2]).map((n) => ({ id: `n${n}`, n }));
  const copy = COPY[4];
  const lead = rel === "="
    ? { et: `Võrdne ${etComitative(target)}.`, en: `Equal to ${enNumber(target)}.` }
    : rel === "<"
      ? { et: `Väiksem kui ${etNumber(target)}.`, en: `Less than ${enNumber(target)}.` }
      : { et: `Suurem kui ${etNumber(target)}.`, en: `Greater than ${enNumber(target)}.` };
  return pack(level, seed, {
    mode: "fill",
    rel,
    target,
    prompt: joinPrompt(lead, copy.fill),
    hint: copy.hint,
    nudge: copy.nudge,
    spoken: comparisonSentence(good, target, rel),
    options,
    solution: `n${good}`,
    alt: `n${bad1}`,
  });
}

function makeSum(rng, level, seed) {
  const a = rng.int(1, 5);
  const b = rng.int(1, 5);
  const total = a + b;
  let right = total;
  if (!oneInFive(rng)) {
    const choices = [];
    for (let n = 1; n <= 10; n++) if (n !== total) choices.push(n);
    right = rng.pick(choices);
  }
  const rel = relation(total, right);
  const copy = COPY[5];
  const lead = {
    et: `${cap(etNumber(a))} pluss ${etNumber(b)} ja ${etNumber(right)}.`,
    en: `${cap(enNumber(a))} plus ${enNumber(b)} and ${enNumber(right)}.`,
  };
  return pack(level, seed, {
    mode: "sum",
    left: total,
    right,
    expr: [a, b],
    prompt: joinPrompt(lead, copy.sum),
    hint: copy.hint,
    nudge: copy.nudge,
    spoken: comparisonSentence(total, right, rel, [a, b]),
    options: signOptions(),
    solution: rel,
    alt: otherSign(rel),
  });
}

function make(level, seed) {
  const rng = makeRng(mixSeed(seed, `signs-${level}`));
  if (level === 1) return makeGroups(rng, level, seed);
  if (level === 2) return makePictures(rng, level, seed);
  if (level === 3) return makeNumerals(rng, level, seed, 1, 20);
  if (level === 4) return rng.int(1, 2) === 1 ? makeJudge(rng, level, seed) : makeFill(rng, level, seed);
  return rng.int(1, 2) === 1 ? makeSum(rng, level, seed) : makeNumerals(rng, level, seed, 10, 50);
}

export function generate(level, seed) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const used = attempt === 0 ? seed : mixSeed(seed, attempt);
    const puzzle = make(level, used);
    if (puzzle && invariants(puzzle).length === 0) return puzzle;
  }
  throw new Error(`signs failed L${level} seed ${seed}`);
}

export function grade(puzzle, answer) {
  return answer === puzzle.solution;
}

function sameText(a, b) {
  return Boolean(a && b && a.et === b.et && a.en === b.en);
}

function hasMouth(copy) {
  return copy?.et?.includes("suu") && copy?.en?.toLowerCase().includes("mouth");
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.solution === p.alt) errs.push("alt same");
  if (!p.prompt?.et || !p.prompt?.en || !p.hint?.et || !p.hint?.en || !p.nudge?.et || !p.nudge?.en) errs.push("copy");
  if (!sameText(p.spoken, p.praise) || !sameText(p.spoken, p.explain)) errs.push("spoken");
  if (/\d/.test(`${p.prompt.et} ${p.prompt.en} ${p.spoken?.et || ""} ${p.spoken?.en || ""}`)) errs.push("digits");
  if (!hasMouth(p.hint)) errs.push("mouth");
  const arts = new Set(PICTURES.map((item) => item.art));

  if (p.mode === "groups") {
    if (p.level !== 1 || (p.ask !== "more" && p.ask !== "fewer")) errs.push("groups mode");
    if (!p.groups || p.groups.length !== 2) errs.push("groups");
    else {
      const [left, right] = p.groups;
      if (left.count === right.count || left.art === right.art) errs.push("groups pair");
      if (![left.count, right.count].every((n) => inRange(n, 1, 5))) errs.push("groups range");
      if (!arts.has(left.art) || !arts.has(right.art)) errs.push("art");
      const bigger = left.count > right.count ? "left" : "right";
      const expect = p.ask === "more" ? bigger : bigger === "left" ? "right" : "left";
      if (p.solution !== expect) errs.push("groups solution");
      if (!sameText(p.spoken, comparisonSentence(left.count, right.count, relation(left.count, right.count)))) errs.push("groups sentence");
    }
    return errs;
  }

  if (p.mode === "pictures") {
    if (p.level !== 2) errs.push("pictures level");
    if (![p.left, p.right].every((n) => inRange(n, 1, 10))) errs.push("pictures range");
    if (!p.leftItem || !p.rightItem || p.leftItem.art === p.rightItem.art) errs.push("pictures art");
    if (!arts.has(p.leftItem?.art) || !arts.has(p.rightItem?.art)) errs.push("art");
    if (p.solution !== relation(p.left, p.right)) errs.push("pictures sign");
    if (!sameText(p.spoken, comparisonSentence(p.left, p.right, p.solution))) errs.push("pictures sentence");
    if (p.options?.map((opt) => opt.id).join("") !== "<=>") errs.push("options");
    return errs;
  }

  if (p.mode === "numerals") {
    const min = p.level === 5 ? 10 : 1;
    const max = p.level === 5 ? 50 : 20;
    if (p.level !== 3 && p.level !== 5) errs.push("numerals level");
    if (![p.left, p.right].every((n) => inRange(n, min, max))) errs.push("numerals range");
    if (p.solution !== relation(p.left, p.right)) errs.push("numerals sign");
    if (!sameText(p.spoken, comparisonSentence(p.left, p.right, p.solution))) errs.push("numerals sentence");
    if (p.options?.map((opt) => opt.id).join("") !== "<=>") errs.push("options");
    return errs;
  }

  if (p.mode === "sum") {
    if (p.level !== 5 || !p.expr || p.expr.length !== 2) errs.push("sum");
    if (![p.expr?.[0], p.expr?.[1]].every((n) => inRange(n, 1, 5))) errs.push("addends");
    if (p.left !== p.expr[0] + p.expr[1] || !inRange(p.right, 1, 10)) errs.push("sum values");
    if (p.solution !== relation(p.left, p.right)) errs.push("sum sign");
    if (!sameText(p.spoken, comparisonSentence(p.left, p.right, p.solution, p.expr))) errs.push("sum sentence");
    if (p.options?.map((opt) => opt.id).join("") !== "<=>") errs.push("options");
    return errs;
  }

  if (p.mode === "judge") {
    if (p.level !== 4) errs.push("judge level");
    if (![p.left, p.right].every((n) => inRange(n, 1, 20))) errs.push("judge range");
    if (!["<", ">", "="].includes(p.shown)) errs.push("shown");
    const expect = p.shown === relation(p.left, p.right) ? "true" : "false";
    if (p.solution !== expect) errs.push("judge solution");
    if (!sameText(p.spoken, judgeSentence(p.left, p.right, p.shown))) errs.push("judge sentence");
    if (!p.prompt.et.startsWith(comparisonSentence(p.left, p.right, p.shown).et)) errs.push("judge prompt");
    if (p.options?.map((opt) => opt.id).join(",") !== "true,false") errs.push("options");
    return errs;
  }

  if (p.mode === "fill") {
    if (p.level !== 4) errs.push("fill level");
    if (!["<", ">", "="].includes(p.rel) || !inRange(p.target, 1, 20)) errs.push("fill");
    if (!p.options || p.options.length !== 3) errs.push("fill options");
    else {
      const fitting = p.options.filter((opt) => fits(opt.n, p.rel, p.target));
      if (fitting.length !== 1 || fitting[0].id !== p.solution) errs.push("fill unique");
      if (new Set(p.options.map((opt) => opt.n)).size !== 3) errs.push("fill dup");
      if (!p.options.some((opt) => opt.id === p.alt) || fits(Number(String(p.alt).slice(1)), p.rel, p.target)) errs.push("fill alt");
      const chosen = p.options.find((opt) => opt.id === p.solution);
      if (!chosen || !sameText(p.spoken, comparisonSentence(chosen.n, p.target, p.rel))) errs.push("fill sentence");
    }
    return errs;
  }

  errs.push("mode");
  return errs;
}
