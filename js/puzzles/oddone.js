import { makeRng, mixSeed } from "../rng.js";
import { THINGS, TAG_NAMES } from "../content.js";
import { basePuzzle, same, sortedKeys } from "./util.js";

export const meta = {
  id: "oddone",
  tier: 1,
  name: { et: "Mis ei sobi", en: "Odd one out" },
  blurb: { et: "Leia see, mis teiste hulka ei kuulu.", en: "Find the one that does not belong." },
};

function withTag(tag) {
  return THINGS.filter((t) => t.tags.includes(tag));
}

function reason(tag) {
  const name = TAG_NAMES[tag];
  return {
    id: `not-${tag}`,
    et: `Sest see ei ole ${name.et}.`,
    en: `Because it is not ${name.en}.`,
  };
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `odd-${level}`));

  if (level === 4) {
    const pairs = rng.shuffle([
      ["animal", "loomad", "animals", "vehicle", "sõidukid", "vehicles"],
      ["fruit", "puuviljad", "fruit", "clothes", "riided", "clothes"],
      ["pet", "lemmikloomad", "pets", "sky", "taevas", "the sky"],
      ["food", "söök", "food", "vehicle", "sõidukid", "vehicles"],
    ])[0];
    const [t1, et1, en1, t2, et2, en2] = pairs;
    const a = rng.shuffle(withTag(t1).filter((x) => !x.tags.includes(t2))).slice(0, 3);
    const b = rng.shuffle(withTag(t2).filter((x) => !x.tags.includes(t1))).slice(0, 3);
    if (a.length < 2 || b.length < 2) return generate(level, seed + 3);
    const items = rng.shuffle([...a.slice(0, 2), ...b.slice(0, 2)]).map((t) => ({
      id: t.id,
      icon: t.icon,
      box: t.tags.includes(t1) && !t.tags.includes(t2) ? "a" : "b",
      et: t.et,
      en: t.en,
    }));
    const boxes = [
      { id: "a", et: et1, en: en1 },
      { id: "b", et: et2, en: en2 },
    ];
    const solution = sortedKeys(items.map((it) => [it.id, it.box]));
    const alt = sortedKeys(items.map((it) => [it.id, it.box === "a" ? "b" : "a"]));
    return basePuzzle(meta, level, seed, {
      view: "sort",
      prompt: { et: "Jaota asjad kahte kasti.", en: "Sort the things into the two boxes." },
      hint: { et: "Vaata, mis on ühesugune. Pane sarnased kokku.", en: "See what is the same. Put the similar ones together." },
      nudge: { et: `Ühte kasti lähevad ${et1}.`, en: `One box is for ${en1}.` },
      praise: { et: "Rühmad on paigas.", en: "The groups are right." },
      explain: { et: `${et1} ühte kasti, ${et2} teise.`, en: `${en1} go in one box, ${en2} in the other.` },
      items,
      boxes,
      solution,
      alt,
    });
  }

  if (level === 3) {
    const striped = rng.shuffle(THINGS.filter((t) => t.striped && t.tags.includes("animal")));
    const plain = rng.shuffle(THINGS.filter((t) => !t.striped && t.tags.includes("animal") && !t.tags.includes("vehicle")));
    const group = [...striped.slice(0, 3), plain[0]];
    if (group.length < 4 || group.some((x) => !x)) return generate(level, seed + 5);
    const items = rng.shuffle(group).map((t) => ({
      id: t.id,
      icon: t.icon,
      striped: Boolean(t.striped),
      et: t.et,
      en: t.en,
    }));
    const odd = items.find((t) => !t.striped);
    return basePuzzle(meta, level, seed, {
      view: "odd",
      prompt: { et: "Mis ei sobi teiste hulka?", en: "Which one does not belong?" },
      hint: { et: "Vaata triipe. Kolmel on triibud, ühel ei ole.", en: "Look at the stripes. Three have stripes, one does not." },
      nudge: { et: "Otsi see, millel triipe ei ole.", en: "Find the one with no stripes." },
      praise: { et: "Said erinevuse kätte.", en: "You spotted the difference." },
      explain: { et: `${odd.et} ei sobi, sest sellel ei ole triipe.`, en: `The ${odd.en} does not belong, because it has no stripes.` },
      items,
      solution: odd.id,
      alt: items.find((t) => t.id !== odd.id).id,
      needReason: false,
    });
  }

  const easyTags = ["animal", "vehicle", "clothes", "fruit", "toy"];
  const close = [
    { tag: "fruit", near: "vegetable" },
    { tag: "pet", near: "farm" },
    { tag: "vehicle", near: "toy" },
  ];
  let tag;
  let oddThing;
  let group;
  if (level === 2 || level >= 5) {
    const spec = rng.pick(close);
    tag = spec.tag;
    group = rng.shuffle(withTag(tag)).slice(0, 3);
    const nears = withTag(spec.near).filter((t) => !t.tags.includes(tag));
    oddThing = rng.pick(nears);
  } else {
    tag = rng.pick(easyTags);
    group = rng.shuffle(withTag(tag)).slice(0, 3);
    const outsiders = THINGS.filter((t) => !t.tags.includes(tag) && (level === 1 ? !t.tags.includes("food") || tag !== "fruit" : true));
    oddThing = rng.pick(outsiders.filter((t) => !group.includes(t)));
  }
  if (!oddThing || group.length < 3 || group.some((g) => g.id === oddThing.id)) return generate(level, seed + 9);

  const items = rng.shuffle([...group, oddThing]).map((t) => ({
    id: t.id,
    icon: t.icon,
    et: t.et,
    en: t.en,
  }));
  const good = reason(tag);
  const wrongs = [
    { id: "blue", et: "Sest see on sinine.", en: "Because it is blue." },
    { id: "small", et: "Sest see on väike.", en: "Because it is small." },
    { id: "round", et: "Sest see on ümmargune.", en: "Because it is round." },
  ];
  const reasons = rng.shuffle([good, ...wrongs.slice(0, 2)]);
  const needReason = level >= 5;
  return basePuzzle(meta, level, seed, {
    view: "odd",
    prompt: level >= 5
      ? { et: "Mis ei sobi teiste hulka? Miks?", en: "Which one does not belong? Why?" }
      : { et: "Mis ei sobi teiste hulka?", en: "Which one does not belong?" },
    hint: { et: "Kolm on ühesugused. Üks on teistsugune.", en: "Three are the same kind. One is different." },
    nudge: { et: good.et, en: good.en },
    praise: { et: "Ja põhjendus ka.", en: "And the reason too." },
    explain: { et: `${oddThing.et[0].toUpperCase()}${oddThing.et.slice(1)} ei sobi. ${good.et}`, en: `The ${oddThing.en} does not belong. ${good.en}` },
    items,
    solution: needReason ? { id: oddThing.id, reason: good.id } : oddThing.id,
    alt: needReason ? { id: group[0].id, reason: good.id } : group[0].id,
    needReason,
    reasons: needReason ? reasons : [],
    reason: good.id,
    ruleTag: tag,
  });
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
    const boxes = {};
    for (const key of p.solution) {
      const [id, box] = key.split(">");
      boxes[box] = boxes[box] || [];
      boxes[box].push(id);
    }
    if (Object.keys(boxes).length !== 2) errs.push("boxes");
    return errs;
  }
  const oddId = p.needReason ? p.solution.id : p.solution;
  if (!grade(p, p.solution)) errs.push("grade");
  if (grade(p, p.alt)) errs.push("alt");
  const ids = p.items.map((i) => i.id);
  if (new Set(ids).size !== ids.length) errs.push("dup");
  if (!ids.includes(oddId)) errs.push("missing odd");
  if (p.level === 3) {
    const odd = p.items.find((i) => i.id === p.solution);
    if (odd.striped) errs.push("stripe");
    if (p.items.filter((i) => i.striped).length !== 3) errs.push("stripe count");
  }
  if (p.needReason && !p.reasons.some((r) => r.id === p.reason)) errs.push("reason");
  if (p.needReason && p.reasons.length !== 3) errs.push("reason count");
  return errs;
}
