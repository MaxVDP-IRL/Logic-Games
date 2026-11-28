import * as missing from "./missing.js";
import * as arithmetic from "./arithmetic.js";
import * as compare from "./compare.js";
import * as bonds from "./bonds.js";
import * as patterns from "./patterns.js";
import * as oddone from "./oddone.js";
import * as position from "./position.js";
import * as shapes from "./shapes.js";
import * as matching from "./matching.js";
import * as stories from "./stories.js";
import * as memory from "./memory.js";
import * as listen from "./listen.js";
import * as pyramid from "./pyramid.js";
import * as sudoku from "./sudoku.js";
import * as wordlogic from "./wordlogic.js";
import * as maze from "./maze.js";
import * as mirror from "./mirror.js";
import * as order from "./order.js";
import * as analogy from "./analogy.js";
import * as matrix from "./matrix.js";
import * as clock from "./clock.js";
import * as money from "./money.js";
import * as signs from "./signs.js";

export const MODULES = [
  missing, arithmetic, compare, bonds, patterns, oddone, position, shapes,
  matching, stories, memory, listen, pyramid, sudoku, wordlogic, maze, mirror,
  order, analogy, matrix, clock, money, signs,
];

export const TYPE_ORDER = MODULES.map((m) => m.meta.id);

export function getModule(id) {
  const mod = MODULES.find((m) => m.meta.id === id);
  if (!mod) throw new Error(`Unknown puzzle type: ${id}`);
  return mod;
}

export function generate(type, level, seed) {
  return getModule(type).generate(level, seed);
}

export function grade(puzzle, answer) {
  return getModule(puzzle.type).grade(puzzle, answer);
}

export function invariants(puzzle) {
  const mod = getModule(puzzle.type);
  return mod.invariants ? mod.invariants(puzzle) : [];
}

export function metaOf(type) {
  return getModule(type).meta;
}
