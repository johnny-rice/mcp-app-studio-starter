import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/preview-toolbar.tsx",
);

describe("Preview toolbar hydration regression", () => {
  it("keeps workbench theme toggle isolated from app/global theme state", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /useWorkbenchTheme/);
    assert.match(source, /const theme = useWorkbenchTheme\(\);/);
    assert.match(source, /const \[mounted, setMounted\] = useState\(false\);/);
    assert.match(
      source,
      /useEffect\(\(\) => \{\s*setMounted\(true\);\s*\}, \[\]\);/,
    );
    assert.match(source, /const isDark = mounted && theme === "dark";/);
    assert.match(source, /const nextTheme = isDark \? "light" : "dark";/);
    assert.match(source, /setWorkbenchTheme\(nextTheme\)/);
    assert.doesNotMatch(source, /setAppTheme\(nextTheme\)/);
    assert.doesNotMatch(source, /useTheme/);
  });
});
