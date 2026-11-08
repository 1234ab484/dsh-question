// Static contract tests for the shipped bundle. No browser needed.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const bundle = fs.readFileSync(path.join(root, "lib/client.js"), "utf8");
const css = fs.readFileSync(path.join(root, "lib/dsh-question.css"), "utf8");
const patch = fs.readFileSync(path.join(root, "cordis.patch.yml"), "utf8");

test("package declares a web client half and a bundle patch", () => {
  assert.equal(pkg.type, "module");
  assert.equal(pkg.dsh.client.platform, "web");
  assert.equal(pkg.dsh.bundle.patch, "./cordis.patch.yml");
  assert.equal(pkg.exports["./client"], "./lib/client.js");
});

test("bundle registers the CJS factory under the package name", () => {
  assert.match(bundle, /window\.__ModuleLoader__\.load\(/);
  assert.ok(bundle.includes('id: "' + pkg.name + '"'), "module id must equal the package name");
  assert.match(bundle, /module\.exports = \{ name: "[^"]+", inject: \[[^\]]*\], apply: apply \};/);
});

test("styles keep the question-card scope and the hover tooltip", () => {
  assert.ok(css.includes("[data-question-key]"), "selectors must stay scoped to the question card");
  assert.ok(css.includes("border-radius: 50%"), "single-select control must stay circular");
  assert.ok(css.includes("-webkit-line-clamp: 2"), "option labels clamp to two lines");
  assert.ok(css.includes(".dsh-tq-tip"), "tooltip styles are part of the bundle");
  assert.ok(css.includes("\u5176\u4ed6") || css.includes("其他"), "custom row renders the 其他 prefix");
});

test("client half keeps the documented keyboard shortcuts", () => {
  assert.ok(bundle.includes('"keydown"'), "keyboard listener present");
  assert.ok(bundle.includes("clickOption"), "digit shortcuts click options");
  assert.ok(bundle.includes("primaryActionOf"), "Enter triggers the primary footer action");
  assert.ok(bundle.includes("collapseControlOf"), "Escape collapses the card");
});

test("bundle patch inserts the loader entry", () => {
  assert.match(patch, /- insert:/);
  assert.ok(patch.includes("name: " + pkg.name));
});
