import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/workbench/sdk-guide/sdk-guide-modal.tsx",
);

describe("sdk-guide modal runtime regression", () => {
  it("disables auto-resubmit loops in chat runtime", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /useChatRuntime\(\{\s*transport,[\s\S]*sendAutomaticallyWhen:\s*\(\)\s*=>\s*false[\s\S]*\}\)/,
    );
  });
});
