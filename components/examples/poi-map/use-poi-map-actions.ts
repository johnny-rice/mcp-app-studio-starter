"use client";

import { useCallback } from "react";
import type { MapCenter, POICategory } from "./schema";

type DisplayMode = "inline" | "pip" | "fullscreen";

interface POIMapActionsParams {
  displayMode: DisplayMode;
  previousDisplayMode: DisplayMode;
  favoriteIds: Set<string>;
  selectPoi: (poiId: string | null) => void;
  toggleFavoriteInternal: (poiId: string) => void;
  setMapViewport: (center: MapCenter, zoom: number) => void;
  setCategoryFilter: (category: POICategory | null) => void;
  onRequestDisplayMode: (mode: DisplayMode) => void;
  onToggleFavorite?: (poiId: string, isFavorite: boolean) => void;
  onFilterCategory?: (category: POICategory | null) => void;
}

export function usePOIMapActions({
  displayMode,
  previousDisplayMode,
  favoriteIds,
  selectPoi,
  toggleFavoriteInternal,
  setMapViewport,
  setCategoryFilter,
  onRequestDisplayMode,
  onToggleFavorite,
  onFilterCategory,
}: POIMapActionsParams) {
  const handleToggleFavorite = useCallback(
    (poiId: string) => {
      toggleFavoriteInternal(poiId);
      onToggleFavorite?.(poiId, !favoriteIds.has(poiId));
    },
    [toggleFavoriteInternal, onToggleFavorite, favoriteIds],
  );

  const handleMoveEnd = useCallback(
    (center: MapCenter, zoom: number) => {
      setMapViewport(center, zoom);
    },
    [setMapViewport],
  );

  const handleToggleFullscreen = useCallback(() => {
    onRequestDisplayMode(
      displayMode === "fullscreen" ? previousDisplayMode : "fullscreen",
    );
  }, [displayMode, previousDisplayMode, onRequestDisplayMode]);

  const handleFilterCategory = useCallback(
    (category: POICategory | null) => {
      setCategoryFilter(category);
      onFilterCategory?.(category);
    },
    [setCategoryFilter, onFilterCategory],
  );

  const handleSelectPoiInline = useCallback(
    (poiId: string) => {
      selectPoi(poiId);
      onRequestDisplayMode("fullscreen");
    },
    [selectPoi, onRequestDisplayMode],
  );

  return {
    handleFilterCategory,
    handleMoveEnd,
    handleSelectPoiInline,
    handleToggleFavorite,
    handleToggleFullscreen,
  };
}
