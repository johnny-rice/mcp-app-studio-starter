"use client";

import { Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "./_adapter";

const MAP_CONTROL_BUTTON_CLASS =
  "size-10 rounded-full bg-background/90 backdrop-blur-md transition-all hover:bg-background active:scale-95";

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
    <div className="absolute top-3 right-3 z-1000 flex gap-1.5">
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
          <TooltipContent className="z-1001">Refresh locations</TooltipContent>
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
        <TooltipContent className="z-1001">
          {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
