"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  AlertTriangle,
  Layers,
  type LucideIcon,
  MapPin,
  Maximize2,
  MessageSquare,
  Monitor,
  Moon,
  MoreHorizontal,
  MoveHorizontal,
  PictureInPicture2,
  Zap,
  Smartphone,
  Square,
  Sun,
  Tablet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/ui/cn";
import {
  useConversationMode,
  useDeviceType,
  useDisplayMode,
  useHmrPreview as useIsHmrPreviewEnabled,
  useSelectedComponent,
  useWorkbenchStore,
  useWorkbenchTheme,
} from "@/lib/workbench/store";
import {
  type DeviceType,
  type DisplayMode,
  LOCALE_OPTIONS,
  type UserLocation,
} from "@/lib/workbench/types";
import { SafeAreaInsetsControl } from "./safe-area-insets-control";
import {
  ADDON_CLASSES,
  INPUT_CLASSES,
  INPUT_GROUP_CLASSES,
  LABEL_CLASSES,
  SELECT_CLASSES,
  TOGGLE_BUTTON_ACTIVE_CLASSES,
  TOGGLE_BUTTON_CLASSES,
} from "./styles";

const DISPLAY_MODES: ReadonlyArray<{
  id: DisplayMode;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "inline", label: "Inline", icon: Square },
  { id: "pip", label: "PiP", icon: PictureInPicture2 },
  { id: "fullscreen", label: "Fullscreen", icon: Maximize2 },
];

const DEVICE_TYPES: ReadonlyArray<{
  id: DeviceType;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "resizable", label: "Resizable", icon: MoveHorizontal },
];

