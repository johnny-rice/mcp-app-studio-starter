import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(process.cwd(), "lib/workbench/store.ts");

describe("Workbench theme initialization regression", () => {
  it("derives initial theme from the hydrated document to avoid light-first flashes", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /function getInitialTheme\(\): Theme/);
    assert.match(
      source,
      /document\.documentElement\.classList\.contains\("dark"\)/,
    );
    assert.match(source, /theme:\s*getInitialTheme\(\)/);
    assert.doesNotMatch(source, /localStorage\.getItem\("theme"\)/);
    assert.doesNotMatch(source, /theme:\s*"light"/);
  });
});
