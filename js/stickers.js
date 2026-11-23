/** A collection, not a coin per tap. Session stickers, then gold stars. */

export const STICKERS = [
  { id: "fox", set: "mets", et: "Rebane", en: "Fox", icon: "fox", bg: "#e07a3d" },
  { id: "rabbit", set: "mets", et: "Jänes", en: "Rabbit", icon: "rabbit", bg: "#e7b3a1" },
  { id: "mushroom", set: "mets", et: "Seen", en: "Mushroom", icon: "mushroom", bg: "#d64545" },
  { id: "tree", set: "mets", et: "Kask", en: "Birch", icon: "tree", bg: "#7dae6a" },
  { id: "berry", set: "mets", et: "Mari", en: "Berry", icon: "berry", bg: "#b4234a" },
  { id: "bird", set: "mets", et: "Lind", en: "Bird", icon: "bird", bg: "#7eb0c8" },
  { id: "fish", set: "meri", et: "Kala", en: "Fish", icon: "fish", bg: "#3d7ec4" },
  { id: "boat", set: "meri", et: "Paat", en: "Boat", icon: "boat", bg: "#de6b48" },
  { id: "rain", set: "meri", et: "Vihm", en: "Rain", icon: "rain", bg: "#8eb8d8" },
  { id: "moon", set: "meri", et: "Kuu", en: "Moon", icon: "moon", bg: "#f0d78c" },
  { id: "star", set: "meri", et: "Täht", en: "Star", icon: "star", bg: "#f2c14e" },
  { id: "umbrella", set: "meri", et: "Vihmavari", en: "Umbrella", icon: "umbrella", bg: "#d35d6e" },
  { id: "apple", set: "aed", et: "Õun", en: "Apple", icon: "apple", bg: "#d64545" },
  { id: "flower", set: "aed", et: "Lill", en: "Flower", icon: "flower", bg: "#e38bb4" },
  { id: "bee", set: "aed", et: "Mesilane", en: "Bee", icon: "bee", bg: "#f0c84a" },
  { id: "butterfly", set: "aed", et: "Liblikas", en: "Butterfly", icon: "butterfly", bg: "#c9a0dc" },
  { id: "sun", set: "aed", et: "Päike", en: "Sun", icon: "sun", bg: "#f2c14e" },
  { id: "leaf", set: "aed", et: "Leht", en: "Leaf", icon: "leaf", bg: "#6ea15a" },
  { id: "cat", set: "kodu", et: "Kass", en: "Cat", icon: "cat", bg: "#e7b3a1" },
  { id: "dog", set: "kodu", et: "Koer", en: "Dog", icon: "dog", bg: "#d7a15e" },
  { id: "house", set: "kodu", et: "Maja", en: "House", icon: "house", bg: "#de6b48" },
  { id: "hat", set: "kodu", et: "Müts", en: "Hat", icon: "hat", bg: "#6ea15a" },
  { id: "ball", set: "kodu", et: "Pall", en: "Ball", icon: "ball", bg: "#3d7ec4" },
  { id: "heart", set: "kodu", et: "Süda", en: "Heart", icon: "heart", bg: "#d64545" },
];

export const SETS = [
  { id: "mets", et: "Mets", en: "Forest" },
  { id: "meri", et: "Meri", en: "Sea" },
  { id: "aed", et: "Aed", en: "Garden" },
  { id: "kodu", et: "Kodu", en: "Home" },
];

export function stickerById(id) {
  return STICKERS.find((s) => s.id === id);
}

/** Award the next sticker, or a gold star when the album is complete. */
export function awardSessionSticker(progress) {
  const next = STICKERS.find((s) => !progress.stickers.includes(s.id));
  if (next) {
    progress.stickers.push(next.id);
    return { sticker: next, star: false };
  }
  progress.bonusStars = (progress.bonusStars || 0) + 1;
  return { sticker: null, star: true };
}
