import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const SHELL_FILE = path.resolve(
  process.cwd(),
  "components/workbench/workbench-shell.tsx",
);
const ACTIVITY_PANEL_FILE = path.resolve(
  process.cwd(),
  "components/workbench/activity-panel.tsx",
);

describe("export panel navigation regression", () => {
  it("routes header export action through right panel tab state instead of an overlay popover", () => {
    const source = fs.readFileSync(SHELL_FILE, "utf8");

    assert.doesNotMatch(source, /ExportPopover/);
    assert.match(source, /setRightPanelTab/);
    assert.match(source, /setRightPanelOpen\(true\);/);
    assert.match(source, /setRightPanelTab\("export"\);/);
  });

  it("exposes export as a right-sidebar tab so Activity/Tools remain navigable", () => {
    const source = fs.readFileSync(ACTIVITY_PANEL_FILE, "utf8");

    assert.match(
      source,
      /type ActivityTab = "activity" \| "simulation" \| "export";/,
    );
    assert.match(source, /onClick=\{\(\) => setActiveTab\("export"\)\}/);
    assert.match(source, /<ExportPanel \/>/);
  });
});
