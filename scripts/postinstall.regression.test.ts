import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(process.cwd(), "scripts/postinstall.ts");

describe("postinstall recursion guard", () => {
  it("sets and checks an env guard to prevent recursive install loops", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /const POSTINSTALL_GUARD_ENV = "MCP_APP_STUDIO_SERVER_POSTINSTALL";/,
    );
    assert.match(source, /process\.env\[POSTINSTALL_GUARD_ENV\] === "1"/);
    assert.match(source, /\[POSTINSTALL_GUARD_ENV\]: "1"/);
  });
});
