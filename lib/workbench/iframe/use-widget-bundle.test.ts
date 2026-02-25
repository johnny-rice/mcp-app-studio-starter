import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  buildBundleCacheKey,
  buildBundleRequestPath,
  buildHmrPreviewPath,
} from "./use-widget-bundle";

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  (process.env as Record<string, string | undefined>).NODE_ENV =
    originalNodeEnv;
});

describe("buildBundleRequestPath", () => {
  it("includes component id", () => {
    const path = buildBundleRequestPath("poi-map", "");
    assert.equal(path, "/api/workbench/bundle?id=poi-map");
  });

  it("uses static bundle in production when demo query is absent", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const path = buildBundleRequestPath("poi-map", "");
    assert.equal(path, "/workbench-bundles/poi-map.js");
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

  it("uses demo cache namespace in production", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const key = buildBundleCacheKey("poi-map", "");
    assert.equal(key, "poi-map::demo");
  });
});

describe("buildHmrPreviewPath", () => {
  it("builds preview URL for selected component", () => {
    const path = buildHmrPreviewPath("poi-map", "");
    assert.equal(
      path,
      "/__workbench_hmr/lib/workbench/hmr/preview.html?component=poi-map",
    );
  });
});
