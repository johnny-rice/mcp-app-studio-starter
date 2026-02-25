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

  it("shows HMR health warnings instead of an HMR toggle", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.doesNotMatch(source, /useHmrPreview/);
    assert.doesNotMatch(source, /setUseHmrPreview/);
    assert.doesNotMatch(source, /lucide-zap/i);
    assert.match(source, /hmrRuntimeStatus === "error"/);
    assert.match(source, /HMR runtime unavailable/);
    assert.match(source, /Using bundle fallback/);
  });

  it("labels the preview theme control explicitly", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /aria-label="Toggle preview theme"/);
    assert.match(source, /<TooltipContent side="top">Toggle preview theme/);
  });
});
