import { makeRng, mixSeed } from "../rng.js";
import { NAMES, HATS } from "../content.js";
import { basePuzzle, permutations, same } from "./util.js";

export const meta = {
  id: "wordlogic",
  tier: 2,
  name: { et: "Sõnaloogika", en: "Word logic" },
  blurb: { et: "Kuula vihjeid ja mõtle järele.", en: "Listen to the clues and think them through." },
};

const POS = [
  { id: "left", et: "vasakul", en: "on the left" },
  { id: "mid", et: "keskel", en: "in the middle" },
  { id: "right", et: "paremal", en: "on the right" },
];

function orderHolds(order, clues) {
  const index = Object.fromEntries(order.map((p, i) => [p.id, i]));
  return clues.every((c) => {
    if (c.kind === "taller") return index[c.a] < index[c.b];
    return false;
  });
}

function whoAnswers(people, clues, ask) {
  const set = new Set();
  for (const order of permutations(people)) {
    if (!orderHolds(order, clues)) continue;
    if (ask === "taller" && people.length === 2) set.add(order[0].id);
    else if (ask === "tallest") set.add(order[0].id);
    else set.add(order[order.length - 1].id);
  }
  return [...set];
}

function assignHolds(map, clues) {
  return clues.every((c) => {
    if (c.kind === "is") return map[c.person] === c.trait;
    if (c.kind === "not") return map[c.person] !== c.trait;
    return false;
  });
}

function mapsOf(people, traits) {
  return permutations(traits).map((order) => {
    const map = {};
    people.forEach((p, i) => {
      map[p.id] = order[i].id;
    });
    return map;
  });
}

function placeHolds(map, clues) {
  const index = { left: 0, mid: 1, right: 2 };
  return clues.every((c) => {
    if (c.kind === "at") return map[c.person] === c.place;
    if (c.kind === "notAt") return map[c.person] !== c.place;
    if (c.kind === "leftOf") return index[map[c.a]] < index[map[c.b]];
    return false;
  });
}

