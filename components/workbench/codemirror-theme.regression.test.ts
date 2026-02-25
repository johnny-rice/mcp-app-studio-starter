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
  it("avoids bundled theme extensions that include editor + highlighting together (githubDark/Light)", () => {
    const jsonEditorSource = read(JSON_EDITOR_FILE);
    const mockVariantEditorSource = read(MOCK_VARIANT_EDITOR_FILE);

    // githubDark/Light are full extensions (editor theme + highlighting).
    // They must not be used as the theme prop value.
    assert.doesNotMatch(jsonEditorSource, /githubDark|githubLight/);
    assert.doesNotMatch(mockVariantEditorSource, /githubDark|githubLight/);
  });

  it('uses theme="none" to prevent react-codemirror from injecting oneDark/defaultLight', () => {
    // theme="dark" causes @uiw/react-codemirror to push the full oneDark
    // extension (editor theme + syntaxHighlighting combined). theme="none"
    // avoids this and lets us control highlighting separately.
    const jsonEditorSource = read(JSON_EDITOR_FILE);
    const mockVariantEditorSource = read(MOCK_VARIANT_EDITOR_FILE);

    assert.match(jsonEditorSource, /theme="none"/);
    assert.doesNotMatch(
      jsonEditorSource,
      /theme=\{isDark \? "dark" : "light"\}/,
    );

    assert.doesNotMatch(
      mockVariantEditorSource,
      /theme=\{isDark \? "dark" : "light"\}/,
    );
    const noneCount = (mockVariantEditorSource.match(/theme="none"/g) ?? [])
      .length;
    const codeMirrorCount = (
      mockVariantEditorSource.match(/<CodeMirror/g) ?? []
    ).length;
    assert.equal(
      noneCount,
      codeMirrorCount,
      `Expected ${codeMirrorCount} theme="none" but found ${noneCount}`,
    );
  });

  it("imports only oneDarkHighlightStyle (not the full oneDark extension) for dark mode", () => {
    // oneDarkHighlightStyle is just syntax colors. oneDark bundles the
    // editor theme + highlighting and causes the crash when injected via
    // the theme prop. We import only the highlight style.
    const jsonEditorSource = read(JSON_EDITOR_FILE);
    const mockVariantEditorSource = read(MOCK_VARIANT_EDITOR_FILE);

    assert.match(jsonEditorSource, /oneDarkHighlightStyle/);
    assert.match(mockVariantEditorSource, /oneDarkHighlightStyle/);
    assert.doesNotMatch(jsonEditorSource, /\boneDark\b(?!HighlightStyle)/);
    assert.doesNotMatch(
      mockVariantEditorSource,
      /\boneDark\b(?!HighlightStyle)/,
    );
  });

  it("provides dark mode via custom EditorView.theme extensions (not the theme prop)", () => {
    const jsonEditorSource = read(JSON_EDITOR_FILE);

    assert.match(jsonEditorSource, /EditorView\.theme\(/);
    assert.match(jsonEditorSource, /dark:\s*true/);
    assert.match(jsonEditorSource, /dark:\s*false/);
  });
});
