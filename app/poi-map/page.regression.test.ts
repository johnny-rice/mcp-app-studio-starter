import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(process.cwd(), "app/poi-map/page.tsx");

describe("Standalone POI map page regression", () => {
  it("renders POIMapDemo directly without iframe host wrappers", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /POIMapDemo/);
    assert.match(source, /h-screen w-screen overflow-hidden/);
    assert.doesNotMatch(source, /iframe/i);
    assert.doesNotMatch(source, /WorkbenchShell/);
    assert.doesNotMatch(source, /WidgetIframeHost/);
  });

  it("keeps the standalone root transparent so body background is visible around rounded app corners", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /bg-transparent/);
    assert.doesNotMatch(source, /bg-background/);
  });
});
