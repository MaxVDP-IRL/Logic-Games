/** Black-line worksheet drawings. Colour is optional and used only when the task needs it. */

function svg(body, size, extra = "") {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="draw" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
}

const PATHS = {
  apple: `<path d="M32 16c1-6 8-8 11-6-2 5-6 7-9 7"/><path d="M32 20c-12 1-18 12-16 24 2 10 10 16 16 16s14-6 16-16c2-12-4-23-16-24z"/><path d="M32 24v26"/>`,
  pear: `<path d="M34 14c2-5 8-6 10-4"/><path d="M32 18c-8 2-14 10-14 18 0 12 8 22 16 22 10 0 18-8 16-20-2-10-8-18-18-20z"/>`,
  banana: `<path d="M14 28c8-14 28-16 38-6 2 8-6 14-16 16-8 2-16 8-18 14-4-6-8-14-4-24z"/><path d="M18 30c8 2 16 2 24-4"/>`,
  carrot: `<path d="M18 22c10 4 22 16 24 34-10-2-22-12-26-28 0-4 0-6 2-6z"/><path d="M24 16c2 4 6 6 10 6M30 12c2 4 4 8 4 12M36 16c0 4-2 8-4 10"/>`,
  berry: `<circle cx="32" cy="34" r="14"/><path d="M32 16c2 4 2 8 0 12M24 22c4 2 6 4 8 8M40 22c-4 2-6 4-8 8"/><circle cx="27" cy="34" r="1.2" fill="currentColor" stroke="none"/><circle cx="35" cy="32" r="1.2" fill="currentColor" stroke="none"/><circle cx="32" cy="40" r="1.2" fill="currentColor" stroke="none"/>`,
  flower: `<circle cx="32" cy="34" r="5"/><circle cx="32" cy="20" r="6"/><circle cx="44" cy="28" r="6"/><circle cx="40" cy="44" r="6"/><circle cx="24" cy="44" r="6"/><circle cx="20" cy="28" r="6"/>`,
  mushroom: `<path d="M10 32c4-16 40-16 44 0z"/><path d="M26 32v16c0 4 12 4 12 0V32"/><circle cx="24" cy="26" r="3"/><circle cx="38" cy="24" r="2.4"/>`,
  tree: `<path d="M32 58V34"/><path d="M32 40 14 40c6-10 8-16 18-24 10 8 12 14 18 24z"/><path d="M32 28 18 28c4-8 8-12 14-16 6 4 10 8 14 16z"/>`,
  dog: `<circle cx="30" cy="30" r="12"/><path d="M20 24c-6 2-10 8-8 12M40 22c6-6 12-2 12 6"/><circle cx="26" cy="28" r="1.3" fill="currentColor" stroke="none"/><circle cx="34" cy="28" r="1.3" fill="currentColor" stroke="none"/><path d="M28 34h6"/><path d="M22 42c2 10 16 12 22 4"/>`,
  cat: `<circle cx="32" cy="32" r="12"/><path d="M22 24 18 12l8 8M42 24l4-12-8 8"/><circle cx="27" cy="32" r="1.3" fill="currentColor" stroke="none"/><circle cx="37" cy="32" r="1.3" fill="currentColor" stroke="none"/><path d="M32 34v3M29 38h6M14 36c6 2 8 4 8 4M50 36c-6 2-8 4-8 4"/><path d="M44 42c6 8 4 14-2 14"/>`,
  rabbit: `<ellipse cx="32" cy="38" rx="12" ry="14"/><path d="M24 28c-2-16 6-20 8-8M40 28c2-16-6-20-8-8"/><circle cx="28" cy="38" r="1.2" fill="currentColor" stroke="none"/><circle cx="36" cy="38" r="1.2" fill="currentColor" stroke="none"/><path d="M32 41v2"/>`,
  bird: `<path d="M14 36c8-2 14-10 18-16 6 8 16 12 22 8-8 2-12 8-14 14-8-2-16-2-26-6z"/><path d="M34 28l8-2-6 6"/><circle cx="28" cy="32" r="1.2" fill="currentColor" stroke="none"/><path d="M30 46v8M38 46v6"/>`,
  fish: `<ellipse cx="28" cy="32" rx="16" ry="10"/><path d="M44 32l12-10v20z"/><circle cx="20" cy="30" r="1.4" fill="currentColor" stroke="none"/><path d="M24 32h10"/>`,
  cow: `<ellipse cx="32" cy="38" rx="16" ry="12"/><circle cx="22" cy="24" r="8"/><path d="M16 20c-2-6 2-10 4-8M26 16c2-6 6-6 6-2"/><circle cx="20" cy="24" r="1" fill="currentColor" stroke="none"/><path d="M18 50v8M28 50v8M38 50v8M48 50v8"/><path d="M46 36c6 2 8 6 6 10"/>`,
  bee: `<ellipse cx="32" cy="34" rx="12" ry="8"/><path d="M24 34h16M28 28c0 12 0 12 0 12M36 28c0 12 0 12 0 12"/><circle cx="18" cy="32" r="4"/><path d="M26 26c-4-10 4-12 6-4M38 26c4-10-2-12-6-4"/>`,
  zebra: `<ellipse cx="34" cy="38" rx="14" ry="10"/><path d="M22 32c-2-10 6-16 10-8"/><path d="M18 28l-6-8M20 34l-8 2"/><path d="M28 32v12M36 30v14M44 34v8"/><path d="M24 50v8M32 50v8M42 50v8"/><path d="M46 36c8 0 10 6 8 10"/>`,
  butterfly: `<path d="M32 22v28"/><path d="M32 30c-10-12-22-8-20 2s12 10 20 4c8 6 18 2 20-4s-10-14-20-2z"/><path d="M32 36c-8 8-16 8-16 2M32 36c8 8 16 8 16 2"/><path d="M32 18c-4-6-2-10 0-8 2-2 4 2 0 8"/>`,
  bus: `<rect x="8" y="18" width="48" height="28" rx="4"/><path d="M8 32h48M16 46v6M44 46v6"/><circle cx="20" cy="48" r="4"/><circle cx="44" cy="48" r="4"/><rect x="14" y="22" width="10" height="7"/><rect x="28" y="22" width="10" height="7"/><rect x="42" y="22" width="8" height="7"/>`,
  car: `<path d="M8 38h48v10H8z"/><path d="M16 38l6-12h16l8 12"/><circle cx="18" cy="48" r="5"/><circle cx="46" cy="48" r="5"/><path d="M24 26v12M36 26v12"/>`,
  boat: `<path d="M10 36h44l-6 12H18z"/><path d="M32 36V16"/><path d="M32 18l16 14H32"/><path d="M8 52c6 4 10 4 16 0s10-4 16 0 10 4 16 0"/>`,
  sock: `<path d="M26 10h12v28l10 8c4 6-2 14-12 12-6-2-10-8-10-8V10z"/>`,
  shoe: `<path d="M10 36c8-2 16-8 22-8h18c4 0 6 4 6 8v4H10v-4z"/><path d="M14 36c2-8 8-14 14-14"/>`,
  hat: `<path d="M12 40h40"/><path d="M18 40c0-12 6-20 14-20s14 8 14 20"/><path d="M22 28h20"/>`,
  glove: `<path d="M22 30V14M30 28V10M38 28V14M44 32c2 4 2 8 0 14-6 10-20 12-28 4l-4-8 6-4 2 6V30"/>`,
  ball: `<circle cx="32" cy="32" r="18"/><path d="M32 14c4 6 4 10 0 16s-4 10 0 18M14 32c6-4 10-4 16 0s10 4 18 0M20 20c6 4 8 6 8 12"/>`,
  star: `<path d="M32 10l6 14 15 1-11 10 3 15-13-8-13 8 3-15L11 25l15-1z"/>`,
  sun: `<circle cx="32" cy="32" r="10"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6"/>`,
  moon: `<path d="M36 12c-12 4-18 16-14 28 4 10 14 14 24 12-8 4-20 2-26-8S16 16 36 12z"/>`,
  house: `<path d="M8 30 32 12l24 18"/><path d="M14 28v24h36V28"/><path d="M28 52V38h8v14"/>`,
  cup: `<path d="M16 16h28l-3 28H20z"/><path d="M44 22h6c4 0 6 6 2 10h-8"/>`,
  nest: `<path d="M12 34c4 12 36 12 40 0"/><path d="M16 34c2-6 6-8 8-4M26 32c2-8 8-8 10-2M40 34c0-6 6-8 8-2"/><circle cx="26" cy="30" r="3"/><circle cx="34" cy="28" r="3"/>`,
  wheel: `<circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="4"/><path d="M32 14v14M32 36v14M14 32h14M36 32h14"/>`,
  saucer: `<ellipse cx="32" cy="34" rx="20" ry="8"/><path d="M14 34c2 8 32 8 36 0"/>`,
  key: `<circle cx="22" cy="26" r="8"/><path d="M28 30l20 16M40 40v8M46 44v6"/>`,
  lock: `<rect x="16" y="28" width="32" height="24" rx="3"/><path d="M22 28v-6c0-8 20-8 20 0v6"/><circle cx="32" cy="40" r="3"/>`,
  rain: `<path d="M18 40c-8-2-10-12-2-16 0-10 16-12 22-4 8-2 14 6 10 14"/><path d="M20 48v6M30 50v8M40 48v6"/>`,
  umbrella: `<path d="M12 30c0-14 40-14 40 0z"/><path d="M32 30v18c0 6 8 6 8 0"/><path d="M12 30h40M22 30c0 4 4 6 6 0M36 30c2 6 8 4 8 0"/>`,
  bone: `<path d="M16 24c-6 0-8 8-2 10l18 6 6-18-12-4c-2-4-8-4-10 6z"/><circle cx="14" cy="22" r="5"/><circle cx="22" cy="16" r="5"/><circle cx="46" cy="42" r="5"/><circle cx="40" cy="50" r="5"/>`,
  kitten: `<circle cx="32" cy="36" r="12"/><path d="M22 28 18 16l8 8M42 28l4-12-8 8"/><circle cx="28" cy="36" r="1.2" fill="currentColor" stroke="none"/><circle cx="36" cy="36" r="1.2" fill="currentColor" stroke="none"/>`,
  puppy: `<circle cx="32" cy="36" r="12"/><path d="M20 30c-8 0-10 8-4 10M44 28c6-6 12 0 8 8"/><circle cx="28" cy="36" r="1.2" fill="currentColor" stroke="none"/><circle cx="36" cy="36" r="1.2" fill="currentColor" stroke="none"/>`,
  calf: `<ellipse cx="32" cy="38" rx="12" ry="10"/><circle cx="24" cy="26" r="7"/><path d="M18 22c-2-4 2-6 3-4M28 18c1-4 4-4 4-1"/><path d="M22 48v6M30 48v6M40 48v6"/>`,
  wing: `<path d="M12 40c10-18 30-22 42-14-8 2-16 10-18 20-8-2-16-4-24-6z"/>`,
  leaf: `<path d="M14 50C18 28 36 14 52 12 48 36 32 50 14 50z"/><path d="M18 46C28 36 38 26 48 16"/>`,
  stem: `<path d="M32 58V14"/><path d="M32 30c-10-2-14-10-12-14M32 40c10-2 14-8 10-14"/>`,
  kennel: `<path d="M8 30 32 14l24 16"/><path d="M14 30v22h36V30"/><path d="M24 52V38c0-6 16-6 16 0v14"/>`,
  hand: `<path d="M22 36V16M30 34V12M38 34V16M46 36v12c0 10-8 16-18 16h-4c-8 0-12-6-12-12v-8l6-2v8"/>`,
  foot: `<path d="M16 28c2-8 10-12 16-8 6 2 8 8 6 14l8 4c6 4 4 14-4 16H22C10 54 8 42 12 36z"/>`,
  bowl: `<path d="M12 26h40"/><path d="M16 26c2 16 30 16 32 0"/><path d="M20 26c0 8 24 8 24 0"/>`,
  fin: `<path d="M14 44c8-20 28-24 40-16-10 4-16 14-16 26-8-2-16-4-24-10z"/>`,
  fox: `<path d="M10 28 24 18l8 10 8-10 14 10-6 20c-2 8-28 10-36 2z"/><path d="M24 18 28 8l6 12M40 18l-4-10-6 12"/><circle cx="26" cy="32" r="1.4" fill="currentColor" stroke="none"/><circle cx="38" cy="32" r="1.4" fill="currentColor" stroke="none"/><path d="M32 34v4M28 40h8"/>`,
  heart: `<path d="M32 52C14 40 8 28 14 20c4-6 12-6 18 2 6-8 14-8 18-2 6 8 0 20-18 32z"/>`,
  child: `<circle cx="32" cy="16" r="8"/><path d="M32 24v16M32 28 20 38M32 28l12 10M32 40 22 56M32 40l10 16"/>`,
  pencil: `<path d="M14 50 10 58l8-2 32-36-6-6z"/><path d="M40 16l8 8"/>`,
  book: `<path d="M10 14h20c4 4 4 28 0 36H10zM54 14H34c-4 4-4 28 0 36h20z"/><path d="M32 18v32"/>`,
};

