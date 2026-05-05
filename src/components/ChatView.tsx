"use client";

import { useState, useCallback, useEffect } from "react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
} from "@/components/nexus-ui/prompt-input";
import {
  Message,
  MessageContent,
  MessageMarkdown,
  MessageAvatar,
  MessageStack,
} from "@/components/nexus-ui/message";
import {
  Thread,
  ThreadContent,
  ThreadScrollToBottom,
} from "@/components/nexus-ui/thread";
import {
  Suggestions,
  SuggestionList,
  Suggestion,
} from "@/components/nexus-ui/suggestions";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import {
  Attachments,
  AttachmentTrigger,
  AttachmentList,
  Attachment,
  AttachmentRemove,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentProperty,
  type AttachmentMeta,
} from "@/components/nexus-ui/attachments";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/nexus-ui/reasoning";
import {
  Citation,
  CitationCarousel,
  CitationCarouselContent,
  CitationCarouselHeader,
  CitationCarouselIndex,
  CitationCarouselItem,
  CitationCarouselNext,
  CitationCarouselPagination,
  CitationCarouselPrev,
  CitationContent,
  CitationItem,
  CitationSourcesBadge,
  CitationTrigger,
  type CitationSourceInput,
} from "@/components/nexus-ui/citation";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorItemTitle,
  ModelSelectorItemDescription,
} from "@/components/nexus-ui/model-selector";
import { Button } from "@/components/ui/button";
import { ArrowUp, Paperclip } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { File02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  citations?: CitationSourceInput[];
  model?: string;
  rationale?: string;
  attachments?: string[];
};

const SUGGESTIONS = [
  "Explain quantum computing simply",
  "Write a haiku about code",
  "What makes a great startup idea?",
  "Compare React and Vue in 2026",
];

const MODEL_ITEMS = [
  { value: "omnimind-1", title: "OmniMind-1", description: "Unified model — maximum capacity" },
  { value: "omnimind-1-turbo", title: "OmniMind-1 Turbo", description: "Faster responses, same intelligence" },
  { value: "omnimind-1-vision", title: "OmniMind-1 Vision", description: "Image understanding + generation" },
];

function normalizeDeltaText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeDeltaText).join("");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.text === "string") {
      return record.text;
    }

    if (typeof record.content === "string") {
      return record.content;
    }
  }

  return "";
}

