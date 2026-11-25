import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULES, generate, grade, invariants } from "../js/puzzles/index.js";
import { planSession } from "../js/session.js";
import { freshProgress, recordResult, levelTrack } from "../js/progress.js";
import { feelKey, generateRun } from "../js/puzzles/variety.js";
import { etClock, enClock } from "../js/content.js";

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

for (const mod of MODULES) {
  test(`generator: ${mod.meta.id}`, () => {
    assert.equal(mod.meta.name.et.length > 0, true);
    assert.equal(mod.meta.name.en.length > 0, true);
    for (let level = 1; level <= 5; level++) {
      for (const seed of SEEDS) {
        const puzzle = mod.generate(level, seed * 100 + level);
        assert.equal(puzzle.type, mod.meta.id);
        assert.equal(puzzle.level, level);
        assert.ok(puzzle.prompt.et && puzzle.prompt.en, "prompts");
        assert.ok(puzzle.hint.et && puzzle.hint.en, "hints");
        assert.ok(puzzle.explain.et && puzzle.explain.en, "explain");
        const again = mod.generate(level, seed * 100 + level);
        assert.deepEqual(again.solution, puzzle.solution);
        assert.equal(grade(puzzle, puzzle.solution), true, `solution grade ${mod.meta.id} L${level}`);
        assert.equal(grade(puzzle, puzzle.alt), false, `alt must fail ${mod.meta.id} L${level} seed ${seed}`);
        const problems = invariants(puzzle);
        assert.deepEqual(problems, [], `${mod.meta.id} L${level} seed ${seed}: ${problems.join("; ")}`);
      }
    }
  });
}

test("clock language", () => {
  assert.equal(etClock(3, 0), "kell on kolm");
  assert.equal(etClock(1, 30), "pool kaks");
  assert.equal(etClock(12, 30), "pool üks");
  assert.equal(etClock(12, 0), "kell on kaksteist");
  assert.equal(etClock(11, 30), "pool kaksteist");
  assert.equal(enClock(3, 0), "three o'clock");
  assert.equal(enClock(1, 30), "half past one");
  assert.equal(enClock(12, 30), "half past twelve");
});

test("session shape", () => {
  const first = planSession(freshProgress(), 42, "2026-11-23");
  assert.equal(first.newType, "missing");
  assert.ok(first.items.every((it) => it.type === "missing"));
  assert.equal(first.items.filter((it) => it.mode === "example").length, 1);
  assert.equal(first.items.filter((it) => it.mode === "guided").length, 1);
  const progress = freshProgress();
  recordResult(progress, "missing", 1, true, "2026-11-20");
  const second = planSession(progress, 7, "2026-11-23");
  const newcomers = [...new Set(second.items.filter((it) => it.mode !== "solo").map((it) => it.type))];
  assert.equal(newcomers.length, 1);
  assert.equal(second.items.filter((it) => it.mode === "example").length, 1);
  assert.ok(second.items.some((it) => it.type === "missing" && it.mode === "solo"));
});

test("mastery moves one level at a time", () => {
  const progress = freshProgress();
  let up = false;
  for (let i = 0; i < 4; i++) up = recordResult(progress, "sudoku", 1, true, "2026-11-23").leveledUp || up;
  assert.equal(progress.levels.sudoku, 2);
  assert.equal(up, true);
  recordResult(progress, "sudoku", 2, false, "2026-11-23");
  recordResult(progress, "sudoku", 2, false, "2026-11-23");
  recordResult(progress, "sudoku", 2, false, "2026-11-23");
  assert.equal(progress.levels.sudoku, 1);
});

function answerAsTheBoardReads(puzzle) {
  if (puzzle.view === "pattern" && puzzle.mode === "build") {
    return puzzle.tiles.flatMap((tile, i) => (tile ? [] : [puzzle.motif[i % puzzle.motif.length]]));
  }
  return puzzle.solution;
}

