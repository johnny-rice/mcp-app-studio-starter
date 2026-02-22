import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/examples/poi-map/leaflet-map.tsx",
);

describe("Leaflet map rendering regression", () => {
  it("invalidates map size after mount/resize to avoid gray clipped tiles", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /invalidateSize\(/);
    assert.match(source, /ResizeObserver/);
  });
});
