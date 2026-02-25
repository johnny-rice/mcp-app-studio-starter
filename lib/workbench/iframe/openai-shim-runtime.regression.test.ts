import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const SHIM_FILE = path.resolve(
  process.cwd(),
  "lib/workbench/iframe/openai-shim-runtime.ts",
);

describe("openai shim theme propagation regression", () => {
  it("derives iframe theme from next globals, not only changed keys", () => {
    const source = fs.readFileSync(SHIM_FILE, "utf8");

    assert.match(
      source,
      /updateThemeClass\(nextGlobals\.previewTheme \|\| nextGlobals\.theme\);/,
    );
    assert.doesNotMatch(
      source,
      /updateThemeClass\(changed\.previewTheme \|\| changed\.theme\);/,
    );
  });
});
