import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type POIMapViewState,
} from "@/components/examples/poi-map";

export const DEFAULT_WIDGET_STATE: POIMapViewState = {
  selectedPoiId: null,
  favoriteIds: [],
  mapCenter: DEFAULT_CENTER,
  mapZoom: DEFAULT_ZOOM,
  categoryFilter: null,
};

export function mergePOIMapWidgetState(
  derivedDefaults: POIMapViewState,
  state: Partial<POIMapViewState> | null | undefined,
): POIMapViewState {
  if (!state) {
    return derivedDefaults;
  }

  return {
    selectedPoiId: state.selectedPoiId ?? derivedDefaults.selectedPoiId,
    favoriteIds: state.favoriteIds ?? derivedDefaults.favoriteIds,
    mapCenter: state.mapCenter ?? derivedDefaults.mapCenter,
    mapZoom: state.mapZoom ?? derivedDefaults.mapZoom,
    categoryFilter: state.categoryFilter ?? derivedDefaults.categoryFilter,
  };
}
