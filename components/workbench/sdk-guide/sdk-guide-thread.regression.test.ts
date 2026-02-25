import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/sdk-guide/sdk-guide-thread.tsx",
);

describe("sdk-guide thread send action regression", () => {
  it("does not use submit-type send buttons that can double-dispatch requests", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.doesNotMatch(source, /type="submit"/);
    assert.match(source, /ComposerPrimitive\.Send/);
  });
});
