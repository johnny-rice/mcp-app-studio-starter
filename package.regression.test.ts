import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const PACKAGE_JSON_FILE = path.resolve(process.cwd(), "package.json");

describe("package dependency regressions", () => {
  it("keeps @lezer/highlight available for codemirror github theme builds", () => {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE, "utf8")) as {
      dependencies?: Record<string, string>;
    };

    assert.ok(pkg.dependencies);
    assert.equal(typeof pkg.dependencies?.["@lezer/highlight"], "string");
  });
});
