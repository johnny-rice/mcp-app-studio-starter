import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "lib/workbench/persistence/use-workbench-persistence.ts",
);

describe("workbench persistence default-props regression", () => {
  it("seeds tool input using URL-selected component during first-load initialization", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /const initialComponentId = urlState\.component \?\? store\.selectedComponent;/,
    );
    assert.match(
      source,
      /const component = getComponent\(initialComponentId\);/,
    );
  });

  it("applies URL theme to both global and preview theme state", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /if \(urlState\.theme\) store\.setTheme\(urlState\.theme\);/,
    );
    assert.match(
      source,
      /if \(urlState\.theme\) store\.setPreviewTheme\(urlState\.theme\);/,
    );
  });
});
