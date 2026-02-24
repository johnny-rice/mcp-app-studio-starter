"use client";

import {
  Coffee,
  ExternalLink,
  Heart,
  Landmark,
  MapPin,
  MessageCircle,
  Mountain,
  ShoppingBag,
  Star,
  Ticket,
  Train,
  Trees,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Badge, Button, cn } from "./_adapter";
import type { POI, POICategory } from "./schema";
import { CATEGORY_LABELS } from "./schema";

const MODAL_SHADOW = [
  "0 0 0 1px rgba(0, 0, 0, 0.03)",
  "0 2px 4px rgba(0, 0, 0, 0.04)",
  "0 8px 16px rgba(0, 0, 0, 0.06)",
  "0 24px 48px rgba(0, 0, 0, 0.12)",
].join(", ");

const CATEGORY_ICONS: Record<POICategory, typeof MapPin> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  museum: Landmark,
  park: Trees,
  shopping: ShoppingBag,
  entertainment: Ticket,
  landmark: Mountain,
  transit: Train,
  other: MapPin,
};

interface ModalOverlayProps {
  poi: POI;
  favoriteIds: Set<string>;
  onDismissModal?: () => void;
  onToggleFavorite: (poiId: string) => void;
  onOpenExternal?: (url: string) => void;
  onSendFollowUpMessage?: (prompt: string) => void;
}

export function ModalOverlay({
  poi,
  favoriteIds,
  onDismissModal,
  onToggleFavorite,
  onOpenExternal,
  onSendFollowUpMessage,
}: ModalOverlayProps) {
  const CategoryIcon = CATEGORY_ICONS[poi.category];
  const isFavorite = favoriteIds.has(poi.id);

  return (
    <div className="absolute inset-0 z-1100 flex items-end justify-center p-4 sm:items-center sm:p-6">
      <div
        className="fade-in absolute inset-0 animate-in bg-black/50 backdrop-blur-[2px] duration-200"
        onClick={onDismissModal}
        aria-hidden="true"
      />
      <div
        className="fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 relative z-10 flex max-h-[85vh] w-full max-w-sm animate-in flex-col overflow-hidden rounded-2xl bg-card shadow-2xl duration-300 ease-out sm:max-h-full"
        style={{ boxShadow: MODAL_SHADOW }}
      >
        <button
          onClick={onDismissModal}
          className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full border bg-background/90 shadow-sm backdrop-blur-md transition-all duration-150 hover:bg-background active:scale-95"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {poi.imageUrl && (
          <div className="relative h-48 shrink-0 overflow-hidden">
            <img
              src={poi.imageUrl}
              alt={poi.name}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-card/80 to-transparent" />
          </div>
        )}

        <div className="scrollbar-subtle flex flex-col gap-3.5 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-lg leading-snug tracking-tight">
                {poi.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <CategoryIcon className="size-3" />
                  {CATEGORY_LABELS[poi.category]}
                </Badge>
                {poi.rating !== undefined && (
                  <Badge variant="outline" className="gap-1.5 text-xs">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {poi.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-full"
              onClick={() => onToggleFavorite(poi.id)}
            >
              <Heart
                className={cn(
                  "size-5 transition-all duration-200",
                  isFavorite
                    ? "scale-110 fill-rose-500 text-rose-500"
                    : "text-muted-foreground hover:text-rose-500",
                )}
              />
            </Button>
          </div>

          {poi.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {poi.description}
            </p>
          )}

          {poi.address && (
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="leading-snug">{poi.address}</span>
            </div>
          )}

          {poi.tags && poi.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {poi.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-col gap-2.5">
            <Button
              variant="outline"
              className="h-11 w-full gap-2"
              onClick={() => {
                const url = `https://maps.google.com/?q=${poi.lat},${poi.lng}`;
                if (onOpenExternal) {
                  onOpenExternal(url);
                } else {
                  window.open(url, "_blank");
                }
              }}
            >
              <ExternalLink className="size-4" />
              Open in Google Maps
            </Button>
            {onSendFollowUpMessage && (
              <Button
                variant="secondary"
                className="h-11 w-full gap-2"
                onClick={() =>
                  onSendFollowUpMessage(
                    `Tell me more about ${poi.name} in ${poi.address || "this location"}`,
                  )
                }
              >
                <MessageCircle className="size-4" />
                Ask about this place
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
