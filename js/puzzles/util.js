export function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function permutations(arr) {
  if (arr.length <= 1) return [arr.map((x) => x)];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

export function basePuzzle(meta, level, seed, fields) {
  return {
    type: meta.id,
    level,
    seed,
    ...fields,
  };
}

export function pairKey(a, b) {
  return `${a}>${b}`;
}

export function sortedKeys(pairs) {
  return pairs.map((p) => (Array.isArray(p) ? pairKey(p[0], p[1]) : p)).sort();
}
