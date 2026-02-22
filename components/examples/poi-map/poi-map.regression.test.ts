import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const TARGET_FILE = path.resolve(
  process.cwd(),
  "components/examples/poi-map/poi-map.tsx",
);

describe("POI map fullscreen layout regression", () => {
  it("uses a full-bleed shell on desktop hosts and keeps inset guard on touch hosts", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /isDesktopHost[\s\S]*\? "relative flex h-full w-full gap-2"[\s\S]*: "relative flex h-full w-full gap-2 p-2 sm:gap-3 sm:p-3"/,
    );
    assert.match(
      source,
      /isDesktopHost[\s\S]*\? "relative isolate min-w-0 flex-1 overflow-hidden"[\s\S]*: "relative isolate min-w-0 flex-1 overflow-hidden rounded-2xl border border-border\/50 shadow-sm"/,
    );
  });

  it("uses a wider sidebar and aligns/improves header typography", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl bg-card\/50 py-3 backdrop-blur-sm"/,
    );
    assert.doesNotMatch(
      source,
      /className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl bg-card\/50 py-3 pr-1 backdrop-blur-sm"/,
    );
    assert.match(source, /<div className="mb-3 px-2.5">/);
    assert.match(source, /className="font-semibold text-base tracking-tight"/);
    assert.match(source, /className="mt-0\.5 text-muted-foreground text-sm"/);
  });

  it("uses fully round top-right map action buttons", () => {
    const source = fs.readFileSync(TARGET_FILE, "utf8");

    assert.match(
      source,
      /className="size-10 rounded-full bg-background\/90 backdrop-blur-md transition-all hover:bg-background active:scale-95"/,
    );
    assert.doesNotMatch(
      source,
      /className="size-10 rounded-xl bg-background\/90 backdrop-blur-md transition-all hover:bg-background active:scale-95"/,
    );
  });
});
