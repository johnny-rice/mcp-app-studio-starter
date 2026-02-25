import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(process.cwd(), "app/api/sdk-guide/route.ts");

describe("sdk-guide route streaming regression", () => {
  it("passes originalMessages to UI stream response to keep message ids stable", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /toUIMessageStreamResponse\(\s*\{[\s\S]*originalMessages:\s*messages[\s\S]*\}\s*\)/,
    );
  });
});
