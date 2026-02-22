import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/iframe-component-content.tsx",
);

describe("IframeComponentContent regression coverage", () => {
  it("wraps iframe preview content in ComponentErrorBoundary", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.ok(source.includes("ComponentErrorBoundary"));
    assert.ok(source.includes("useToolInput"));
    assert.match(
      source,
      /<ComponentErrorBoundary\s+toolInput=\{toolInput\}>[\s\S]*<IframeComponentRenderer\s*\/>[\s\S]*<\/ComponentErrorBoundary>/,
    );
  });

  it("isolates theme only for the mounted widget, not loading/error placeholders", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /if \(loading\) \{\n\s*return <LoadingState \/>\s*;\n\s*\}/);
    assert.match(source, /if \(error\) \{\n\s*return <ErrorState error=\{error\} \/>\s*;\n\s*\}/);
    assert.match(source, /<IsolatedThemeWrapper className="h-full w-full flex">[\s\S]*<WidgetIframeHost/);
  });
});