export function icon(name, { size = 64 } = {}) {
  const body = PATHS[name] || PATHS.star;
  return svg(body, size);
}

export function hasIcon(name) {
  return Boolean(PATHS[name]);
}

export const PATTERN_COLORS = [
  { id: "ink", hex: "#1a1714" },
  { id: "red", hex: "#c44536" },
  { id: "blue", hex: "#2f6fad" },
  { id: "green", hex: "#2f7d4a" },
  { id: "gold", hex: "#c49214" },
];

export function shapeSvg(kind, { size = 72, color = "#1a1714", fill = "none", rotation = 0 } = {}) {
  const ink = color;
  const rot = rotation ? ` transform="rotate(${rotation} 32 32)"` : "";
  let body = "";
  if (kind === "circle" || kind === "ring") {
    body = `<circle cx="32" cy="32" r="18" fill="${fill}" stroke="${ink}"/>`;
  } else if (kind === "triangle") {
    body = `<path d="M32 12 54 50H10z"${rot} fill="${fill}" stroke="${ink}"/>`;
  } else if (kind === "square" || kind === "quad") {
    body = `<rect x="14" y="14" width="36" height="36"${rot} fill="${fill}" stroke="${ink}"/>`;
  } else if (kind === "rectangle") {
    body = `<rect x="8" y="18" width="48" height="28" fill="${fill}" stroke="${ink}"/>`;
  } else if (kind === "sphere") {
    body = `<circle cx="32" cy="32" r="18" fill="${fill}" stroke="${ink}"/><path d="M16 28c8 6 24 6 32 0" stroke="${ink}" fill="none"/><path d="M22 18c4 2 8 2 12 0" stroke="${ink}" fill="none"/>`;
  } else if (kind === "cube") {
    body = `<path d="M32 10 54 20 54 44 32 54 10 44 10 20z" fill="${fill}" stroke="${ink}"/><path d="M32 10v44M10 20l22 10 22-10" stroke="${ink}" fill="none"/>`;
  } else {
    body = `<circle cx="32" cy="32" r="16" fill="${fill}" stroke="${ink}"/>`;
  }
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="draw shape" aria-hidden="true" fill="none" stroke-width="2.4" stroke-linejoin="round">${body}</svg>`;
}

/** A small coloured pencil dot used in patterns. */
export function swatch(color, size = 56) {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><circle cx="32" cy="32" r="16" fill="${color}" stroke="#1a1714" stroke-width="2.4"/></svg>`;
}

