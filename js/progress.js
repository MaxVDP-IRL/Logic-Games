import { TYPE_ORDER } from "./puzzles/index.js";

export function freshProgress() {
  return {
    v: 1,
    lang: "et",
    autoRead: true,
    levels: {},
    recent: {},
    solved: {},
    seen: {},
    lastPlayed: {},
    stickers: [],
    badges: {},
    bonusStars: 0,
    sessionsCompleted: 0,
  };
}

export function levelOf(progress, type) {
  return progress.levels[type] || 1;
}

/** Levels 1–2 move up after this many clean solves in a row. Later levels still need 4 of the last 5. */
export function promotionGoal(level) {
  if (level >= 5) return 0;
  return level <= 2 ? 3 : 4;
}

function cleanStreak(recent) {
  let n = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (!recent[i]) break;
    n += 1;
  }
  return n;
}

export function readyToPromote(level, recent) {
  const goal = promotionGoal(level);
  if (!goal) return false;
  const window = (recent || []).slice(-5);
  if (level <= 2) return cleanStreak(window) >= goal;
  return window.filter(Boolean).length >= goal;
}

/** How full the dots are toward the next level. */
export function levelTrack(progress, type) {
  const level = levelOf(progress, type);
  const recent = progress.recent[type] || [];
  const goal = promotionGoal(level);
  if (!goal) return { level, goal: 0, have: 0 };
  const window = recent.slice(-5);
  const have = level <= 2
    ? Math.min(goal, cleanStreak(window))
    : Math.min(goal, window.filter(Boolean).length);
  return { level, goal, have };
}

export function recordResult(progress, type, level, correct, today) {
  const recent = [...(progress.recent[type] || []), Boolean(correct)].slice(-5);
  progress.recent[type] = recent;
  progress.seen[type] = true;
  progress.lastPlayed[type] = today;
  if (correct) progress.solved[type] = (progress.solved[type] || 0) + 1;
  const cur = progress.levels[type] || 1;
  if (level !== cur) return { leveledUp: false, level: cur };
  const window = recent.slice(-5);
  if (readyToPromote(cur, window)) {
    progress.levels[type] = cur + 1;
    progress.recent[type] = [];
    progress.badges[type] = cur + 1;
    return { leveledUp: true, level: cur + 1 };
  }
  if (window.length >= 3 && window.slice(-3).every((x) => x === false) && cur > 1) {
    progress.levels[type] = cur - 1;
    progress.recent[type] = [];
    return { leveledUp: false, leveledDown: true, level: cur - 1 };
  }
  return { leveledUp: false, level: cur };
}

export function knownTypes(progress) {
  return TYPE_ORDER.filter((t) => (progress.solved[t] || 0) > 0);
}

export function accuracy(progress, type) {
  const recent = progress.recent[type] || [];
  if (!recent.length) return 1;
  return recent.filter(Boolean).length / recent.length;
}
