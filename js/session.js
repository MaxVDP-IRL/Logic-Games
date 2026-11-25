import { makeRng, mixSeed } from "./rng.js";
import { TYPE_ORDER } from "./puzzles/index.js";
import { generateFresh } from "./puzzles/variety.js";
import { knownTypes, levelOf, accuracy } from "./progress.js";

export const SESSION_SIZE = 6;

function daysBetween(earlier, later) {
  if (!earlier || !later) return 99;
  const a = Date.parse(`${earlier}T00:00:00Z`);
  const b = Date.parse(`${later}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

export function pickReview(progress, known, rng, today) {
  const spaced = known.filter((t) => [1, 3, 7].includes(daysBetween(progress.lastPlayed[t], today)));
  if (spaced.length) return rng.pick(spaced);
  return [...known].sort((a, b) => accuracy(progress, a) - accuracy(progress, b) || String(progress.lastPlayed[a] || "").localeCompare(String(progress.lastPlayed[b] || "")))[0];
}

export function planSession(progress, seed, today = "2026-11-23") {
  const rng = makeRng(typeof seed === "number" ? seed : mixSeed(seed, "session"));
  const known = knownTypes(progress);
  const unknown = TYPE_ORDER.filter((t) => !known.includes(t));
  const items = [];
  let salt = 0;
  const recentByType = {};
  const make = (type, mode) => {
    salt += 1;
    const level = levelOf(progress, type);
    const recent = recentByType[type] || [];
    const { puzzle, key } = generateFresh(type, level, mixSeed(seed, `${mode}:${type}:${salt}`), recent);
    recentByType[type] = recent.concat(key).slice(-8);
    return { type, mode, level, puzzle };
  };

  if (known.length === 0) {
    const type = "missing";
    return {
      newType: type,
      review: null,
      items: [
        make(type, "example"),
        make(type, "guided"),
        make(type, "solo"),
        make(type, "solo"),
        make(type, "solo"),
        make(type, "solo"),
      ],
    };
  }

  const newType = unknown[0] || null;
  if (newType) {
    items.push(make(newType, "example"));
    items.push(make(newType, "guided"));
    items.push(make(newType, "solo"));
  }
  const review = pickReview(progress, known, rng, today);
  items.push(make(review, "solo"));
  const pool = known.filter((t) => t !== review);
  const mix = pool.length ? pool : known;
  let guard = 0;
  while (items.length < SESSION_SIZE && guard++ < 12) items.push(make(rng.pick(mix), "solo"));
  const fresh = items.filter((it) => it.mode !== "solo" || !known.includes(it.type));
  const introduced = [...new Set(fresh.map((it) => it.type))];
  return { newType, review, items: items.slice(0, SESSION_SIZE), introduced };
}
