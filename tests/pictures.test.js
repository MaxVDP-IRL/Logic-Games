import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { generate, grade, invariants } from "../js/puzzles/index.js";

const SEEDS = 500;

function fairOutsiders(items) {
  const found = new Set();
  const tags = new Set(items.flatMap((item) => item.tags));
  for (const tag of tags) {
    const holders = items.filter((item) => item.tags.includes(tag));
    if (holders.length === 1) found.add(holders[0].id);
    if (holders.length === items.length - 1) {
      found.add(items.find((item) => !item.tags.includes(tag)).id);
    }
  }
  return [...found];
}

function oddId(puzzle) {
  return puzzle.needReason ? puzzle.solution.id : puzzle.solution;
}

test("odd one out has one fair outsider on every level", () => {
  for (let level = 1; level <= 5; level++) {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const puzzle = generate("oddone", level, seed);
      assert.deepEqual(invariants(puzzle), [], `L${level} seed ${seed}`);
      assert.equal(grade(puzzle, puzzle.solution), true);
      assert.equal(grade(puzzle, puzzle.alt), false);
      if (puzzle.view === "sort") {
        assert.equal(level, 4);
        assert.equal(fairOutsiders(puzzle.items).length, 0, `sort seed ${seed} has a competing outsider`);
        const families = new Set(puzzle.items.map((item) => item.family));
        assert.equal(families.size, 2);
        continue;
      }
      const outsiders = fairOutsiders(puzzle.items);
      assert.deepEqual(outsiders, [oddId(puzzle)], `L${level} seed ${seed} outsiders ${outsiders.join(",")}`);
      const odd = puzzle.items.find((item) => item.id === oddId(puzzle));
      const others = puzzle.items.filter((item) => item !== odd);
      if (level <= 2) {
        assert.ok(others.every((item) => item.family === others[0].family));
        assert.notEqual(odd.family, others[0].family);
      }
      if (level === 3) {
        assert.ok(puzzle.items.every((item) => item.family === odd.family));
        assert.ok(others.every((item) => item.pool === others[0].pool));
        assert.notEqual(odd.pool, others[0].pool);
      }
      for (const item of puzzle.items) {
        assert.equal(fs.existsSync(`assets/art/odd-one-out/${item.art}.svg`), true, item.art);
      }
      if (!puzzle.needReason) continue;
      assert.equal(puzzle.reasons.length, 3);
      const blob = puzzle.reasons.map((reason) => `${reason.et} ${reason.en}`).join(" ");
      assert.equal(/sinine|väike|\bblue\b|\bsmall\b/i.test(blob), false, blob);
      for (const reason of puzzle.reasons) {
        const [kind, tag] = reason.id.split(":");
        assert.equal(puzzle.items.some((item) => item.tags.includes(tag)), true, reason.id);
        const has = odd.tags.includes(tag);
        if (reason.id === puzzle.reason) {
          const holders = puzzle.items.filter((item) => item.tags.includes(tag)).length;
          if (kind === "is") assert.equal(holders, 1);
          if (kind === "isNot") assert.equal(puzzle.items.filter((item) => !item.tags.includes(tag)).length, 1);
        } else if (kind === "is") assert.equal(has, false, reason.en);
        else assert.equal(has, true, reason.en);
      }
    }
  }
});

test("level 1 odd one out says the idea out loud", () => {
  const puzzle = generate("oddone", 1, 3);
  assert.equal(puzzle.prompt.en, "Three are the same kind of thing. Which one is different?");
  assert.match(puzzle.prompt.et, /ühte liiki/);
  assert.equal(puzzle.say, undefined);
});

function pieceName(file) {
  return file.replace(/-(left|right)-half$/, "");
}

test("mirror answers are the true right half and distractors differ", () => {
  const names = ["heart", "house", "butterfly", "tree", "rocket", "cat-face"];
  for (let level = 1; level <= 5; level++) {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const puzzle = generate("mirror", level, seed);
      assert.deepEqual(invariants(puzzle), [], `L${level} seed ${seed}: ${invariants(puzzle).join(",")}`);
      const correct = puzzle.options[puzzle.solution];
      assert.equal(correct.rightFile, `${puzzle.picture}-right-half`);
      assert.equal(correct.rightAlign, "right");
      const keys = puzzle.options.map((opt) => opt.key);
      assert.equal(new Set(keys).size, keys.length, `L${level} seed ${seed} duplicate option`);
      for (const opt of puzzle.options) {
        if (opt === correct) continue;
        assert.notEqual(opt.key, correct.key);
        assert.notEqual(`${opt.rightFile}:${opt.rightAlign}`, `${correct.rightFile}:${correct.rightAlign}`);
        for (const piece of opt.pieces) {
          assert.equal(fs.existsSync(`assets/art/mirror/${piece.file}.svg`), true, piece.file);
        }
      }
      for (const piece of correct.pieces) {
        assert.equal(fs.existsSync(`assets/art/mirror/${piece.file}.svg`), true);
      }
      if (level === 4) {
        const trueMirrors = puzzle.options.filter((opt) => names.some((name) => opt.key === `${name}-left-half:left|${name}-right-half:right`));
        assert.equal(trueMirrors.length, 1);
      }
      if (level !== 4) {
        assert.equal(puzzle.stem.file, `${puzzle.picture}-left-half`);
        assert.equal(puzzle.stem.align, "left");
      }
      if (level <= 2) {
        const unflipped = puzzle.options.find((opt) => opt.rightFile === `${puzzle.picture}-left-half`);
        if (level === 1) {
          assert.ok(unflipped);
          assert.equal(unflipped.rightAlign, "left");
        }
        for (const opt of puzzle.options) {
          if (opt === correct || !opt.rightFile.endsWith("-right-half")) continue;
          assert.notEqual(pieceName(opt.rightFile), puzzle.picture);
        }
      }
    }
  }
});
