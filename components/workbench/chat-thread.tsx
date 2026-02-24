"use client";

import { MapPin, MessageCircle } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { workbenchComponents } from "@/lib/workbench/component-registry";
import type { ConversationContext } from "@/lib/workbench/mock-config";
import {
  useConversationMode,
  useDeviceType,
  useDisplayMode,
  useSelectedComponent,
  useWorkbenchStore,
} from "@/lib/workbench/store";
import { MorphContainer } from "./component-renderer";

interface MockMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MOCK_MESSAGES: MockMessage[] = [
  { id: "1", role: "user", content: "Can you help me with this?" },
  {
    id: "2",
    role: "assistant",
    content: "Of course! I've prepared something for you. Take a look at the interactive view above.",
  },
];

const MOCK_MESSAGES_AFTER: MockMessage[] = [
  { id: "3", role: "user", content: "That looks great, thanks!" },
  {
    id: "4",
    role: "assistant",
    content: "You're welcome! Let me know if you need anything else or want to make changes.",
  },
];

function MessageBubble({
  role,
  content,
  isDark,
}: {
  role: "user" | "assistant";
  content: string;
  isDark: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
            : isDark ? "bg-neutral-800 text-neutral-100" : "bg-neutral-100 text-neutral-900",
        )}
      >
        {content}
      </div>
    </div>
  );
}

function MessageList({ messages, isDark }: { messages: MockMessage[]; isDark: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} isDark={isDark} />
      ))}
    </div>
  );
}

function AppIndicator({ appId, isDark }: { appId: string; isDark: boolean }) {
  const component = workbenchComponents.find((c) => c.id === appId);
  const appName = component?.label ?? appId;
  const iconMap: Record<string, typeof MapPin> = { "poi-map": MapPin, welcome: MessageCircle };
  const Icon = iconMap[appId] || MessageCircle;

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2">
        <div className={cn("flex size-6 items-center justify-center rounded-full", isDark ? "bg-amber-600" : "bg-amber-500")}>
          <Icon className="size-3 text-white" />
        </div>
        <span className={cn("font-medium text-sm", isDark ? "text-neutral-200" : "text-neutral-700")}>
          {appName}
        </span>
      </div>
    </div>
  );
}

function getDefaultUserMessage(appId: string): string {
  const messages: Record<string, string> = {
    "poi-map": "Can you show me some interesting places to visit in San Francisco?",
    welcome: "What can this app do?",
    chart: "Show me a chart of the data",
    form: "Help me fill out this form",
  };
  return messages[appId] ?? "Can you help me with this?";
}

function getDefaultAssistantResponse(appId: string): string {
  const responses: Record<string, string> = {
    "poi-map": "Here's an interactive map with some great spots to check out. Tap any location for more details!",
    welcome: "I'd be happy to show you around! This is an interactive app that demonstrates the MCP Apps SDK.",
  };
  return responses[appId] ?? "Here's what I found. Let me know if you need anything else!";
}

interface ChatThreadProps {
  children: ReactNode;
  className?: string;
}

