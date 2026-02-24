"use client";

import { Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "./_adapter";

const MAP_CONTROL_BUTTON_CLASS =
  "size-10 rounded-full border border-border/70 bg-background/90 shadow-sm backdrop-blur-md transition-transform hover:bg-background active:scale-95";

interface MapControlsProps {
  isFullscreen: boolean;
  onRefresh?: () => void;
  onToggleFullscreen: () => void;
}

export function MapControls({
  isFullscreen,
  onRefresh,
  onToggleFullscreen,
}: MapControlsProps) {
  return (
    <div
      className="absolute top-3 right-3 flex gap-1.5"
      style={{ zIndex: 1000 }}
    >
      {onRefresh && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className={MAP_CONTROL_BUTTON_CLASS}
              onClick={onRefresh}
            >
              <RefreshCw className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent style={{ zIndex: 1001 }}>
            Refresh locations
          </TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={MAP_CONTROL_BUTTON_CLASS}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent style={{ zIndex: 1001 }}>
          {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
