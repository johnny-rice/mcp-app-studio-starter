import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/isolated-theme-wrapper.tsx",
);

describe("Isolated theme wrapper regression", () => {
  it("uses workbench theme state as the isolated source of truth", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /useWorkbenchStore/);
    assert.match(
      source,
      /const theme = useWorkbenchStore\(\(s\) => s\.theme\);/,
    );
    assert.match(source, /effectiveTheme/);
    assert.match(source, /const effectiveTheme: Theme = theme;/);
    assert.doesNotMatch(source, /useTheme/);
    assert.doesNotMatch(source, /resolvedTheme/);
    assert.doesNotMatch(
      source,
      /document\.documentElement\.classList\.contains\("dark"\)/,
    );
  });
});
