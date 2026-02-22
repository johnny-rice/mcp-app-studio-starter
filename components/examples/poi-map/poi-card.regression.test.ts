import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/examples/poi-map/poi-card.tsx",
);

describe("POI card interaction and styling regression", () => {
  it("makes expanded card container clickable while keeping nested actions", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(source, /role="button"/);
    assert.match(source, /tabIndex=\{0\}/);
    assert.match(source, /onClick=\{\(\) => onSelect\(poi\.id\)\}/);
    assert.match(source, /onKeyDown=\{\(event\) =>/);
    assert.match(source, /event\.key === "Enter" \|\| event\.key === " "/);
    assert.match(source, /e\.stopPropagation\(\)/);
  });

  it("uses simplified badges and subtle secondary view-details action", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.doesNotMatch(
      source,
      /import \{[\s\S]*\bInfo\b[\s\S]*\} from "lucide-react"/,
    );
    assert.match(
      source,
      /<Badge variant="secondary" className="h-5 gap-1 px-1.5 border-none text-\[11px\]">/,
    );
    assert.doesNotMatch(
      source,
      /<Badge[\s\S]*\{poi\.rating\.toFixed\(1\)\}[\s\S]*<\/Badge>/,
    );
    assert.match(
      source,
      /<span className="inline-flex h-5 items-center gap-1 text-muted-foreground text-\[11px\] tabular-nums">/,
    );
    assert.match(source, /variant="secondary"/);
    assert.match(
      source,
      /className="mt-1\.5 h-8 self-start rounded-lg bg-muted\/60 px-2\.5 text-xs/,
    );
    assert.doesNotMatch(source, /<Info className=/);
  });

  it("removes compact badge treatments and tightens expanded text alignment/spacing", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");
    const compactBlock = source.match(
      /if \(variant === "compact"\) \{[\s\S]*?\n {2}}\n\n {2}return \(/,
    )?.[0];

    assert.ok(compactBlock);
    assert.doesNotMatch(compactBlock, /<Badge/);
    assert.match(
      compactBlock,
      /<span className="inline-flex items-center gap-1 text-muted-foreground text-\[11px\]">/,
    );

    assert.match(
      source,
      /<div className="flex min-w-0 flex-1 flex-col -mt-0\.5">/,
    );
    assert.match(
      source,
      /<h3 className="min-w-0 truncate font-medium text-base tracking-tight">/,
    );
    assert.match(
      source,
      /<div className="mt-0\.5 flex flex-wrap items-center gap-1\.5">/,
    );
    assert.match(
      source,
      /<p className="mt-1\.5 line-clamp-2 text-foreground text-sm leading-relaxed">/,
    );
  });
});
