import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/preview-views.tsx",
);

describe("Preview views desktop layout regression", () => {
  it("renders desktop preview full bleed without padded rounded frame", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const desktopBlock = source.match(
      /function DesktopPreview\(\) \{[\s\S]*?\n\}/,
    )?.[0];

    assert.ok(desktopBlock);
    assert.match(desktopBlock, /<ChatWithComposer \/>/);
    assert.doesNotMatch(desktopBlock, /rounded-xl border/);
    assert.doesNotMatch(desktopBlock, /p-4/);
  });
});
