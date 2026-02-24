"use client";

import { useMemo } from "react";
import { cn } from "./_adapter";
import { MapView } from "./map-view";
import { CategoryFilterMenu } from "./poi-category-filter-menu";
import { POIListInline } from "./poi-list-inline";
import { POIListSidebar } from "./poi-list-sidebar";
import { MapControls } from "./poi-map-controls";
import { ModalOverlay } from "./poi-modal-overlay";
import type { MapCenter, POI, POICategory, POIMapViewState } from "./schema";
import { CATEGORY_LABELS } from "./schema";
import { usePOIMap } from "./use-poi-map";
import { usePOIMapActions } from "./use-poi-map-actions";

type DisplayMode = "inline" | "pip" | "fullscreen";

interface View {
  mode: "modal" | "inline";
  params: Record<string, unknown> | null;
}

const INLINE_CARD_SHADOW = [
  "0 0 0 1px rgba(0, 0, 0, 0.03)",
  "0 1px 2px rgba(0, 0, 0, 0.04)",
  "0 4px 8px rgba(0, 0, 0, 0.04)",
  "0 8px 16px rgba(0, 0, 0, 0.03)",
].join(", ");

export interface POIMapProps {
  id: string;
  pois: POI[];
  initialCenter?: MapCenter;
  initialZoom?: number;
  title?: string;
  className?: string;
  displayMode: DisplayMode;
  previousDisplayMode?: DisplayMode;
  widgetState: POIMapViewState | null;
  theme: "light" | "dark";
  isDesktopHost?: boolean;
  view?: View | null;
  onWidgetStateChange: (state: Partial<POIMapViewState>) => void;
  onRequestDisplayMode: (mode: DisplayMode) => void;
  onRefresh?: () => void;
  onToggleFavorite?: (poiId: string, isFavorite: boolean) => void;
  onFilterCategory?: (category: POICategory | null) => void;
  onViewDetails?: (poiId: string) => void;
  onDismissModal?: () => void;
  onOpenExternal?: (url: string) => void;
  onSendFollowUpMessage?: (prompt: string) => void;
}

function getModalPoiId(view?: View | null): string | null {
  if (view?.mode !== "modal" || !view.params?.poiId) return null;
  return String(view.params.poiId);
}

export function POIMap({
  id,
  pois,
  initialCenter,
  initialZoom,
  title,
  className,
  displayMode,
  previousDisplayMode = "inline",
  widgetState,
  theme,
  isDesktopHost = false,
  view,
  onWidgetStateChange,
  onRequestDisplayMode,
  onRefresh,
  onToggleFavorite,
  onFilterCategory,
  onViewDetails,
  onDismissModal,
  onOpenExternal,
  onSendFollowUpMessage,
}: POIMapProps) {
  const {
    selectedPoiId,
    favoriteIds,
    mapCenter,
    mapZoom,
    categoryFilter,
    filteredPois,
    categories,
    selectPoi,
    toggleFavorite: toggleFavoriteInternal,
    setMapViewport,
    setCategoryFilter,
  } = usePOIMap({
    pois,
    widgetState,
    initialCenter,
    initialZoom,
    onWidgetStateChange,
  });

  const {
    handleFilterCategory,
    handleMoveEnd,
    handleSelectPoiInline,
    handleToggleFavorite,
    handleToggleFullscreen,
  } = usePOIMapActions({
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
  });

  const isFullscreen = displayMode === "fullscreen";
  const modalPoiId = getModalPoiId(view);
  const modalPoi = useMemo(
    () => (modalPoiId ? pois.find((poi) => poi.id === modalPoiId) : null),
    [pois, modalPoiId],
  );
  const locationSummary = `${filteredPois.length} location${
    filteredPois.length !== 1 ? "s" : ""
  }${categoryFilter ? ` · ${CATEGORY_LABELS[categoryFilter]}` : ""}`;

  const modalOverlay = modalPoi ? (
    <ModalOverlay
      poi={modalPoi}
      favoriteIds={favoriteIds}
      onDismissModal={onDismissModal}
      onToggleFavorite={handleToggleFavorite}
      onOpenExternal={onOpenExternal}
      onSendFollowUpMessage={onSendFollowUpMessage}
    />
  ) : null;

  const mapView = (
    <MapView
      pois={filteredPois}
      center={mapCenter}
      zoom={mapZoom}
      selectedPoiId={selectedPoiId}
      favoriteIds={favoriteIds}
      onSelectPoi={selectPoi}
      onMoveEnd={handleMoveEnd}
      theme={theme}
      className="h-full w-full"
    />
  );

  if (isFullscreen) {
    return (
      <div
        id={id}
        className={cn(
          isDesktopHost
            ? "relative flex h-full w-full gap-2"
            : "relative flex h-full w-full gap-2 p-2 sm:gap-3 sm:p-3",
          className,
        )}
        data-tool-ui-id={id}
        data-slot="poi-map"
      >
        {modalOverlay}
        <div className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl bg-card/50 py-3 backdrop-blur-sm">
          <div className="mb-3 px-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-base tracking-tight">
                {title ?? "Locations"}
              </span>
              <CategoryFilterMenu
                categories={categories}
                categoryFilter={categoryFilter}
                onFilterCategory={handleFilterCategory}
              />
            </div>
            <p className="mt-0.5 text-muted-foreground text-sm">{locationSummary}</p>
          </div>
          <POIListSidebar
            pois={filteredPois}
            selectedPoiId={selectedPoiId}
            favoriteIds={favoriteIds}
            onSelectPoi={selectPoi}
            onToggleFavorite={handleToggleFavorite}
            onViewDetails={onViewDetails}
            className="flex-1"
          />
        </div>

        <div
          className={
            isDesktopHost
              ? "relative isolate min-w-0 flex-1 overflow-hidden"
              : "relative isolate min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/50 shadow-sm"
          }
        >
          {mapView}
          <MapControls
            isFullscreen
            onRefresh={onRefresh}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={cn(
        "relative isolate h-full w-full overflow-hidden rounded-2xl border border-border/50",
        className,
      )}
      style={{ boxShadow: INLINE_CARD_SHADOW }}
      data-tool-ui-id={id}
      data-slot="poi-map"
    >
      {modalOverlay}
      {mapView}
      <MapControls
        isFullscreen={false}
        onRefresh={onRefresh}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {title && (
        <div className="absolute top-3 left-3 z-1000 rounded-xl bg-background/90 px-3.5 py-2 backdrop-blur-md">
          <span className="font-medium text-sm">{title}</span>
        </div>
      )}

      <div className="absolute right-3 bottom-3 left-3 z-1000">
        <POIListInline
          pois={filteredPois}
          selectedPoiId={selectedPoiId}
          favoriteIds={favoriteIds}
          onSelectPoi={handleSelectPoiInline}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </div>
  );
}
