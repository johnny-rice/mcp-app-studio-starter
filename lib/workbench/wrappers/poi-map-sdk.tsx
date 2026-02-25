"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type POICategory,
  POIMap,
  type POIMapViewState,
} from "@/components/examples/poi-map";
import {
  type DisplayMode,
  openModal,
  useCallTool,
  useDisplayMode,
  useFeature,
  useHostContext,
  useOpenLink,
  useSendMessage,
  useTheme,
  useToolInput,
  useWidgetState,
} from "@/lib/sdk";
import {
  readOpenAIToolInputForPOIMap,
  resolveSerializablePOIMapInput,
} from "./poi-map-input";
import {
  DEFAULT_WIDGET_STATE,
  mergePOIMapWidgetState,
} from "./poi-map-widget-state";

type View = {
  mode: "modal" | "inline";
  params: Record<string, unknown> | null;
};

/**
 * Workbench + export wrapper for the POI map widget.
 *
 * Notes on ChatGPT-specific behavior:
 * - ChatGPT may provide additional APIs via `window.openai` (widgetState, files, etc).
 * - The universal SDK treats those as optional extensions; this widget checks
 *   `useFeature('widgetState')` and falls back to local state when unavailable.
 */
export function POIMapSDK() {
  const toolInput = useToolInput<Record<string, unknown>>();
  const parsed = useMemo(
    () =>
      resolveSerializablePOIMapInput(
        toolInput ?? {},
        readOpenAIToolInputForPOIMap(),
      ),
    [toolInput],
  );

  const [mode, requestDisplayMode] = useDisplayMode();
  const previousDisplayModeRef = useRef<DisplayMode | null>(null);
  const lastModeRef = useRef(mode);

  if (lastModeRef.current !== mode) {
    previousDisplayModeRef.current = lastModeRef.current as DisplayMode;
    lastModeRef.current = mode;
  }

  const theme = useTheme();
  const hostContext = useHostContext();
  const isDesktopHost = hostContext?.platform !== "mobile";
  const openLink = useOpenLink();
  const sendMessage = useSendMessage();
  const callTool = useCallTool();

  const hasWidgetState = useFeature("widgetState");
  const [persistedState, setPersistedState] = useWidgetState<POIMapViewState>();
  const [localState, setLocalState] = useState<POIMapViewState | null>(null);

  const baseState = hasWidgetState ? persistedState : localState;

  const derivedDefaults = useMemo(
    () => ({
      ...DEFAULT_WIDGET_STATE,
      mapCenter: parsed.initialCenter ?? DEFAULT_CENTER,
      mapZoom: parsed.initialZoom ?? DEFAULT_ZOOM,
    }),
    [parsed.initialCenter, parsed.initialZoom],
  );

  const currentWidgetState = useMemo<POIMapViewState>(
    () => mergePOIMapWidgetState(derivedDefaults, baseState),
    [baseState, derivedDefaults],
  );

  const handleWidgetStateChange = useCallback(
    (partialState: Partial<POIMapViewState>) => {
      const next = { ...currentWidgetState, ...partialState };
      if (hasWidgetState) {
        setPersistedState(next);
      } else {
        setLocalState(next);
      }
    },
    [currentWidgetState, hasWidgetState, setPersistedState],
  );

  const handleRefresh = useCallback(async () => {
    await callTool("refresh_pois", {
      center: currentWidgetState.mapCenter,
      zoom: currentWidgetState.mapZoom,
    });
  }, [callTool, currentWidgetState.mapCenter, currentWidgetState.mapZoom]);

  const handleToggleFavorite = useCallback(
    async (poiId: string, isFavorite: boolean) => {
      await callTool("toggle_favorite", {
        poi_id: poiId,
        is_favorite: isFavorite,
      });
    },
    [callTool],
  );

  const handleFilterCategory = useCallback(
    async (category: POICategory | null) => {
      await callTool("filter_pois", {
        category,
      });
    },
    [callTool],
  );

  const [localView, setLocalView] = useState<View | null>(null);
  const handleViewDetails = useCallback((poiId: string) => {
    setLocalView({
      mode: "modal",
      params: { poiId },
    });
    void openModal({
      title: "POI Details",
      params: { poiId },
    });
  }, []);

  const handleDismissModal = useCallback(() => {
    setLocalView(null);
  }, []);

  return (
    <POIMap
      id={parsed.id}
      pois={parsed.pois}
      initialCenter={parsed.initialCenter}
      initialZoom={parsed.initialZoom}
      title={parsed.title}
      displayMode={mode as unknown as DisplayMode}
      previousDisplayMode={previousDisplayModeRef.current ?? undefined}
      widgetState={currentWidgetState}
      theme={theme}
      isDesktopHost={isDesktopHost}
      view={localView}
      onWidgetStateChange={handleWidgetStateChange}
      onRequestDisplayMode={requestDisplayMode}
      onRefresh={handleRefresh}
      onToggleFavorite={handleToggleFavorite}
      onFilterCategory={handleFilterCategory}
      onViewDetails={handleViewDetails}
      onDismissModal={handleDismissModal}
      onOpenExternal={openLink}
      onSendFollowUpMessage={sendMessage}
    />
  );
}
