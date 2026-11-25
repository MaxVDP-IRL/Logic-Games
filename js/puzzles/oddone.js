import { makeRng, mixSeed } from "../rng.js";
import { basePuzzle, same, sortedKeys } from "./util.js";

export const meta = {
  id: "oddone",
  tier: 1,
  name: { et: "Mis ei sobi", en: "Odd one out" },
  blurb: { et: "Leia see, mis teiste hulka ei kuulu.", en: "Find the one that does not belong." },
};

/** Pictures in assets/art/odd-one-out. Tags are the categories a fair-outsider check can see. */
const ITEMS = [
  { id: "cat", et: "kass", en: "cat", family: "animal", pool: "pet", tags: ["animal", "pet"] },
  { id: "dog", et: "koer", en: "dog", family: "animal", pool: "pet", tags: ["animal", "pet"] },
  { id: "rabbit", et: "jänes", en: "rabbit", family: "animal", pool: "pet", tags: ["animal", "pet"] },
  { id: "cow", et: "lehm", en: "cow", family: "animal", pool: "farm", tags: ["animal", "farm"] },
  { id: "pig", et: "siga", en: "pig", family: "animal", pool: "farm", tags: ["animal", "farm"] },
  { id: "horse", et: "hobune", en: "horse", family: "animal", pool: "farm", tags: ["animal", "farm"] },
  { id: "hen", et: "kana", en: "hen", family: "animal", pool: "farm", tags: ["animal", "farm"] },
  { id: "sheep", et: "lammas", en: "sheep", family: "animal", pool: "farm", tags: ["animal", "farm"] },
  { id: "fish", et: "kala", en: "fish", family: "animal", pool: "wild", tags: ["animal", "wild"] },
  { id: "bird", et: "lind", en: "bird", family: "animal", pool: "wild", tags: ["animal", "wild"] },
  { id: "bee", et: "mesilane", en: "bee", family: "animal", pool: "wild", tags: ["animal", "wild"] },
  { id: "butterfly", et: "liblikas", en: "butterfly", family: "animal", pool: "wild", tags: ["animal", "wild"] },
  { id: "apple", et: "õun", en: "apple", family: "produce", pool: "fruit", tags: ["fruit"] },
  { id: "pear", et: "pirn", en: "pear", family: "produce", pool: "fruit", tags: ["fruit"] },
  { id: "banana", et: "banaan", en: "banana", family: "produce", pool: "fruit", tags: ["fruit"] },
  { id: "strawberry", et: "maasikas", en: "strawberry", family: "produce", pool: "fruit", tags: ["fruit"] },
  { id: "orange", et: "apelsin", en: "orange", family: "produce", pool: "fruit", tags: ["fruit"] },
  { id: "grapes", et: "viinamarjad", en: "grapes", family: "produce", pool: "fruit", tags: ["fruit"] },
  { id: "carrot", et: "porgand", en: "carrot", family: "produce", pool: "vegetable", tags: ["vegetable"] },
  { id: "car", et: "auto", en: "car", family: "vehicle", pool: "land", tags: ["vehicle", "land"] },
  { id: "bus", et: "buss", en: "bus", family: "vehicle", pool: "land", tags: ["vehicle", "land"] },
  { id: "bicycle", et: "jalgratas", en: "bicycle", family: "vehicle", pool: "land", tags: ["vehicle", "land"] },
  { id: "train", et: "rong", en: "train", family: "vehicle", pool: "land", tags: ["vehicle", "land"] },
  { id: "boat", et: "paat", en: "boat", family: "vehicle", pool: "water", tags: ["vehicle", "water"] },
  { id: "plane", et: "lennuk", en: "plane", family: "vehicle", pool: "air", tags: ["vehicle", "air"] },
  { id: "hat", et: "müts", en: "hat", family: "clothes", pool: "clothes", tags: ["clothes"] },
  { id: "sock", et: "sokk", en: "sock", family: "clothes", pool: "clothes", tags: ["clothes"] },
  { id: "mitten", et: "kinnas", en: "mitten", family: "clothes", pool: "clothes", tags: ["clothes"] },
  { id: "jacket", et: "jope", en: "jacket", family: "clothes", pool: "clothes", tags: ["clothes"] },
];

