import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPoiIdSelector } from "./selector";

describe("buildPoiIdSelector", () => {
  it("escapes selector-breaking characters in POI ids", () => {
    const selector = buildPoiIdSelector('a"]#b');
    assert.equal(selector, '[data-poi-id="a\\"]\\#b"]');
  });

  it("keeps simple ids unchanged", () => {
    const selector = buildPoiIdSelector("poi-123");
    assert.equal(selector, '[data-poi-id="poi-123"]');
  });
});
