import { freshProgress } from "./progress.js";

const KEY = "nuputaja-mia-v1";

export function loadProgress() {
  const blank = freshProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank;
    const data = JSON.parse(raw);
    return {
      ...blank,
      ...data,
      levels: { ...blank.levels, ...(data.levels || {}) },
      recent: { ...blank.recent, ...(data.recent || {}) },
      solved: { ...blank.solved, ...(data.solved || {}) },
      seen: { ...blank.seen, ...(data.seen || {}) },
      lastPlayed: { ...blank.lastPlayed, ...(data.lastPlayed || {}) },
      stickers: Array.isArray(data.stickers) ? data.stickers : [],
      badges: { ...(data.badges || {}) },
    };
  } catch {
    return blank;
  }
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}