const FAMILY_OF = {};
for (const item of ITEMS) FAMILY_OF[item.pool] = item.family;

const FAMILY_LABEL = {
  animal: { et: "loomad", en: "animals" },
  produce: { et: "puu- ja köögiviljad", en: "fruit and vegetables" },
  vehicle: { et: "sõidukid", en: "vehicles" },
  clothes: { et: "riided", en: "clothes" },
};

const EASY_NUDGE = {
  animal: { et: "Kolm on loomad.", en: "Three are animals." },
  produce: { et: "Kolm on puuviljad.", en: "Three are fruits." },
  vehicle: { et: "Kolm on sõidukid.", en: "Three are vehicles." },
  clothes: { et: "Kolm on riided.", en: "Three are clothes." },
};

const CLOSE_NUDGE = {
  pet: { et: "Kolm on lemmikloomad.", en: "Three are pets." },
  farm: { et: "Kolm on taluloomad.", en: "Three are farm animals." },
  wild: { et: "Kolm ei ole lemmikloomad ega taluloomad.", en: "Three are not pets or farm animals." },
  fruit: { et: "Kolm on puuviljad.", en: "Three are fruits." },
  land: { et: "Kolm on maasõidukid.", en: "Three are land vehicles." },
};

/** Spoken reason phrases. `wild` is a fairness tag only: a bee is not a "metsloom". */
const PHRASE = {
  animal: { et: "loom", en: "an animal" },
  pet: { et: "lemmikloom", en: "a pet" },
  farm: { et: "taluloom", en: "a farm animal" },
  fruit: { et: "puuvili", en: "a fruit" },
  vegetable: { et: "köögivili", en: "a vegetable" },
  vehicle: { et: "sõiduk", en: "a vehicle" },
  land: { et: "maasõiduk", en: "a land vehicle" },
  water: { et: "veesõiduk", en: "a water vehicle" },
  air: { et: "õhusõiduk", en: "an air vehicle" },
  clothes: { et: "riideese", en: "a piece of clothing" },
};

const IS_PREFERENCE = ["vehicle", "animal", "clothes", "fruit", "vegetable", "water", "air", "farm", "pet", "land"];
const IS_NOT_PREFERENCE = ["pet", "farm", "fruit", "land", "animal", "vehicle", "clothes", "vegetable"];

const CLOSE_PAIRS = [
  ["pet", "farm"],
  ["pet", "wild"],
  ["farm", "wild"],
  ["fruit", "vegetable"],
  ["land", "water"],
  ["land", "air"],
];

function poolOf(pool) {
  return ITEMS.filter((item) => item.pool === pool);
}

function copyItem(item) {
  return {
    id: item.id,
    art: item.id,
    et: item.et,
    en: item.en,
    family: item.family,
    pool: item.pool,
    tags: item.tags.slice(),
  };
}

/** Items that are the only one of their kind on any tag, including the only one missing a tag. */
export function fairOutsiders(items) {
  const found = new Set();
  const tags = new Set(items.flatMap((item) => item.tags));
  for (const tag of tags) {
    const holders = items.filter((item) => item.tags.includes(tag));
    if (holders.length === 1) found.add(holders[0].id);
    if (holders.length === items.length - 1) {
      found.add(items.find((item) => !item.tags.includes(tag)).id);
    }
  }
  return [...found];
}

function tagCounts(items) {
  const counts = {};
  for (const item of items) {
    for (const tag of item.tags) counts[tag] = (counts[tag] || 0) + 1;
  }
  return counts;
}

