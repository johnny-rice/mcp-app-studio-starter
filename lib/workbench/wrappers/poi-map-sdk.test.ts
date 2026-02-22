import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/components/examples/poi-map";
import { resolveSerializablePOIMapInput } from "./poi-map-input";
import { mergePOIMapWidgetState } from "./poi-map-widget-state";

const VALID_INPUT = {
  id: "test-poi-map",
  pois: [
    {
      id: "1",
      name: "Golden Gate Bridge",
      category: "landmark",
      lat: 37.8199,
      lng: -122.4783,
    },
  ],
  initialCenter: { lat: 37.7749, lng: -122.4194 },
  initialZoom: 12,
  title: "San Francisco POIs",
};

const WRAPPER_FILE = path.resolve(
  process.cwd(),
  "lib/workbench/wrappers/poi-map-sdk.tsx",
);

describe("resolveSerializablePOIMapInput", () => {
  it("uses the primary tool input when valid", () => {
    const parsed = resolveSerializablePOIMapInput(VALID_INPUT);
    assert.equal(parsed.id, VALID_INPUT.id);
    assert.equal(parsed.pois.length, 1);
  });

  it("falls back to OpenAI tool input when primary is invalid", () => {
    const parsed = resolveSerializablePOIMapInput({}, VALID_INPUT);
    assert.equal(parsed.id, VALID_INPUT.id);
    assert.equal(parsed.pois.length, 1);
  });

  it("returns safe defaults when both primary and fallback are invalid", () => {
    const parsed = resolveSerializablePOIMapInput({}, null);
    assert.equal(typeof parsed.id, "string");
    assert.ok(Array.isArray(parsed.pois));
  });
});

describe("mergePOIMapWidgetState", () => {
  it("preserves input-derived center/zoom when no persisted state exists", () => {
    const merged = mergePOIMapWidgetState(
      {
        selectedPoiId: null,
        favoriteIds: [],
        mapCenter: { lat: 10, lng: 20 },
        mapZoom: 8,
        categoryFilter: null,
      },
      null,
    );

    assert.deepEqual(merged.mapCenter, { lat: 10, lng: 20 });
    assert.equal(merged.mapZoom, 8);
  });

  it("prefers persisted state center/zoom when provided", () => {
    const merged = mergePOIMapWidgetState(
      {
        selectedPoiId: null,
        favoriteIds: [],
        mapCenter: { lat: 10, lng: 20 },
        mapZoom: 8,
        categoryFilter: null,
      },
      {
        mapCenter: DEFAULT_CENTER,
        mapZoom: DEFAULT_ZOOM,
      },
    );

    assert.deepEqual(merged.mapCenter, DEFAULT_CENTER);
    assert.equal(merged.mapZoom, DEFAULT_ZOOM);
  });
});

describe("POIMapSDK host context wiring", () => {
  it("passes desktop host context into POIMap shell behavior", () => {
    const source = fs.readFileSync(WRAPPER_FILE, "utf8");

    assert.match(
      source,
      /const isDesktopHost[\s\S]*hostContext\?\.platform !== "mobile"/,
    );
    assert.match(source, /<POIMap[\s\S]*isDesktopHost=\{isDesktopHost\}/);
  });
});
