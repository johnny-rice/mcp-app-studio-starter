import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "app/styles/leaflet-overrides.css",
);

describe("Leaflet dark-mode tile backdrop regression", () => {
  it("defines a dark backdrop for tile panes to prevent white flashing", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /\.dark \.leaflet-container/);
    assert.match(source, /\.dark \.leaflet-tile-pane/);
    assert.match(source, /\.dark \.leaflet-tile/);
    assert.match(source, /\[data-theme="dark"\] \.leaflet-tile-pane/);
  });
});
