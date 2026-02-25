import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const JSON_EDITOR_FILE = path.resolve(
  process.cwd(),
  "components/workbench/json-editor.tsx",
);
const MOCK_VARIANT_EDITOR_FILE = path.resolve(
  process.cwd(),
  "components/workbench/mock-variant-editor.tsx",
);

function read(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("CodeMirror theme safety regression", () => {
  it("avoids github theme objects that can crash with 'tags is not iterable'", () => {
    const jsonEditorSource = read(JSON_EDITOR_FILE);
    const mockVariantEditorSource = read(MOCK_VARIANT_EDITOR_FILE);

    assert.doesNotMatch(jsonEditorSource, /githubDark|githubLight/);
    assert.doesNotMatch(mockVariantEditorSource, /githubDark|githubLight/);
  });

  it("uses string theme selection for workbench editors", () => {
    const jsonEditorSource = read(JSON_EDITOR_FILE);
    const mockVariantEditorSource = read(MOCK_VARIANT_EDITOR_FILE);

    assert.match(jsonEditorSource, /theme=\{isDark \? "dark" : "light"\}/);
    assert.match(
      mockVariantEditorSource,
      /theme=\{isDark \? "dark" : "light"\}/,
    );
  });

  it("disables syntax highlighting in workbench CodeMirror instances to avoid tag-style crashes", () => {
    const jsonEditorSource = read(JSON_EDITOR_FILE);
    const mockVariantEditorSource = read(MOCK_VARIANT_EDITOR_FILE);

    assert.match(jsonEditorSource, /syntaxHighlighting:\s*false/);
    assert.equal(
      (mockVariantEditorSource.match(/syntaxHighlighting:\s*false/g) ?? [])
        .length,
      2,
    );
  });
});
