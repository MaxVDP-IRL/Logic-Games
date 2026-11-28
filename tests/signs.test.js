import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { generate, grade, invariants } from "../js/puzzles/index.js";
import { feelKey, generateRun } from "../js/puzzles/variety.js";
import {
  PICTURES,
  comparisonSentence,
  enNumber,
  etComitative,
  etNumber,
  judgeSentence,
  relation,
} from "../js/puzzles/signs.js";

const NOM = {
  1: "üks",
  3: "kolm",
  4: "neli",
  5: "viis",
  7: "seitse",
  8: "kaheksa",
  10: "kümme",
  11: "üksteist",
  12: "kaksteist",
  14: "neliteist",
  15: "viisteist",
  16: "kuusteist",
  19: "üheksateist",
  20: "kakskümmend",
  21: "kakskümmend üks",
  22: "kakskümmend kaks",
  30: "kolmkümmend",
  35: "kolmkümmend viis",
  40: "nelikümmend",
  50: "viiskümmend",
};

const COM = {
  1: "ühega",
  4: "neljaga",
  5: "viiega",
  7: "seitsmega",
  8: "kaheksaga",
  10: "kümnega",
  11: "üheteistkümnega",
  12: "kaheteistkümnega",
  14: "neljateistkümnega",
  20: "kahekümnega",
  21: "kahekümne ühega",
  22: "kahekümne kahega",
  35: "kolmekümne viiega",
  40: "neljakümnega",
  50: "viiekümnega",
};

test("number words for the comparison sentence", () => {
  for (const [n, word] of Object.entries(NOM)) assert.equal(etNumber(Number(n)), word);
  for (const [n, word] of Object.entries(COM)) assert.equal(etComitative(Number(n)), word);
  assert.equal(enNumber(7), "seven");
  assert.equal(enNumber(21), "twenty-one");
  assert.equal(enNumber(50), "fifty");
  assert.deepEqual(comparisonSentence(7, 3, ">"), {
    et: "Seitse on suurem kui kolm.",
    en: "Seven is greater than three.",
  });
  assert.deepEqual(comparisonSentence(3, 7, "<"), {
    et: "Kolm on väiksem kui seitse.",
    en: "Three is less than seven.",
  });
  assert.deepEqual(comparisonSentence(4, 4, "="), {
    et: "Neli on võrdne neljaga.",
    en: "Four is equal to four.",
  });
  assert.deepEqual(comparisonSentence(5, 4, ">", [3, 2]), {
    et: "Kolm pluss kaks on suurem kui neli.",
    en: "Three plus two is greater than four.",
  });
  assert.deepEqual(comparisonSentence(5, 5, "=", [3, 2]), {
    et: "Kolm pluss kaks on võrdne viiega.",
    en: "Three plus two is equal to five.",
  });
  assert.deepEqual(judgeSentence(7, 3, ">"), {
    et: "Jah. Seitse on suurem kui kolm.",
    en: "Yes. Seven is greater than three.",
  });
  assert.deepEqual(judgeSentence(7, 3, "<"), {
    et: "Ei. Seitse on suurem kui kolm.",
    en: "No. Seven is greater than three.",
  });
});

test("signs puzzles teach < > = and speak the true sentence", () => {
  const seen = { 2: 0, 3: 0, 4: 0, 5: 0 };
  const equal = { 2: 0, 3: 0, 4: 0, 5: 0 };
  const modes = { 4: new Set(), 5: new Set() };
  for (let level = 1; level <= 5; level++) {
    for (let seed = 1; seed <= 200; seed++) {
      const puzzle = generate("signs", level, seed);
      assert.deepEqual(invariants(puzzle), [], `L${level} seed ${seed}`);
      assert.equal(grade(puzzle, puzzle.solution), true);
      assert.equal(grade(puzzle, puzzle.alt), false);
      assert.equal(puzzle.spoken.et, puzzle.explain.et);
      if (level === 1) {
        assert.equal(puzzle.mode, "groups");
        assert.ok(puzzle.ask === "more" || puzzle.ask === "fewer");
      } else {
        seen[level] += 1;
        const valuesEqual = puzzle.mode === "fill"
          ? false
          : puzzle.mode === "judge"
            ? puzzle.left === puzzle.right
            : puzzle.mode === "sum"
              ? puzzle.left === puzzle.right
              : puzzle.left === puzzle.right;
        if (puzzle.mode === "fill" && puzzle.rel === "=") equal[level] += 1;
        else if (puzzle.mode !== "fill" && valuesEqual) equal[level] += 1;
        if (level === 4 || level === 5) modes[level].add(puzzle.mode);
      }
      if (puzzle.mode !== "judge" && puzzle.mode !== "fill") {
        const rel = puzzle.mode === "groups" ? relation(puzzle.left, puzzle.right) : puzzle.solution;
        if (rel === ">") assert.match(puzzle.spoken.et, /on suurem kui/);
        if (rel === "<") assert.match(puzzle.spoken.et, /on väiksem kui/);
        if (rel === "=") assert.match(puzzle.spoken.et, /on võrdne/);
      }
    }
  }
  for (const level of [2, 3, 4, 5]) {
    const rate = equal[level] / seen[level];
    assert.ok(rate > 0.12 && rate < 0.3, `L${level} equal rate ${rate}`);
  }
  assert.deepEqual([...modes[4]].sort(), ["fill", "judge"]);
  assert.deepEqual([...modes[5]].sort(), ["numerals", "sum"]);
});

test("sign pictures reuse the odd-one-out art", () => {
  for (const item of PICTURES) {
    assert.equal(fs.existsSync(`assets/art/odd-one-out/${item.art}.svg`), true, item.art);
  }
  const puzzle = generate("signs", 1, 3);
  for (const group of puzzle.groups) {
    assert.equal(fs.existsSync(`assets/art/odd-one-out/${group.art}.svg`), true);
  }
});

test("early sign puzzles do not feel the same back to back", () => {
  for (const level of [1, 2]) {
    const items = generateRun("signs", level, 6, 42);
    const keys = items.map(feelKey);
    for (let i = 1; i < keys.length; i++) assert.notEqual(keys[i], keys[i - 1], `L${level} at ${i}`);
    assert.ok(new Set(keys).size >= 4, `L${level} only ${new Set(keys).size} feels`);
  }
});
