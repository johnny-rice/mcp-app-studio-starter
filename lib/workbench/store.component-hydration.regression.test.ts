import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(process.cwd(), "lib/workbench/store.ts");

describe("Workbench component hydration regression", () => {
  it("does not derive initial component from window during store creation", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /const DEFAULT_COMPONENT =/);
    assert.match(source, /selectedComponent:\s*DEFAULT_COMPONENT/);
    assert.doesNotMatch(source, /window\.location\.search/);
    assert.doesNotMatch(
      source,
      /new URLSearchParams\(window\.location\.search\)/,
    );
  });
});
