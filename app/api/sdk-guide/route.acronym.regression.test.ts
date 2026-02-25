import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(process.cwd(), "app/api/sdk-guide/route.ts");

describe("sdk-guide acronym regression", () => {
  it("pins MCP to Model Context Protocol in system instructions", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const promptTemplateMatch = source.match(
      /function buildSystemPrompt\(context: WorkbenchContext\): string \{\s*return `([\s\S]*?)`;\s*\}/,
    );

    assert.ok(
      promptTemplateMatch,
      "Expected buildSystemPrompt template literal",
    );
    const systemPrompt = promptTemplateMatch[1];

    assert.match(systemPrompt, /MCP stands for Model Context Protocol/);
    assert.match(
      systemPrompt,
      /Never expand MCP as "Multi-Channel Platform" or any other phrase/,
    );
  });
});
