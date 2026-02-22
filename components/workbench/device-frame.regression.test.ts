import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/device-frame.tsx",
);

describe("Device frame theme fallback regression", () => {
  it("uses workbench theme state for frame chroming", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /useWorkbenchTheme/);
    assert.match(source, /const theme = useWorkbenchTheme\(\);/);
    assert.match(source, /effectiveIsDark/);
    assert.match(source, /const effectiveIsDark = theme === "dark";/);
    assert.doesNotMatch(source, /useTheme/);
    assert.doesNotMatch(source, /resolvedTheme/);
  });
});