function serializeMap(map) {
  return Object.keys(map).sort().map((k) => `${k}=${map[k]}`).join("|");
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `word-${level}`));

  if (level <= 2) {
    const n = level === 1 ? 2 : 3;
    const people = rng.shuffle(NAMES).slice(0, n);
    const order = rng.shuffle(people);
    const clues = [];
    for (let i = 0; i < order.length - 1; i++) {
      clues.push({
        kind: "taller",
        a: order[i].id,
        b: order[i + 1].id,
        et: `${order[i].et} on pikem kui ${order[i + 1].et}.`,
        en: `${order[i].et} is taller than ${order[i + 1].et}.`,
      });
    }
    const ask = level === 1 ? "taller" : rng.chance(0.5) ? "tallest" : "shortest";
    const answers = whoAnswers(people, clues, ask);
    if (answers.length !== 1) throw new Error("word chain not unique");
    const question = ask === "shortest"
      ? { et: "Kes on kõige lühem?", en: "Who is the shortest?" }
      : ask === "tallest"
        ? { et: "Kes on kõige pikem?", en: "Who is the tallest?" }
        : { et: "Kes on pikem?", en: "Who is taller?" };
    return basePuzzle(meta, level, seed, {
      view: "word",
      mode: "who",
      prompt: { et: `Kuula vihjeid. ${question.et} Tõmba talle ring ümber.`, en: `Listen to the clues. ${question.en} Circle them.` },
      hint: { et: "Pikem tähendab, et see laps on teisest pikem.", en: "Taller means that child is taller than the other." },
      nudge: { et: clues[0].et, en: clues[0].en },
      praise: { et: "Sa mõtlesid vihjetest õigesti välja.", en: "You worked it out from the clues." },
      explain: {
        et: ask === "shortest" ? `${people.find((p) => p.id === answers[0]).et} on kõige lühem.` : `${people.find((p) => p.id === answers[0]).et} on kõige pikem.`,
        en: ask === "shortest" ? `${people.find((p) => p.id === answers[0]).et} is the shortest.` : `${people.find((p) => p.id === answers[0]).et} is the tallest.`,
      },
      people,
      clues,
      question,
      solution: answers[0],
      alt: people.find((p) => p.id !== answers[0]).id,
    });
  }

  if (level === 4) {
    const people = rng.shuffle(NAMES).slice(0, 3);
    const places = rng.shuffle(POS.map((p) => p.id));
    const truth = {};
    people.forEach((p, i) => {
      truth[p.id] = places[i];
    });
    const possible = [];
    for (const p of people) {
      const place = truth[p.id];
      const word = POS.find((x) => x.id === place);
      possible.push({
        kind: "at",
        person: p.id,
        place,
        et: `${p.et} seisab ${word.et}.`,
        en: `${p.et} is standing ${word.en}.`,
      });
      for (const other of POS) {
        if (other.id === place) continue;
        possible.push({
          kind: "notAt",
          person: p.id,
          place: other.id,
          et: `${p.et} ei seisa ${other.et}.`,
          en: `${p.et} is not standing ${other.en}.`,
        });
      }
    }
    for (let i = 0; i < people.length; i++) {
      for (let j = 0; j < people.length; j++) {
        if (i === j) continue;
        const ia = POS.findIndex((x) => x.id === truth[people[i].id]);
        const ib = POS.findIndex((x) => x.id === truth[people[j].id]);
        if (ia < ib) {
          possible.push({
            kind: "leftOf",
            a: people[i].id,
            b: people[j].id,
            et: `${people[i].et} seisab ${people[j].ela} vasakul.`,
            en: `${people[i].et} is standing to the left of ${people[j].et}.`,
          });
        }
      }
    }
    const chosen = pickClues(rng, possible, (clues) => {
      const maps = permutations(POS).map((order) => {
        const map = {};
        people.forEach((p, i) => {
          map[p.id] = order[i].id;
        });
        return map;
      }).filter((map) => placeHolds(map, clues));
      return maps.length === 1 ? maps[0] : null;
    }, 3, 4);
    if (!chosen) return generate(level, seed + 13);
    return basePuzzle(meta, level, seed, {
      view: "word",
      mode: "place",
      prompt: { et: "Kuula vihjeid. Kes seisab kus?", en: "Listen to the clues. Who stands where?" },
      hint: { et: "Vasakul tähendab sinu vasakut kätt.", en: "On the left means your left hand." },
      nudge: { et: chosen.clues[0].et, en: chosen.clues[0].en },
      praise: { et: "Kõik seisavad õiges kohas.", en: "Everyone is in the right place." },
      explain: { et: "Iga vihje jätab alles ühe võimaluse.", en: "Each clue leaves one possibility." },
      people,
      places: POS,
      clues: chosen.clues,
      solution: serializeMap(chosen.map),
      alt: serializeMap({ ...chosen.map, [people[0].id]: chosen.map[people[1].id] }),
    });
  }

  const count = level === 5 ? 4 : 3;
  const people = rng.shuffle(NAMES).slice(0, count);
  const hats = rng.shuffle(HATS).slice(0, count);
  const truthOrder = rng.shuffle(hats);
  const truth = {};
  people.forEach((p, i) => {
    truth[p.id] = truthOrder[i].id;
  });
  const possible = [];
  for (const p of people) {
    const hat = hats.find((h) => h.id === truth[p.id]);
    possible.push({
      kind: "is",
      person: p.id,
      trait: hat.id,
      et: `${p.ad} on ${hat.et}.`,
      en: `${p.et} has ${hat.en}.`,
    });
    for (const other of hats) {
      if (other.id === hat.id) continue;
      if (level < 5 && rng.chance(0.45)) continue;
      possible.push({
        kind: "not",
        person: p.id,
        trait: other.id,
        et: `${p.ad} ei ole ${other.etNeg}.`,
        en: `${p.et} does not have ${other.en}.`,
      });
    }
  }
  const chosen = pickClues(rng, possible, (clues) => {
    const maps = mapsOf(people, hats).filter((map) => assignHolds(map, clues));
    return maps.length === 1 ? maps[0] : null;
  }, level === 5 ? 4 : 3, level === 5 ? 5 : 4, level === 5);
  if (!chosen) return generate(level, seed + 19);
  return basePuzzle(meta, level, seed, {
    view: "word",
    mode: "assign",
    prompt: { et: "Kuula vihjeid. Kellel on milline müts?", en: "Listen to the clues. Who has which hat?" },
    hint: { et: "Kui ühel lapsel on müts käes, ei saa see teisel olla.", en: "If one child has a hat, another child cannot have it." },
    nudge: { et: chosen.clues[0].et, en: chosen.clues[0].en },
    praise: { et: "Mütsid on õigetel lastel.", en: "The hats are on the right children." },
    explain: { et: "Iga müts kuulub ühele lapsele.", en: "Each hat belongs to one child." },
    people,
    traits: hats,
    clues: chosen.clues,
    solution: serializeMap(chosen.map),
    alt: serializeMap({ ...chosen.map, [people[0].id]: hats.find((h) => h.id !== chosen.map[people[0].id]).id }),
  });
}

