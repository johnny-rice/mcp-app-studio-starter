import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "lib/workbench/iframe/widget-iframe-host.tsx",
);

function getBridgeEffectDeps(source: string): string[] {
  const match = source.match(
    /use(?:Layout)?Effect\(\(\) => \{\n\s*const iframe = iframeRef\.current;[\s\S]*?new WorkbenchMessageBridge\(handlersRef\.current\)[\s\S]*?\}, \[([^\]]*)\]\);/,
  );

  assert.ok(match, "expected to find WorkbenchMessageBridge attach effect");
  return match[1]
    .split(",")
    .map((dep) => dep.trim())
    .filter(Boolean);
}

function getOpenAIBridgeEffectKind(source: string): "effect" | "layout" {
  const match = source.match(
    /(use(?:Layout)?Effect)\(\(\) => \{\n\s*const iframe = iframeRef\.current;[\s\S]*?new WorkbenchMessageBridge\(handlersRef\.current\)/,
  );
  assert.ok(match, "expected to find WorkbenchMessageBridge hook");
  return match[1] === "useLayoutEffect" ? "layout" : "effect";
}

function getSrcDocMemoDeps(source: string): string[] {
  const match = source.match(
    /const srcdoc = useMemo\(\(\) => \{[\s\S]*?\}, \[([^\]]*)\]\);/,
  );

  assert.ok(match, "expected to find srcdoc useMemo dependencies");
  return match[1]
    .split(",")
    .map((dep) => dep.trim())
    .filter(Boolean);
}

function getAppBridgeLayoutEffectDeps(source: string): string[] {
  const match = source.match(
    /useLayoutEffect\(\(\) => \{[\s\S]*?const bridge = new AppBridge[\s\S]*?\}, \[([^\]]*)\]\);/,
  );

  assert.ok(match, "expected to find AppBridge useLayoutEffect dependencies");
  return match[1]
    .split(",")
    .map((dep) => dep.trim())
    .filter(Boolean);
}

describe("WidgetIframeHost bridge lifecycle regression", () => {
  it("keeps bridge attachment stable across globals/state updates", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const deps = getBridgeEffectDeps(source);

    // Recreating/detaching the bridge during callTool handling drops
    // OPENAI_METHOD_RESPONSE and leaves window.openai promises unresolved.
    assert.deepEqual(deps, ["iframeKey"]);
  });

  it("attaches bridge immediately when iframe is already loaded", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /if \(iframe\.contentWindow\) \{\n\s*handleLoad\(\);\n\s*\}/,
    );
  });

  it("does not rebuild iframe srcDoc when globals change", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const deps = getSrcDocMemoDeps(source);

    // Changing srcDoc reloads the iframe and resets widget-local state.
    // Globals are delivered via bridgeRef.sendGlobals and should not rebuild srcDoc.
    assert.deepEqual(deps, ["widgetBundle", "cssBundle", "demoMode", "hmrSrc"]);
  });

  it("pushes globals updates over the bridge so theme changes work in srcDoc fallback mode", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /useEffect\(\(\) => \{\n\s*if \(bridgeRef\.current\) \{\n\s*bridgeRef\.current\.sendGlobals\(globals\);\n\s*\}\n\s*\}, \[globals\]\);/,
    );
  });

  it("keeps AppBridge connection effect independent from store/callback churn", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const deps = getAppBridgeLayoutEffectDeps(source);

    assert.deepEqual(deps, ["demoMode", "iframeKey"]);
  });

  it("attaches OPENAI bridge in layout phase before AppBridge connects", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const openAIBridgeIdx = source.indexOf(
      "new WorkbenchMessageBridge(handlersRef.current)",
    );
    const appBridgeIdx = source.indexOf("const bridge = new AppBridge");

    assert.equal(getOpenAIBridgeEffectKind(source), "layout");
    assert.notEqual(openAIBridgeIdx, -1);
    assert.notEqual(appBridgeIdx, -1);
    assert.ok(openAIBridgeIdx < appBridgeIdx);
  });

  it("does not auto-register simulation config for every tool call", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.doesNotMatch(source, /registerSimTool\(name\)/);
  });

  it("evaluates mock handlers before simulation overrides", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const firstSimulationRead = source.indexOf("const simConfig =");
    const firstMockCall = source.indexOf("handleMockToolCall(");

    assert.notEqual(firstSimulationRead, -1);
    assert.notEqual(firstMockCall, -1);
    assert.ok(firstMockCall < firstSimulationRead);
  });

  it("routes server-sourced tools through the MCP client", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /toolConfig\?\.source === "server"/);
    assert.match(source, /callMcpTool\(/);
  });

  it("cleans up uploaded file object URLs when iframe lifecycle resets", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /clearFiles/);
    assert.match(
      source,
      /useEffect\(\(\) => \{\n\s*return \(\) => \{\n\s*clearFiles\(\);\n\s*\};\n\s*\}, \[iframeKey\]\);/,
    );
  });

  it("uses host-matching dark shell background to prevent white flashes", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /const iframeShellBackground =/);
    assert.match(
      source,
      /effectiveTheme === "dark" \? "rgb\(23 23 23\)" : "transparent"/,
    );
    assert.match(source, /backgroundColor: iframeShellBackground/);
  });

  it("supports URL-based HMR iframe loading with src fallback", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    assert.match(source, /src=\{hmrSrc \?\? undefined\}/);
    assert.match(source, /srcDoc=\{srcdoc \?\? undefined\}/);
  });
});