function claimText(kind, tag) {
  const phrase = PHRASE[tag];
  if (!phrase) return null;
  if (kind === "is") return { et: `Sest see on ${phrase.et}.`, en: `Because it is ${phrase.en}.` };
  return { et: `Sest see ei ole ${phrase.et}.`, en: `Because it is not ${phrase.en}.` };
}

function correctClaim(items, odd) {
  const counts = tagCounts(items);
  for (const tag of IS_PREFERENCE) {
    if (counts[tag] === 1 && odd.tags.includes(tag)) return { kind: "is", tag };
  }
  for (const tag of IS_NOT_PREFERENCE) {
    if (counts[tag] === items.length - 1 && !odd.tags.includes(tag)) return { kind: "isNot", tag };
  }
  return null;
}

function wrongClaims(items, odd, correct) {
  const counts = tagCounts(items);
  const claims = [];
  for (const tag of Object.keys(counts)) {
    if (!PHRASE[tag]) continue;
    const kind = odd.tags.includes(tag) ? "isNot" : "is";
    if (kind === correct.kind && tag === correct.tag) continue;
    claims.push({ kind, tag });
  }
  return claims;
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function explainEn(item, reason) {
  if (item.en === "grapes") return `The grapes do not belong. ${reason.en}`;
  return `The ${item.en} does not belong. ${reason.en}`;
}

function easySpec(rng) {
  const groups = Object.keys(FAMILY_OF).filter((pool) => poolOf(pool).length >= 3);
  const group = rng.pick(groups);
  const family = FAMILY_OF[group];
  const outsiders = Object.keys(FAMILY_OF).filter((pool) => FAMILY_OF[pool] !== family && poolOf(pool).length >= 1);
  return { group, odd: rng.pick(outsiders), close: false };
}

function closeSpec(rng) {
  const choices = [];
  for (const [a, b] of CLOSE_PAIRS) {
    if (poolOf(a).length >= 3 && poolOf(b).length >= 1) choices.push({ group: a, odd: b, close: true });
    if (poolOf(b).length >= 3 && poolOf(a).length >= 1) choices.push({ group: b, odd: a, close: true });
  }
  return rng.pick(choices);
}

function makeSort(level, seed, rng) {
  const families = rng.shuffle(["animal", "produce", "vehicle", "clothes"]);
  const groupPools = (family) => Object.keys(FAMILY_OF).filter((pool) => FAMILY_OF[pool] === family && poolOf(pool).length >= 2);
  const first = families.find((family) => groupPools(family).length);
  const second = families.find((family) => family !== first && groupPools(family).length);
  const poolA = rng.pick(groupPools(first));
  const poolB = rng.pick(groupPools(second));
  const groupA = rng.shuffle(poolOf(poolA)).slice(0, 2).map((item) => ({ ...copyItem(item), box: "a" }));
  const groupB = rng.shuffle(poolOf(poolB)).slice(0, 2).map((item) => ({ ...copyItem(item), box: "b" }));
  const items = rng.shuffle([...groupA, ...groupB]);
  if (fairOutsiders(items).length !== 0) return null;
  const labelA = FAMILY_LABEL[first];
  const labelB = FAMILY_LABEL[second];
  const boxes = [
    { id: "a", et: labelA.et, en: labelA.en },
    { id: "b", et: labelB.et, en: labelB.en },
  ];
  const solution = sortedKeys(items.map((item) => [item.id, item.box]));
  const alt = sortedKeys(items.map((item) => [item.id, item.box === "a" ? "b" : "a"]));
  return basePuzzle(meta, level, seed, {
    view: "sort",
    prompt: { et: "Jaota asjad kahte kasti.", en: "Sort the things into the two boxes." },
    hint: { et: "Vaata, mis on ühesugune. Pane sarnased kokku.", en: "See what is the same. Put the similar ones together." },
    nudge: { et: `Ühte kasti lähevad ${labelA.et}.`, en: `One box is for ${labelA.en}.` },
    praise: { et: "Rühmad on paigas.", en: "The groups are right." },
    explain: {
      et: `${cap(labelA.et)} ühte kasti, ${labelB.et} teise.`,
      en: `${cap(labelA.en)} go in one box, ${labelB.en} in the other.`,
    },
    items,
    boxes,
    solution,
    alt,
  });
}

function makeOdd(level, seed, rng) {
  const spec = level === 3 ? closeSpec(rng) : level >= 5 && rng.chance(0.55) ? closeSpec(rng) : easySpec(rng);
  const group = rng.shuffle(poolOf(spec.group)).slice(0, 3).map(copyItem);
  const odd = copyItem(rng.pick(poolOf(spec.odd)));
  if (group.length < 3 || group.some((item) => item.id === odd.id)) return null;
  const items = rng.shuffle([...group, odd]);
  const outsiders = fairOutsiders(items);
  if (outsiders.length !== 1 || outsiders[0] !== odd.id) return null;

  const prompt = level === 1
    ? { et: "Kolm asja on ühte liiki. Milline on erinev?", en: "Three are the same kind of thing. Which one is different?" }
    : level >= 5
      ? { et: "Mis ei sobi teiste hulka? Miks?", en: "Which one does not belong? Why?" }
      : { et: "Mis ei sobi teiste hulka?", en: "Which one does not belong?" };
  const familyNudge = spec.close ? CLOSE_NUDGE[spec.group] : EASY_NUDGE[group[0].family];
  const needReason = level >= 5;
  let reasons = [];
  let good = null;
  if (needReason) {
    const claim = correctClaim(items, odd);
    if (!claim) return null;
    const text = claimText(claim.kind, claim.tag);
    if (!text) return null;
    good = { id: `${claim.kind}:${claim.tag}`, ...text };
    const wrongs = rng.shuffle(wrongClaims(items, odd, claim)).slice(0, 2).map((entry) => {
      const line = claimText(entry.kind, entry.tag);
      return line ? { id: `${entry.kind}:${entry.tag}`, ...line } : null;
    });
    if (wrongs.some((entry) => !entry) || wrongs.length < 2) return null;
    reasons = rng.shuffle([good, ...wrongs]);
  }
  const nudge = needReason ? { et: good.et, en: good.en } : familyNudge;
  const hintNote = familyNudge.en.replace(/\.$/, "");
  const plainEn = odd.en === "grapes" ? `The grapes do not belong. ${hintNote}.` : `The ${odd.en} does not belong. ${hintNote}.`;
  return basePuzzle(meta, level, seed, {
    view: "odd",
    prompt,
    hint: level >= 5
      ? { et: "Leia erinev ja ütle, mis liiki see on.", en: "Find the different one and say what kind it is." }
      : { et: "Kolm on ühesugused. Üks on teistsugune.", en: "Three are the same kind. One is different." },
    nudge,
    praise: needReason
      ? { et: "Ja põhjendus ka.", en: "And the reason too." }
      : { et: "Said erinevuse kätte.", en: "You spotted the difference." },
    explain: {
      et: `${cap(odd.et)} ei sobi. ${needReason ? good.et : familyNudge.et}`,
      en: needReason ? explainEn(odd, good) : plainEn,
    },
    items,
    solution: needReason ? { id: odd.id, reason: good.id } : odd.id,
    alt: needReason ? { id: group[0].id, reason: good.id } : group[0].id,
    needReason,
    reasons: needReason ? reasons : [],
    reason: good ? good.id : "",
    rule: spec.group,
  });
}

export function generate(level, seed) {
  for (let attempt = 0; attempt < 24; attempt++) {
    const used = attempt === 0 ? seed : mixSeed(seed, attempt);
    const rng = makeRng(mixSeed(used, `odd-${level}`));
    const puzzle = level === 4 ? makeSort(level, seed, rng) : makeOdd(level, seed, rng);
    if (puzzle && invariants(puzzle).length === 0) return puzzle;
  }
  throw new Error(`oddone failed L${level} seed ${seed}`);
}

export function grade(puzzle, answer) {
  if (puzzle.view === "sort") return Array.isArray(answer) && same([...answer].sort(), puzzle.solution);
  if (puzzle.needReason) {
    return Boolean(answer) && answer.id === puzzle.solution.id && answer.reason === puzzle.solution.reason;
  }
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (p.view === "sort") {
    if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
    if (p.items.length !== 4) errs.push("count");
    const boxes = {};
    for (const item of p.items) {
      boxes[item.box] = boxes[item.box] || [];
      boxes[item.box].push(item);
    }
    const groups = Object.values(boxes);
    if (groups.length !== 2) errs.push("boxes");
    for (const group of groups) {
      if (group.length !== 2) errs.push("box size");
      if (group[0].family !== group[1].family || group[0].pool !== group[1].pool) errs.push("mix");
    }
    if (new Set(groups.map((group) => group[0].family)).size !== 2) errs.push("same family");
    if (fairOutsiders(p.items).length !== 0) errs.push("singleton");
    if (p.items.some((item) => !item.art)) errs.push("art");
    return errs;
  }
  const oddId = p.needReason ? p.solution.id : p.solution;
  if (!grade(p, p.solution)) errs.push("grade");
  if (grade(p, p.alt)) errs.push("alt");
  const ids = p.items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) errs.push("dup");
  if (p.items.length !== 4) errs.push("count");
  if (!ids.includes(oddId)) errs.push("missing odd");
  const outsiders = fairOutsiders(p.items);
  if (outsiders.length !== 1 || outsiders[0] !== oddId) errs.push(`fair:${outsiders.join(",")}`);
  if (/triip|stripe|sinine|väike|\bblue\b|\bsmall\b/i.test(`${p.prompt.et} ${p.prompt.en} ${p.hint.et} ${p.hint.en}`)) errs.push("banned");
  if (p.level === 1) {
    if (!p.prompt.en.includes("same kind of thing")) errs.push("l1 en");
    if (!p.prompt.et.includes("ühte liiki")) errs.push("l1 et");
  }
  const odd = p.items.find((item) => item.id === oddId);
  const others = p.items.filter((item) => item.id !== oddId);
  if (p.level <= 2) {
    if (others.some((item) => item.family !== others[0].family)) errs.push("group");
    if (odd.family === others[0].family) errs.push("easy family");
  }
  if (p.level === 3) {
    if (others.some((item) => item.family !== odd.family)) errs.push("close family");
    if (others.some((item) => item.pool !== others[0].pool)) errs.push("close pool");
    if (odd.pool === others[0].pool) errs.push("close odd");
  }
  if (p.needReason) {
    if (p.level < 5) errs.push("reason level");
    if (!p.reasons.some((reason) => reason.id === p.reason)) errs.push("reason");
    if (p.reasons.length !== 3) errs.push("reason count");
    if (new Set(p.reasons.map((reason) => reason.id)).size !== 3) errs.push("reason dup");
    const blob = p.reasons.map((reason) => `${reason.et} ${reason.en}`).join(" ");
    if (/sinine|väike|\bblue\b|\bsmall\b/i.test(blob)) errs.push("banned reason");
    for (const reason of p.reasons) {
      const [kind, tag] = reason.id.split(":");
      const text = claimText(kind, tag);
      if (!text || reason.et !== text.et || reason.en !== text.en) errs.push("phrase");
      if (!p.items.some((item) => item.tags.includes(tag))) errs.push("tag missing");
      const holders = p.items.filter((item) => item.tags.includes(tag)).length;
      const has = odd.tags.includes(tag);
      if (reason.id === p.reason) {
        if (kind === "is" && !(has && holders === 1)) errs.push("correct is");
        if (kind === "isNot" && !(!has && holders === 3)) errs.push("correct not");
      } else if ((kind === "is" && has) || (kind === "isNot" && !has)) errs.push("wrong true");
    }
  } else if (p.reasons.length) errs.push("reasons");
  if (p.items.some((item) => !item.art)) errs.push("art");
  return errs;
}
