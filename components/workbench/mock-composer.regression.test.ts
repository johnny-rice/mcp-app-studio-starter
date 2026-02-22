import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/mock-composer.tsx",
);

describe("Mock composer hydration regression", () => {
  it("uses mounted workbench-theme gating before applying dark-mode classes", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /useWorkbenchStore/);
    assert.match(
      source,
      /const theme = useWorkbenchStore\(\(s\) => s\.theme\);/,
    );
    assert.match(source, /const \[mounted, setMounted\] = useState\(false\);/);
    assert.match(
      source,
      /useEffect\(\(\) => \{\s*setMounted\(true\);\s*\}, \[\]\);/,
    );
    assert.match(source, /const isDark = mounted && theme === "dark";/);
    assert.match(source, /border-neutral-800 bg-neutral-900/);
    assert.match(source, /text-neutral-100 placeholder:text-neutral-500/);
    assert.match(source, /isDark \? "bg-white" : "bg-neutral-950"/);
    assert.doesNotMatch(source, /useTheme/);
  });
});
