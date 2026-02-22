import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBundleCacheKey,
  buildBundleRequestPath,
} from "./use-widget-bundle";

describe("buildBundleRequestPath", () => {
  it("includes component id", () => {
    const path = buildBundleRequestPath("poi-map", "");
    assert.equal(path, "/api/workbench/bundle?id=poi-map");
  });

  it("uses static demo bundle when demo=true is present", () => {
    const path = buildBundleRequestPath("poi-map", "?demo=true");
    assert.equal(path, "/workbench-bundles/poi-map.js");
  });

  it("ignores unrelated query params", () => {
    const path = buildBundleRequestPath(
      "welcome",
      "?component=welcome&foo=bar",
    );
    assert.equal(path, "/api/workbench/bundle?id=welcome");
  });
});

describe("buildBundleCacheKey", () => {
  it("separates cache keys for demo and non-demo modes", () => {
    const demoKey = buildBundleCacheKey("poi-map", "?demo=true");
    const devKey = buildBundleCacheKey("poi-map", "");

    assert.notEqual(demoKey, devKey);
  });
});
