import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/chat-thread.tsx",
);

describe("Chat thread theme fallback regression", () => {
  it("uses workbench theme state for dark/light wrappers", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /useWorkbenchTheme/);
    assert.match(source, /const theme = useWorkbenchTheme\(\);/);
    assert.match(source, /effectiveIsDark/);
    assert.match(source, /const effectiveIsDark = theme === "dark";/);
    assert.match(source, /bg-background/);
    assert.doesNotMatch(source, /useTheme/);
    assert.doesNotMatch(source, /resolvedTheme/);
    assert.doesNotMatch(source, /isDark \? "bg-neutral-900" : "bg-white"/);
  });

  it("uses full-bleed wrapper on desktop and framed wrapper on non-desktop devices", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /useDeviceType/);
    assert.match(source, /deviceType === "desktop"/);
    assert.match(
      source,
      /!isDesktopDevice && "items-center justify-center px-4"/,
    );
    assert.match(
      source,
      /isDesktopDevice[\s\S]*\? "h-full w-full border-none shadow-none"[\s\S]*:/,
    );
    assert.match(
      source,
      /style=\{[\s\S]*isDesktopDevice[\s\S]*\? undefined[\s\S]*\{ height: widgetHeight, maxHeight: widgetHeight \}[\s\S]*\}/,
    );
  });
});