export function ChatThread({ children, className }: ChatThreadProps) {
  const displayMode = useDisplayMode();
  const theme = useWorkbenchStore((s) => s.previewTheme);
  const deviceType = useDeviceType();
  const conversationMode = useConversationMode();
  const maxHeight = useWorkbenchStore((s) => s.maxHeight);
  const intrinsicHeight = useWorkbenchStore((s) => s.intrinsicHeight);
  const selectedComponent = useSelectedComponent();
  const mockConfig = useWorkbenchStore((s) => s.mockConfig);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const effectiveIsDark = mounted && theme === "dark";
  const scrollRef = useRef<HTMLDivElement>(null);

  const widgetHeight = intrinsicHeight !== null ? Math.min(Math.max(intrinsicHeight, 0), maxHeight) : maxHeight;
  const isDesktopDevice = deviceType === "desktop";

  useEffect(() => {
    if (scrollRef.current && displayMode === "pip") {
      scrollRef.current.scrollTop = 0;
    }
  }, [displayMode]);

  useEffect(() => {
    if (displayMode === "fullscreen") {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      if (window.parent !== window) {
        const targetOrigin = document.referrer ? new URL(document.referrer).origin : window.location.origin;
        window.parent.postMessage({ type: "workbench:fullscreen", value: true }, targetOrigin);
      }

      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";

        if (window.parent !== window) {
          const targetOrigin = document.referrer ? new URL(document.referrer).origin : window.location.origin;
          window.parent.postMessage({ type: "workbench:fullscreen", value: false }, targetOrigin);
        }
      };
    }
  }, [displayMode]);

  const component = workbenchComponents.find((c) => c.id === selectedComponent);
  const appId = component?.id ?? "app";
  const toolConfig = mockConfig.tools[appId];
  const activeVariant = toolConfig?.variants.find((v) => v.id === toolConfig.activeVariantId);
  const conversation: ConversationContext | undefined = activeVariant?.conversation;

  const userMessage = conversation?.userMessage ?? getDefaultUserMessage(appId);
  const assistantResponse = conversation?.assistantResponse ?? getDefaultAssistantResponse(appId);

  // Derive styles based on current mode
  const isFullscreen = displayMode === "fullscreen";
  const isPip = displayMode === "pip";
  const isIsolated = !conversationMode && !isFullscreen && !isPip;

  let morphWrapperClasses = "";
  let morphContainerClasses = "";
  let morphContainerStyle: React.CSSProperties = {};

  if (isFullscreen) {
    morphWrapperClasses = "flex-1 w-full h-full shrink-0";
    morphContainerClasses = cn("h-full w-full overflow-auto transition-colors", effectiveIsDark ? "bg-neutral-900" : "bg-white");
    morphContainerStyle = { overscrollBehavior: "contain" };
  } else if (isPip) {
    morphWrapperClasses = "sticky top-3 z-10 flex justify-center w-full px-3 pointer-events-none shrink-0";
    morphContainerClasses = cn(
      "pointer-events-auto w-full max-w-[770px] overflow-hidden rounded-2xl border shadow-lg transition-colors",
      effectiveIsDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white"
    );
    morphContainerStyle = { height: widgetHeight, maxHeight: widgetHeight };
  } else if (conversationMode) {
    morphWrapperClasses = cn(
      "w-full z-10 flex justify-center shrink-0"
    );
    morphContainerClasses = cn(
      "w-full max-w-[770px] overflow-hidden rounded-2xl border shadow-sm transition-colors",
      effectiveIsDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white",
      "border-solid border"
    );
    morphContainerStyle = { height: widgetHeight, maxHeight: widgetHeight };
  } else {
    // Isolated
    morphWrapperClasses = cn(
      "relative z-10 flex h-full w-full flex-col overflow-hidden transition-colors shrink-0",
      isDesktopDevice ? "items-center justify-center" : "items-center justify-center px-4"
    );
    morphContainerClasses = cn(
      "overflow-hidden transition-colors",
      isDesktopDevice
        ? "h-full w-full max-w-[770px] border shadow-sm rounded-2xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
        : cn(
            "w-full max-w-[770px] rounded-2xl border shadow-sm",
            effectiveIsDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white"
          )
    );
    morphContainerStyle = isDesktopDevice ? { maxHeight: widgetHeight } : { height: widgetHeight, maxHeight: widgetHeight };
  }

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden transition-colors",
        className
      )}
    >
      <div
        ref={scrollRef}
        className={cn(
          "h-full w-full relative",
          isFullscreen || isIsolated ? "overflow-hidden" : "overflow-y-auto scrollbar-subtle"
        )}
      >
        <div
          className={cn(
            "mx-auto flex flex-col w-full",
            isFullscreen ? "h-full max-w-none" : "max-w-[770px]",
            isIsolated ? "h-full" : isFullscreen ? "" : "p-4 pb-24 gap-4",
            isPip ? "gap-3 pt-3" : ""
          )}
        >
          {conversationMode && !isPip && !isFullscreen && (
            <>
              <MessageBubble role="user" content={userMessage} isDark={effectiveIsDark} />
              <AppIndicator appId={appId} isDark={effectiveIsDark} />
            </>
          )}

          <div className={morphWrapperClasses}>
            <MorphContainer
              data-theme={mounted ? theme : "light"}
              className={morphContainerClasses}
              style={morphContainerStyle}
            >
              <div className={isFullscreen ? "h-full" : "h-full overflow-auto"}>
                {children}
              </div>
            </MorphContainer>
          </div>

          {conversationMode && !isPip && !isFullscreen && (
            <MessageBubble role="assistant" content={assistantResponse} isDark={effectiveIsDark} />
          )}

          {isPip && (
            <div className="flex flex-col gap-3">
              <MessageList messages={MOCK_MESSAGES} isDark={effectiveIsDark} />
              <MessageList messages={MOCK_MESSAGES_AFTER} isDark={effectiveIsDark} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