export function ChatView() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [selectedModel, setSelectedModel] = useState("omnimind-1");
  const [activeRationale, setActiveRationale] = useState<{ model: string, text: string } | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if ((!text.trim() && attachments.length === 0) || isLoading) return;

      // 1. Capture current attachments before clearing
      const attachmentData = await Promise.all(
        attachments.map(async (a) => {
          if (!a.url) return null;
          try {
            const resp = await fetch(a.url);
            const blob = await resp.blob();
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            return null;
          }
        })
      );

      const validAttachments = attachmentData.filter(Boolean) as string[];

      const userMsg: Msg = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        attachments: validAttachments,
      };

      const assistantId = crypto.randomUUID();
      const assistantMsg: Msg = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      const outgoingMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setAttachments([]); // Clear from input immediately
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: outgoingMessages,
            model: selectedModel,
            attachments: validAttachments,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(errText || `Request failed (${response.status})`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const applyDelta = (delta: any) => {
          const deltaText = normalizeDeltaText(delta?.text ?? delta?.content);
          const hasVisibleDelta =
            Boolean(deltaText) ||
            Boolean(delta?.reasoning) ||
            Boolean(delta?.model) ||
            Boolean(delta?.rationale) ||
            Boolean(delta?.citations);

          if (!hasVisibleDelta) return;

          setIsLoading(false);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: m.content + deltaText,
                    model: delta.model || m.model,
                    reasoning: delta.reasoning || m.reasoning,
                    rationale: delta.rationale || m.rationale,
                    citations: delta.citations || m.citations,
                  }
                : m
            )
          );
        };

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const delta = JSON.parse(line);
                applyDelta(delta);
              } catch (e) {
                // skip error
              }
            }
          }

          if (buffer.trim()) {
            try {
              const delta = JSON.parse(buffer);
              applyDelta(delta);
            } catch (e) {
              // skip error
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Sorry, I encountered an error while orchestrating your request.",
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, selectedModel, attachments]
  );

  const handleSubmit = () => {
    sendMessage(input);
  };

  return (
    <div className="relative z-10 flex flex-col h-[calc(100vh-88px)] min-h-[calc(100vh-88px)] [@supports(height:100dvh)]:h-[calc(100dvh-88px)] [@supports(height:100dvh)]:min-h-[calc(100dvh-88px)] max-w-3xl mx-auto px-4 animate-fade-in-up">
      {messages.length === 0 && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl text-hero-text mb-3" style={{ fontFamily: "var(--font-display)" }}>What's on your mind?</h2>
            <p className="text-sm text-hero-muted">OmniMind-1 is ready. Ask anything.</p>
          </div>
          <Suggestions onSelect={(q: string) => sendMessage(q)}>
            <SuggestionList orientation="horizontal" className="flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <Suggestion key={s} value={s} variant="outline" className="text-hero-muted border-border hover:text-hero-text">{s}</Suggestion>
              ))}
            </SuggestionList>
          </Suggestions>
        </div>
      ) : (
        <Thread className="flex-1 min-h-0 no-scrollbar [&_*]:!scrollbar-none">
          <ThreadContent className="py-8 space-y-1">
            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageStack>
                  {m.role === "assistant" && m.reasoning && (
                    <Reasoning>
                      <ReasoningTrigger className="text-hero-muted text-xs hover:text-hero-text" />
                      <ReasoningContent className="text-hero-muted/80 text-xs leading-relaxed">{m.reasoning}</ReasoningContent>
                    </Reasoning>
                  )}
                  <MessageContent>
                    <div className="flex flex-col gap-3">
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {m.attachments.map((url, i) => {
                            const isImage = url.startsWith('data:image/');
                            return (
                              <div key={i} className={cn(
                                "relative rounded-xl overflow-hidden border border-white/10 shadow-lg group bg-black/20",
                                isImage ? "size-32" : "w-48 h-16 px-3 flex items-center gap-3"
                              )}>
                                {isImage ? (
                                  <img src={url} alt="attachment" className="size-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                  <>
                                    <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center">
                                      <HugeiconsIcon icon={File02Icon} className="size-5 text-hero-muted" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[11px] font-bold text-hero-text truncate">Document</span>
                                      <span className="text-[9px] text-hero-muted uppercase tracking-wider font-mono">Attachment</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <MessageMarkdown>{m.content}</MessageMarkdown>
                    </div>
                  </MessageContent>
                  
                  {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                    <div className="mt-4">
                      <Citation citations={m.citations}>
                        <CitationTrigger />
                        <CitationContent>
                          <CitationCarousel>
                            <CitationCarouselHeader>
                              <CitationSourcesBadge />
                              <CitationCarouselPagination>
                                <CitationCarouselPrev />
                                <CitationCarouselIndex />
                                <CitationCarouselNext />
                              </CitationCarouselPagination>
                            </CitationCarouselHeader>

                            <CitationCarouselContent>
                              {m.citations.map((_, index) => (
                                <CitationCarouselItem key={index} index={index}>
                                  <CitationItem className="hover:bg-transparent" />
                                </CitationCarouselItem>
                              ))}
                            </CitationCarouselContent>
                          </CitationCarousel>
                        </CitationContent>
                      </Citation>
                    </div>
                  )}

                  {m.role === "assistant" && (
                    <div className="mt-2 flex h-4 items-center gap-2 px-1 transition-opacity duration-500">
                      {m.model && (
                        <button 
                          onClick={() => setActiveRationale({ model: m.model!, text: m.rationale || "Selected by intent analysis." })}
                          className="flex items-center gap-2 hover:opacity-100 transition-opacity"
                        >
                          <div className="size-1 rounded-full bg-hero-text/30 animate-pulse" />
                          <TextShimmer className="text-[9px] font-bold text-hero-muted uppercase tracking-[0.2em] opacity-40 hover:opacity-80 transition-opacity">
                            {m.model}
                          </TextShimmer>
                        </button>
                      )}
                    </div>
                  )}
                </MessageStack>
              </Message>
            ))}
            {isLoading && (
              <Message from="assistant">
                <MessageStack>
                  <MessageContent>
                    <TextShimmer className="text-sm text-hero-muted">OmniMind is thinking...</TextShimmer>
                  </MessageContent>
                </MessageStack>
              </Message>
            )}
          </ThreadContent>
          <ThreadScrollToBottom />
        </Thread>
      )}

      <div className="pt-2" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <Attachments attachments={attachments} onAttachmentsChange={setAttachments} accept="image/*,.pdf,.txt,.md,.csv">
          {attachments.length > 0 && (
            <AttachmentList className="mb-3 flex gap-2 flex-wrap">
              {attachments.map((a) => (
                <Attachment
                  key={a.name}
                  attachment={a}
                  variant="detailed"
                  onRemove={() => setAttachments((prev) => prev.filter((f) => f !== a))}
                >
                  <AttachmentRemove className="text-hero-muted hover:text-hero-text" />
                  <div className="flex items-center gap-2">
                    <AttachmentPreview className="size-10 rounded-lg overflow-hidden" />
                    <AttachmentInfo className="text-[10px] text-hero-muted font-medium">
                      <AttachmentProperty as="name" className="truncate max-w-[120px]" />
                      <AttachmentProperty as="size" className="opacity-50" />
                    </AttachmentInfo>
                  </div>
                </Attachment>
              ))}
            </AttachmentList>
          )}

          <PromptInput className="liquid-glass rounded-2xl border-0">
            <PromptInputTextarea
              placeholder={`Message ${MODEL_ITEMS.find(m => m.value === selectedModel)?.title ?? "OmniMind"}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              className="text-hero-text placeholder:text-muted-foreground bg-transparent border-0 focus-visible:ring-0"
            />
            <PromptInputActions>
              <PromptInputActionGroup>
                <AttachmentTrigger asChild>
                  <PromptInputAction asChild>
                    <Button size="icon" variant="ghost" className="rounded-full text-hero-muted hover:text-hero-text hover:bg-secondary/50">
                      <Paperclip className="size-4" />
                    </Button>
                  </PromptInputAction>
                </AttachmentTrigger>
              </PromptInputActionGroup>
              <PromptInputActionGroup>
                <PromptInputAction asChild>
                  <Button size="icon" className="rounded-full bg-hero-text text-background hover:bg-hero-muted" disabled={(!input.trim() && attachments.length === 0) || isLoading} onClick={handleSubmit}>
                    <ArrowUp className="size-4" />
                  </Button>
                </PromptInputAction>
              </PromptInputActionGroup>
            </PromptInputActions>
          </PromptInput>
        </Attachments>

        <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
          <ModelSelector value={selectedModel} onValueChange={setSelectedModel} items={MODEL_ITEMS.map((m) => ({ value: m.value, title: m.title, description: m.description }))}>
            <ModelSelectorTrigger className="liquid-glass rounded-full px-4 py-2 text-[14px] text-hero-muted hover:text-hero-text border-0 h-auto sm:px-3 sm:py-1.5 sm:text-xs" />
            <ModelSelectorContent className="bg-background/95 backdrop-blur-xl border-border">
              <ModelSelectorGroup>
                <ModelSelectorLabel className="text-hero-muted">Models</ModelSelectorLabel>
                <ModelSelectorRadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                  {MODEL_ITEMS.map((m) => (
                    <ModelSelectorRadioItem key={m.value} value={m.value} className="text-hero-text focus:bg-secondary" title={m.title} description={m.description} />
                  ))}
                </ModelSelectorRadioGroup>
              </ModelSelectorGroup>
            </ModelSelectorContent>
          </ModelSelector>
          <span className="text-[12px] text-hero-muted/60 uppercase tracking-widest sm:text-[10px]">{MODEL_ITEMS.find(m => m.value === selectedModel)?.title} Active</span>
        </div>
      </div>

      {activeRationale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={() => setActiveRationale(null)} />
          <div className="relative liquid-glass p-10 max-w-lg w-full rounded-[2.5rem] border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-hero-muted uppercase tracking-[0.4em]">Specialist Engaged</p>
                <h3 className="text-4xl font-bold text-hero-text tracking-tighter leading-none">{activeRationale.model}</h3>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                 <p className="text-[11px] font-bold text-hero-muted uppercase tracking-[0.4em] mb-4">Brain Router Rationale</p>
                 <p className="text-xl text-hero-text/90 leading-relaxed font-light italic">"{activeRationale.text}"</p>
              </div>
              <Button onClick={() => setActiveRationale(null)} className="w-full h-14 rounded-2xl bg-hero-text text-background font-bold hover:opacity-90 transition-all">Close Insights</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