const LOCATION_PRESETS: ReadonlyArray<{
  id: string;
  label: string;
  location: UserLocation | null;
}> = [
  { id: "none", label: "None", location: null },
  {
    id: "sf",
    label: "San Francisco",
    location: {
      city: "San Francisco",
      region: "California",
      country: "US",
      timezone: "America/Los_Angeles",
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  {
    id: "nyc",
    label: "New York",
    location: {
      city: "New York",
      region: "New York",
      country: "US",
      timezone: "America/New_York",
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  {
    id: "london",
    label: "London",
    location: {
      city: "London",
      region: "England",
      country: "GB",
      timezone: "Europe/London",
      latitude: 51.5074,
      longitude: -0.1278,
    },
  },
  {
    id: "tokyo",
    label: "Tokyo",
    location: {
      city: "Tokyo",
      region: "Tokyo",
      country: "JP",
      timezone: "Asia/Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
    },
  },
];

interface ThemeDiagnosticsItem {
  filePath: string;
  diagnostics: Array<{
    line: number;
    message: string;
    suggestion: string;
  }>;
}

interface ThemeDiagnosticsResponse {
  count: number;
  files: ThemeDiagnosticsItem[];
  tips: string[];
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

interface SettingRowProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function SettingRow({ label, htmlFor, children }: SettingRowProps) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-4">
      <Label htmlFor={htmlFor} className={`${LABEL_CLASSES} shrink-0`}>
        {label}
      </Label>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function AdvancedSettingsPopover() {
  const displayMode = useDisplayMode();

  const {
    locale,
    maxHeight,
    safeAreaInsets,
    view,
    userLocation,
    setLocale,
    setMaxHeight,
    setSafeAreaInsets,
    setView,
    setUserLocation,
  } = useWorkbenchStore(
    useShallow((s) => ({
      locale: s.locale,
      maxHeight: s.maxHeight,
      safeAreaInsets: s.safeAreaInsets,
      view: s.view,
      userLocation: s.userLocation,
      setLocale: s.setLocale,
      setMaxHeight: s.setMaxHeight,
      setSafeAreaInsets: s.setSafeAreaInsets,
      setView: s.setView,
      setUserLocation: s.setUserLocation,
    })),
  );

  return (
    <Popover>
      <TooltipPrimitive.Root delayDuration={500}>
        <TooltipPrimitive.Trigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipPrimitive.Trigger>
        <TooltipContent side="top">More options</TooltipContent>
      </TooltipPrimitive.Root>
      <PopoverContent align="end" className="w-72 space-y-1 pr-2">
        <div className="mb-4 font-medium text-sm">Environment Options</div>

        {view && (
          <SettingRow label="View">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
                <Layers className="size-3" />
                {view.mode}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="size-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setView(null)}
                title="Dismiss view"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </SettingRow>
        )}

        {displayMode === "inline" && (
          <SettingRow label="Max height" htmlFor="max-height">
            <InputGroup className={INPUT_GROUP_CLASSES}>
              <InputGroupInput
                id="max-height"
                type="number"
                value={maxHeight}
                onChange={(e) => {
                  const clamped = clamp(Number(e.target.value), 100, 2000);
                  setMaxHeight(clamped);
                }}
                min={100}
                max={2000}
                className={INPUT_CLASSES}
              />
              <InputGroupAddon align="inline-end" className={ADDON_CLASSES}>
                px
              </InputGroupAddon>
            </InputGroup>
          </SettingRow>
        )}

        {displayMode === "fullscreen" && (
          <SettingRow label="Safe area">
            <SafeAreaInsetsControl
              value={safeAreaInsets}
              onChange={setSafeAreaInsets}
            />
          </SettingRow>
        )}

        <SettingRow label="Locale">
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className={SELECT_CLASSES}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow label="Location">
          <div className="flex items-center gap-2">
            <Select
              value={
                LOCATION_PRESETS.find(
                  (p) =>
                    p.location?.city === userLocation?.city &&
                    p.location?.country === userLocation?.country,
                )?.id ?? "none"
              }
              onValueChange={(id) => {
                const preset = LOCATION_PRESETS.find((p) => p.id === id);
                setUserLocation(preset?.location ?? null);
              }}
            >
              <SelectTrigger className={SELECT_CLASSES}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_PRESETS.map((preset) => (
                  <SelectItem
                    key={preset.id}
                    value={preset.id}
                    className="text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {preset.location && <MapPin className="size-3" />}
                      {preset.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userLocation && (
              <Button
                variant="ghost"
                size="sm"
                className="size-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setUserLocation(null)}
                title="Clear location"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </SettingRow>
      </PopoverContent>
    </Popover>
  );
}

export function PreviewToolbar() {
  const displayMode = useDisplayMode();
  const theme = useWorkbenchTheme();
  const [mounted, setMounted] = useState(false);
  const deviceType = useDeviceType();
  const conversationMode = useConversationMode();
  const isHmrPreviewEnabled = useIsHmrPreviewEnabled();
  const selectedComponent = useSelectedComponent();
  const [themeDiagnostics, setThemeDiagnostics] = useState<ThemeDiagnosticsResponse>({
    count: 0,
    files: [],
    tips: [],
  });
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);

  const {
    setDisplayMode,
    setDeviceType,
    setPreviewTheme: setWorkbenchTheme,
    setConversationMode,
    setUseHmrPreview,
  } = useWorkbenchStore(
    useShallow((s) => ({
      setDisplayMode: s.setDisplayMode,
      setDeviceType: s.setDeviceType,
      setPreviewTheme: s.setPreviewTheme,
      setConversationMode: s.setConversationMode,
      setUseHmrPreview: s.setUseHmrPreview,
    })),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const controller = new AbortController();
    setDiagnosticsError(null);

    async function loadDiagnostics() {
      try {
        const response = await fetch(
          `/api/workbench/theme-diagnostics?id=${encodeURIComponent(selectedComponent)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const next = (await response.json()) as ThemeDiagnosticsResponse;
        setThemeDiagnostics(next);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setDiagnosticsError(
          error instanceof Error ? error.message : "Failed to load diagnostics",
        );
      }
    }

    void loadDiagnostics();
    return () => controller.abort();
  }, [selectedComponent]);

  const isDark = mounted && theme === "dark";

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b bg-neutral-100 px-4 dark:bg-neutral-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="cursor-default select-none text-muted-foreground/60 text-xs">
              Device
            </span>
            <ButtonGroup>
              {DEVICE_TYPES.map(({ id, label, icon: Icon }) => (
                <TooltipPrimitive.Root key={id}>
                  <TooltipPrimitive.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "size-7 p-0",
                        deviceType === id
                          ? TOGGLE_BUTTON_ACTIVE_CLASSES
                          : TOGGLE_BUTTON_CLASSES,
                      )}
                      onClick={() => setDeviceType(id)}
                    >
                      <Icon className="size-3.5" />
                    </Button>
                  </TooltipPrimitive.Trigger>
                  <TooltipContent side="top">{label}</TooltipContent>
                </TooltipPrimitive.Root>
              ))}
            </ButtonGroup>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="cursor-default select-none text-muted-foreground/60 text-xs">
              Mode
            </span>
            <ButtonGroup>
              {DISPLAY_MODES.map(({ id, label, icon: Icon }) => (
                <TooltipPrimitive.Root key={id}>
                  <TooltipPrimitive.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "size-7 p-0",
                        displayMode === id
                          ? TOGGLE_BUTTON_ACTIVE_CLASSES
                          : TOGGLE_BUTTON_CLASSES,
                      )}
                      onClick={() => setDisplayMode(id)}
                    >
                      <Icon className="size-3.5" />
                    </Button>
                  </TooltipPrimitive.Trigger>
                  <TooltipContent side="top">{label}</TooltipContent>
                </TooltipPrimitive.Root>
              ))}
            </ButtonGroup>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={displayMode !== "inline"}
                className={cn(
                  "size-7",
                  displayMode !== "inline"
                    ? "cursor-not-allowed text-muted-foreground/40"
                    : conversationMode
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setConversationMode(!conversationMode)}
              >
                <MessageSquare className="size-4" />
              </Button>
            </TooltipPrimitive.Trigger>
            <TooltipContent side="top">
              {displayMode !== "inline"
                ? "Conversation Mode (inline only)"
                : "Conversation Mode"}
            </TooltipContent>
          </TooltipPrimitive.Root>

          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative size-7 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const nextTheme = isDark ? "light" : "dark";
                  setWorkbenchTheme(nextTheme);
                }}
              >
                <Sun
                  className={cn(
                    "size-4 transition-all",
                    isDark ? "rotate-90 scale-0" : "rotate-0 scale-100",
                  )}
                />
                <Moon
                  className={cn(
                    "absolute size-4 transition-all",
                    isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0",
                  )}
                />
              </Button>
            </TooltipPrimitive.Trigger>
            <TooltipContent side="top">Toggle theme</TooltipContent>
          </TooltipPrimitive.Root>

          {process.env.NODE_ENV === "development" && (
            <Popover>
              <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "relative size-7",
                        themeDiagnostics.count > 0
                          ? "text-amber-500 hover:text-amber-400"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <AlertTriangle className="size-4" />
                      {themeDiagnostics.count > 0 && (
                        <span className="-top-0.5 -right-0.5 absolute min-w-4 rounded-full bg-amber-500 px-1 text-[10px] leading-4 text-black">
                          {themeDiagnostics.count > 9
                            ? "9+"
                            : String(themeDiagnostics.count)}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipPrimitive.Trigger>
                <TooltipContent side="top">Theme diagnostics (non-blocking)</TooltipContent>
              </TooltipPrimitive.Root>
              <PopoverContent align="end" className="w-96 space-y-3">
                <div className="font-medium text-sm">Theme Diagnostics</div>
                {diagnosticsError ? (
                  <div className="text-destructive text-xs">
                    Failed to load diagnostics: {diagnosticsError}
                  </div>
                ) : themeDiagnostics.count === 0 ? (
                  <div className="text-muted-foreground text-xs">
                    No obvious theme risks detected for this component.
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 space-y-2 overflow-auto pr-1">
                      {themeDiagnostics.files.map((file) => (
                        <div key={file.filePath} className="rounded-md border p-2">
                          <div className="truncate font-mono text-[11px] text-muted-foreground">
                            {file.filePath}
                          </div>
                          <div className="mt-1 space-y-1">
                            {file.diagnostics.slice(0, 3).map((diag, index) => (
                              <div key={`${diag.line}-${index}`} className="text-xs">
                                <div className="text-foreground">
                                  L{diag.line}: {diag.message}
                                </div>
                                <div className="text-muted-foreground">
                                  {diag.suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1 border-t pt-2">
                      {themeDiagnostics.tips.map((tip) => (
                        <div key={tip} className="text-muted-foreground text-xs">
                          - {tip}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          )}

          {process.env.NODE_ENV === "development" && (
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-7",
                    isHmrPreviewEnabled
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setUseHmrPreview(!isHmrPreviewEnabled)}
                >
                  <Zap className="size-4" />
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="top">
                {isHmrPreviewEnabled ? "HMR Preview On" : "HMR Preview Off"}
              </TooltipContent>
            </TooltipPrimitive.Root>
          )}

          <AdvancedSettingsPopover />
        </div>
      </div>
    </TooltipProvider>
  );
}
