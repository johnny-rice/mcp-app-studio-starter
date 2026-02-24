import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/mock-composer.tsx",
);

describe("Mock composer hydration regression", () => {
  it("uses preview theme with hydration-safe fallback styles", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /useWorkbenchStore/);
    assert.match(source, /useHydratedOnce/);
    assert.match(
      source,
      /const theme = useWorkbenchStore\(\(s\) => s\.previewTheme\);/,
    );
    assert.match(source, /const hydrated = useHydratedOnce\(\);/);
    assert.match(source, /const isDark = hydrated && theme === "dark";/);
    assert.match(source, /data-theme=\{theme\}/);
    assert.match(source, /!hydrated\s*\?\s*"border-border bg-background"/);
    assert.match(source, /border-neutral-800 bg-neutral-900/);
    assert.match(source, /text-neutral-100 placeholder:text-neutral-500/);
    assert.match(source, /!hydrated \? "bg-foreground"/);
    assert.match(source, /isDark \? "bg-white" : "bg-neutral-950"/);
    assert.doesNotMatch(source, /useTheme/);
  });
});
