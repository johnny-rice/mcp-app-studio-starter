import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/workbench-shell.tsx",
);

describe("Workbench shell regression coverage", () => {
  it("keeps shell theme control distinct from preview theme control", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /aria-label="Toggle workbench theme"/);
    assert.doesNotMatch(source, /aria-label="Toggle theme"/);
  });

  it("syncs resolved global theme into preview theme to avoid opposite-theme preview drift", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /const nextTheme = resolvedTheme as "light" \| "dark";/,
    );
    assert.match(source, /setWorkbenchTheme\(nextTheme\);/);
    assert.match(source, /setPreviewTheme\(nextTheme\);/);
  });
});
