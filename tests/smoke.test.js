import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { STICKERS } from "../js/stickers.js";

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return files(path);
    return [path];
  });
}

test("static shell and versioned cache list the app", () => {
  const html = fs.readFileSync("index.html", "utf8");
  assert.match(html, /js\/app\.js/);
  assert.match(html, /manifest\.webmanifest/);
  const sw = fs.readFileSync("sw.js", "utf8");
  assert.match(sw, /nuputaja-v1/);
  for (const path of files("js").concat(["css/app.css", "index.html"])) {
    assert.match(sw, new RegExp(path.replaceAll(".", "\\.")), path);
  }
});

test("sticker ids are unique", () => {
  const ids = STICKERS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 24);
});
