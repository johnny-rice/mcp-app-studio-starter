import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const PREVIEW_TOOLBAR_FILE = path.resolve(
  process.cwd(),
  "components/workbench/preview-toolbar.tsx",
);
const MAP_CONTROLS_FILE = path.resolve(
  process.cwd(),
  "components/examples/poi-map/poi-map-controls.tsx",
);
const POI_CARD_FILE = path.resolve(
  process.cwd(),
  "components/examples/poi-map/poi-card.tsx",
);

describe("accessibility control labels regression", () => {
  it("adds explicit aria labels to icon-only preview toolbar actions", () => {
    const source = fs.readFileSync(PREVIEW_TOOLBAR_FILE, "utf8");

    assert.match(source, /aria-label=\{label\}/);
    assert.match(source, /aria-label="Conversation Mode"/);
    assert.match(source, /aria-label="Theme diagnostics"/);
    assert.match(source, /aria-label="More options"/);
  });

  it("adds explicit labels to POI map icon controls", () => {
    const source = fs.readFileSync(MAP_CONTROLS_FILE, "utf8");

    assert.match(source, /aria-label="Refresh locations"/);
    assert.match(
      source,
      /aria-label=\{isFullscreen \? "Exit fullscreen" : "Enter fullscreen"\}/,
    );
  });

  it("adds explicit labels to POI favorite icon toggles", () => {
    const source = fs.readFileSync(POI_CARD_FILE, "utf8");

    assert.match(
      source,
      /aria-label=\{\s*isFavorite\s*\?\s*"Remove from favorites"\s*:\s*"Add to favorites"\s*\}/,
    );
  });
});