export function coinSvg(coin, size = 74) {
  const euro = coin.kind === "euro";
  const r = euro ? 26 : 22;
  const tone = euro ? "#b8860b" : "#a15c3a";
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="draw coin" aria-hidden="true">
    <circle cx="32" cy="32" r="${r}" fill="#fbf6ea" stroke="${tone}" stroke-width="3"/>
    <circle cx="32" cy="32" r="${r - 5}" fill="none" stroke="${tone}" stroke-width="1.4"/>
    <text x="32" y="37" text-anchor="middle" font-family="Georgia, serif" font-size="${euro ? 16 : 13}" fill="#1a1714" stroke="none">${coin.label}</text>
  </svg>`;
}

export function clockSvg(h, m, size = 150) {
  const hourAngle = ((h % 12) + m / 60) * 30 - 90;
  const minAngle = m * 6 - 90;
  const hx = 50 + Math.cos((hourAngle * Math.PI) / 180) * 18;
  const hy = 50 + Math.sin((hourAngle * Math.PI) / 180) * 18;
  const mx = 50 + Math.cos((minAngle * Math.PI) / 180) * 28;
  const my = 50 + Math.sin((minAngle * Math.PI) / 180) * 28;
  const nums = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const a = (n * 30 - 90) * (Math.PI / 180);
    const x = 50 + Math.cos(a) * 38;
    const y = 50 + Math.sin(a) * 38 + 3;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#1a1714">${n}</text>`;
  }).join("");
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="draw clock" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#fbf6ea" stroke="#1a1714" stroke-width="2.2"/>
    ${nums}
    <line x1="50" y1="50" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#1a1714" stroke-width="3.2" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="#1a1714" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="2.2" fill="#1a1714"/>
  </svg>`;
}

export function childSvg({ hat = null, size = 92 } = {}) {
  const hatPath = hat
    ? `<path d="M18 20h28l-2 8H20z" fill="${hat}" stroke="#1a1714" stroke-width="2"/><path d="M16 28h32" stroke="#1a1714" stroke-width="2"/>`
    : "";
  return `<svg viewBox="0 0 64 80" width="${size}" height="${(size * 80) / 64}" class="draw" fill="none" stroke="#1a1714" stroke-width="2.3" stroke-linecap="round" aria-hidden="true">
    ${hatPath}
    <circle cx="32" cy="24" r="8" fill="#fbf6ea"/>
    <path d="M32 32v16M32 38 22 48M32 38l10 10M32 48 24 66M32 48l8 18"/>
  </svg>`;
}

export function stickSvg(height, size = 28) {
  const h = 16 + height * 10;
  return `<svg viewBox="0 0 40 80" width="${size}" height="${size * 2}" class="draw" aria-hidden="true">
    <rect x="16" y="${80 - h}" width="8" height="${h}" fill="none" stroke="#1a1714" stroke-width="2.2"/>
  </svg>`;
}

export function foxBadge(size = 42) {
  return icon("fox", { size });
}
