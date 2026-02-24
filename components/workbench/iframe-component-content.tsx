"use client";

import { useDemoMode } from "@/hooks/use-demo-mode";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { useWidgetBundle, WidgetIframeHost } from "@/lib/workbench/iframe";
import { useSelectedComponent, useToolInput } from "@/lib/workbench/store";
import { ComponentErrorBoundary } from "./component-error-boundary";
import { IsolatedThemeWrapper } from "./isolated-theme-wrapper";

const LOADING_APPEAR_DELAY_MS = 1200;
const LOADING_FADE_DURATION_MS = 220;

function LoadingState({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full w-full grow items-center justify-center p-8 transition-opacity",
        visible ? "opacity-100 duration-300" : "opacity-0 duration-200",
      )}
    >
      <div className="text-center pointer-events-none">
        <div className="text-muted-foreground text-sm">Preparing widget...</div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-background p-8">
      <div className="text-center">
        <div className="font-medium text-destructive text-sm">Bundle Error</div>
        <div className="mt-1 max-w-md text-muted-foreground text-xs">
          {error}
        </div>
      </div>
    </div>
  );
}

function IframeComponentRenderer() {
  const selectedComponent = useSelectedComponent();
  const isDemoMode = useDemoMode();
  const { loading, error, bundle } = useWidgetBundle(selectedComponent);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const appearTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (appearTimerRef.current !== null) {
      window.clearTimeout(appearTimerRef.current);
      appearTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (loading) {
      setShowLoading(true);
      setLoadingVisible(false);
      appearTimerRef.current = window.setTimeout(() => {
        setLoadingVisible(true);
      }, LOADING_APPEAR_DELAY_MS);
      return;
    }

    setLoadingVisible(false);
    hideTimerRef.current = window.setTimeout(() => {
      setShowLoading(false);
    }, LOADING_FADE_DURATION_MS);
  }, [loading]);

  useEffect(
    () => () => {
      if (appearTimerRef.current !== null) {
        window.clearTimeout(appearTimerRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    },
    [],
  );

  if (showLoading) {
    return (
      <IsolatedThemeWrapper className="h-full w-full flex">
        <LoadingState visible={loadingVisible} />
      </IsolatedThemeWrapper>
    );
  }

  if (error) {
    return (
      <IsolatedThemeWrapper className="h-full w-full flex">
        <ErrorState error={error} />
      </IsolatedThemeWrapper>
    );
  }

  return (
    <IsolatedThemeWrapper className="h-full w-full flex">
      <WidgetIframeHost
        widgetBundle={bundle}
        className="h-full w-full"
        demoMode={isDemoMode}
      />
    </IsolatedThemeWrapper>
  );
}

export function IframeComponentContent({ className }: { className?: string }) {
  const toolInput = useToolInput();

  return (
    <div className={cn("h-full w-full", className)}>
      <ComponentErrorBoundary toolInput={toolInput}>
        <IframeComponentRenderer />
      </ComponentErrorBoundary>
    </div>
  );
}
