"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { useDisplayMode, useWorkbenchStore } from "@/lib/workbench/store";
import type { Theme } from "@/lib/workbench/types";

const LIGHT_THEME_VARS: CSSProperties = {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--primary": "oklch(0.205 0 0)",
  "--primary-foreground": "oklch(0.985 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--border": "oklch(0.922 0 0)",
} as CSSProperties;

const DARK_THEME_VARS: CSSProperties = {
  "--background": "oklch(0.145 0 0)",
  "--foreground": "oklch(0.985 0 0)",
  "--card": "oklch(0.205 0 0)",
  "--card-foreground": "oklch(0.985 0 0)",
  "--primary": "oklch(0.922 0 0)",
  "--primary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.269 0 0)",
  "--muted-foreground": "oklch(0.708 0 0)",
  "--border": "oklch(1 0 0 / 10%)",
} as CSSProperties;

const THEME_VARS = {
  light: LIGHT_THEME_VARS,
  dark: DARK_THEME_VARS,
} as const;

interface IsolatedThemeWrapperProps {
  children: ReactNode;
  className?: string;
}

export function IsolatedThemeWrapper({
  children,
  className,
}: IsolatedThemeWrapperProps) {
  const previewTheme = useWorkbenchStore((s) => s.previewTheme);
  const displayMode = useDisplayMode();
  const safeAreaInsets = useWorkbenchStore((s) => s.safeAreaInsets);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const effectiveTheme: Theme = mounted ? previewTheme : "light";
  const themeVars = THEME_VARS[effectiveTheme];
  const insetStyle: CSSProperties =
    displayMode === "fullscreen"
      ? {
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }
      : {};

  return (
    <div
      data-theme={effectiveTheme}
      className={cn("text-foreground transition-colors", className)}
      style={{ colorScheme: effectiveTheme, ...themeVars, ...insetStyle }}
    >
      {children}
    </div>
  );
}
