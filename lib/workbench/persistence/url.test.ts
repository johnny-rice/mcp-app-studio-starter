import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { componentConfigs } from "../component-configs";
import { buildUrlParams, parseUrlParams } from "./url";

describe("workbench URL persistence", () => {
  it("parses resizable device mode from URL params", () => {
    const parsed = parseUrlParams(
      new URLSearchParams("mode=inline&device=resizable&theme=dark"),
    );

    assert.equal(parsed.device, "resizable");
  });

  it("round-trips resizable device mode through build + parse", () => {
    const params = buildUrlParams({
      mode: "pip",
      device: "resizable",
      theme: "light",
      component: "poi-map",
    });
    const reparsed = parseUrlParams(params);

    assert.deepEqual(reparsed, {
      mode: "pip",
      device: "resizable",
      theme: "light",
      component: "poi-map",
    });
  });

  it("parses component selection from URL params", () => {
    const parsed = parseUrlParams(
      new URLSearchParams(
        "component=poi-map&mode=inline&device=desktop&theme=light",
      ),
    );

    assert.equal(parsed.component, "poi-map");
  });

  it("falls back to default component when URL component is invalid", () => {
    const parsed = parseUrlParams(
      new URLSearchParams("component=not-a-real-id"),
    );
    const defaultComponent = componentConfigs[0]?.id ?? "welcome";

    assert.equal(parsed.component, defaultComponent);
  });
});