function pickClues(rng, possible, uniqueMap, min, max, needNegative = false) {
  const bag = rng.shuffle(possible);
  for (let start = 0; start < 12; start++) {
    const clues = [];
    for (const clue of rng.shuffle(bag)) {
      clues.push(clue);
      const map = uniqueMap(clues);
      if (map && clues.length >= min && clues.length <= max) {
        if (needNegative && !clues.some((c) => c.kind === "not" || c.kind === "notAt")) continue;
        const pruned = clues.slice();
        for (let i = pruned.length - 1; i >= 0; i--) {
          const trial = pruned.filter((_, j) => j !== i);
          if (trial.length < min) continue;
          if (needNegative && !trial.some((c) => c.kind === "not" || c.kind === "notAt")) continue;
          if (uniqueMap(trial)) pruned.splice(i, 1);
        }
        const finalMap = uniqueMap(pruned);
        if (finalMap && pruned.length >= min && pruned.length <= max) return { clues: pruned, map: finalMap };
      }
      if (clues.length > max + 2) break;
    }
  }
  return null;
}

export function grade(puzzle, answer) {
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (!p.clues.length) errs.push("clues");
  if (p.clues.some((c) => !c.et || !c.en)) errs.push("lang");
  if (p.mode === "who") {
    const ask = p.question.et.includes("lühem") ? "shortest" : p.question.et.includes("pikem?") && p.people.length === 2 ? "taller" : "tallest";
    const answers = whoAnswers(p.people, p.clues, ask === "taller" && p.people.length === 2 ? "taller" : ask === "shortest" ? "shortest" : "tallest");
    if (answers.length !== 1 || answers[0] !== p.solution) errs.push("who " + answers.join(","));
  }
  if (p.mode === "assign") {
    const maps = mapsOf(p.people, p.traits).filter((map) => assignHolds(map, p.clues));
    if (maps.length !== 1 || serializeMap(maps[0]) !== p.solution) errs.push("assign");
    if (p.level === 5 && !p.clues.some((c) => c.kind === "not")) errs.push("negative");
  }
  if (p.mode === "place") {
    const maps = permutations(POS).map((order) => {
      const map = {};
      p.people.forEach((person, i) => {
        map[person.id] = order[i].id;
      });
      return map;
    }).filter((map) => placeHolds(map, p.clues));
    if (maps.length !== 1 || serializeMap(maps[0]) !== p.solution) errs.push("place");
  }
  return errs;
}
