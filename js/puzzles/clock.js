import { makeRng, mixSeed } from "../rng.js";
import { etClock, enClock, DAILY_EVENTS } from "../content.js";
import { basePuzzle } from "./util.js";

export const meta = {
  id: "clock",
  tier: 3,
  name: { et: "Kell", en: "Clock" },
  blurb: { et: "Täistunnid ja pooltunnid.", en: "Hours and half hours." },
};

function hourOnly() {
  return { m: 0 };
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `clock-${level}`));

  if (level === 5) {
    const event = rng.pick(DAILY_EVENTS);
    const faces = [{ h: event.h, m: event.m }];
    while (faces.length < 3) {
      const h = rng.int(1, 12);
      const m = rng.chance(0.5) ? 0 : 30;
      if (faces.some((f) => f.h === h && f.m === m)) continue;
      faces.push({ h, m });
    }
    const options = rng.shuffle(faces);
    const solution = options.findIndex((f) => f.h === event.h && f.m === event.m);
    return basePuzzle(meta, level, seed, {
      view: "clock",
      mode: "choose",
      prompt: { et: event.et, en: event.en },
      hint: { et: "Kuula kellaaeg ja vaata osuteid.", en: "Listen to the time and look at the hands." },
      nudge: { et: `Õige aeg on ${etClock(event.h, event.m)}.`, en: `The right time is ${enClock(event.h, event.m)}.` },
      praise: { et: "Õige kell.", en: "The right clock." },
      explain: { et: `${etClock(event.h, event.m)}.`, en: `${enClock(event.h, event.m)}.` },
      faces: options,
      solution,
      alt: (solution + 1) % options.length,
    });
  }

  if (level === 2) {
    const h = rng.int(1, 12);
    return basePuzzle(meta, level, seed, {
      view: "clock",
      mode: "set",
      prompt: { et: `Keera tunniosuti. Olgu kell ${etClock(h, 0)}.`, en: `Move the hour hand. Make the clock say ${enClock(h, 0)}.` },
      hint: { et: "Tunniosuti näitab numbrit. Minutiosuti on 12 peal.", en: "The hour hand points at the number. The minute hand stays on 12." },
      nudge: { et: `Tunniosuti läheb numbri ${h} peale.`, en: `The hour hand goes on ${h}.` },
      praise: { et: "Kell on paigas.", en: "The clock is set." },
      explain: { et: etClock(h, 0), en: enClock(h, 0) },
      target: { h, m: 0 },
      solution: { h, m: 0 },
      alt: { h: h === 12 ? 1 : h + 1, m: 0 },
    });
  }

  const half = level >= 4;
  const target = { h: rng.int(1, 12), m: half && rng.chance(0.55) ? 30 : 0 };
  const faces = [{ ...target }];
  while (faces.length < 3) {
    const h = rng.int(1, 12);
    const m = half ? (rng.chance(0.5) ? 30 : 0) : 0;
    if (faces.some((f) => f.h === h && f.m === m)) continue;
    faces.push({ h, m });
  }
  const options = rng.shuffle(faces);
  const solution = options.findIndex((f) => f.h === target.h && f.m === target.m);
  return basePuzzle(meta, level, seed, {
    view: "clock",
    mode: "choose",
    prompt: {
      et: `Mitmeks on kell? ${etClock(target.h, target.m)}. Vali õige kell.`,
      en: `What time is it? ${enClock(target.h, target.m)}. Choose the right clock.`,
    },
    hint: half
      ? { et: "Pool tähendab, et minutiosuti on all ja tunniosuti on kahe numbri vahel.", en: "Half past means the minute hand is at the bottom and the hour hand is between two numbers." }
      : { et: "Täistunnil on minutiosuti 12 peal ja tunniosuti numbri peal.", en: "On the hour, the minute hand is on 12 and the hour hand is on a number." },
    nudge: { et: `Otsi kella, kus on ${etClock(target.h, target.m)}.`, en: `Find the clock that says ${enClock(target.h, target.m)}.` },
    praise: { et: "Õige kellaaeg.", en: "The right time." },
    explain: { et: etClock(target.h, target.m), en: enClock(target.h, target.m) },
    faces: options,
    solution,
    alt: (solution + 1) % options.length,
    half,
  });
}

export function grade(puzzle, answer) {
  if (puzzle.mode === "set") return answer && answer.h === puzzle.solution.h && answer.m === puzzle.solution.m;
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  const times = p.mode === "set" ? [p.solution] : p.faces;
  for (const t of times) {
    if (t.m !== 0 && t.m !== 30) errs.push("minute");
    if (t.h < 1 || t.h > 12) errs.push("hour");
    if (p.level < 4 && p.mode !== "set" && t === p.faces?.[p.solution] && t.m !== 0 && p.level < 4) errs.push("early half");
  }
  if (p.level < 4 && p.mode === "choose" && p.faces[p.solution].m !== 0) errs.push("half early");
  if (p.level === 2 && p.mode !== "set") errs.push("set");
  if (!p.prompt.et || !p.prompt.en) errs.push("prompt");
  return errs;
}

export { etClock, enClock, hourOnly };
