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

export function recordResult(progress, type, level, correct, today) {
  const recent = [...(progress.recent[type] || []), Boolean(correct)].slice(-5);
  progress.recent[type] = recent;
  progress.seen[type] = true;
  progress.lastPlayed[type] = today;
  if (correct) progress.solved[type] = (progress.solved[type] || 0) + 1;
  const cur = progress.levels[type] || 1;
  if (level !== cur) return { leveledUp: false, level: cur };
  const window = recent.slice(-5);
  if (window.length >= 4 && window.filter(Boolean).length >= 4 && cur < 5) {
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
