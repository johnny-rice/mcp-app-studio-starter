import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/examples/poi-map/poi-list-sidebar.tsx",
);

describe("POI list sidebar spacing regression", () => {
  it("avoids right-only internal gutter so card layout remains horizontally balanced", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /className=\{cn\("scrollbar-subtle h-full overflow-y-auto", className\)\}/,
    );
    assert.doesNotMatch(source, /overflow-y-auto pr-1/);
  });
});