test("ui grade accepts the real answer for every type and level", () => {
  for (const mod of MODULES) {
    for (let level = 1; level <= 5; level++) {
      for (let seed = 1; seed <= 40; seed++) {
        const puzzle = generate(mod.meta.id, level, seed * 1000 + level);
        const answer = answerAsTheBoardReads(puzzle);
        assert.equal(
          grade(puzzle, answer),
          true,
          `${mod.meta.id} L${level} seed ${seed} rejected the board answer`
        );
        assert.equal(grade(puzzle, puzzle.solution), true);
      }
    }
  }
});

test("level-5 patterns grade the left-to-right continuation", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const puzzle = generate("patterns", 5, seed);
    const leftToRight = answerAsTheBoardReads(puzzle);
    assert.equal(grade(puzzle, leftToRight), true, `seed ${seed}`);
    if (puzzle.mode === "build") assert.deepEqual(puzzle.solution, leftToRight);
  }
  const sample = generate("patterns", 5, 1);
  assert.equal(grade(sample, answerAsTheBoardReads(sample)), true);
});

test("early levels promote after three clean solves in a row", () => {
  const progress = freshProgress();
  recordResult(progress, "missing", 1, true, "2026-11-23");
  assert.deepEqual(levelTrack(progress, "missing"), { level: 1, goal: 3, have: 1 });
  recordResult(progress, "missing", 1, false, "2026-11-23");
  assert.equal(levelTrack(progress, "missing").have, 0);
  recordResult(progress, "missing", 1, true, "2026-11-23");
  recordResult(progress, "missing", 1, true, "2026-11-23");
  assert.equal(levelTrack(progress, "missing").have, 2);
  const up = recordResult(progress, "missing", 1, true, "2026-11-23");
  assert.equal(up.leveledUp, true);
  assert.equal(progress.levels.missing, 2);
  assert.equal(levelTrack(progress, "missing").have, 0);
  assert.equal(levelTrack(progress, "missing").goal, 3);

  const later = freshProgress();
  later.levels.clock = 3;
  for (let i = 0; i < 3; i++) recordResult(later, "clock", 3, true, "2026-11-23");
  assert.equal(later.levels.clock, 3);
  assert.equal(levelTrack(later, "clock").have, 3);
  assert.equal(levelTrack(later, "clock").goal, 4);
  assert.equal(recordResult(later, "clock", 3, true, "2026-11-23").leveledUp, true);
  assert.equal(later.levels.clock, 4);
});

test("early levels do not repeat the same puzzle back to back", () => {
  const count = 6;
  for (const mod of MODULES) {
    for (const level of [1, 2]) {
      const items = generateRun(mod.meta.id, level, count, 20261125 + level * 17);
      const keys = items.map(feelKey);
      assert.equal(keys.length, count, mod.meta.id);
      for (let i = 1; i < keys.length; i++) {
        assert.notEqual(keys[i], keys[i - 1], `${mod.meta.id} L${level} repeated at ${i}`);
      }
      const distinct = new Set(keys).size;
      assert.ok(distinct >= 4, `${mod.meta.id} L${level} only ${distinct} distinct feels`);
    }
  }
});

test("a first session does not repeat the opening puzzle", () => {
  const plan = planSession(freshProgress(), 42, "2026-11-23");
  const keys = plan.items.map((item) => feelKey(item.puzzle));
  for (let i = 1; i < keys.length; i++) assert.notEqual(keys[i], keys[i - 1]);
  assert.ok(new Set(keys).size >= 4);
});

test("smoke: every type can be planned and graded", () => {
  const progress = freshProgress();
  for (const mod of MODULES) progress.solved[mod.meta.id] = 2;
  const plan = planSession(progress, 99, "2026-11-23");
  assert.equal(plan.items.length, 6);
  assert.equal(plan.newType, null);
  for (const item of plan.items) {
    assert.equal(generate(item.type, item.level, 5).type, item.type);
    assert.equal(grade(item.puzzle, item.puzzle.solution), true);
  }
});
