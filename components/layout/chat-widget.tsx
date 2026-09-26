"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/ui/markdown";
import type { ChatMessage } from "@/types/assistant";

const SUGGESTIONS: { label: string; prompt: string }[] = [
  { label: "Pedidos en impresión", prompt: "¿Qué pedidos están en impresión?" },
  { label: "Lotes en cola", prompt: "Muéstrame los lotes en cola." },
  { label: "Modelos disponibles", prompt: "¿Qué modelos tengo disponibles?" },
  { label: "Resumen general", prompt: "Dame un resumen general del sistema." },
];

function MessageBubble({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming: boolean;
}) {
  const isUser = message.role === "user";

  if (!isUser && message.content === "") {
    return (
      <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Pensando…
      </div>
    );
  }

  return (
    <div
      className={
        isUser
          ? "max-w-[85%] self-end rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-sm text-white"
          : "max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
      }
    >
      {isUser ? (
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      ) : (
        <>
          <Markdown content={message.content} />
          {streaming ? (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-zinc-400 align-middle dark:bg-zinc-500" />
          ) : null}
        </>
      )}
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, open, loading]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(text: string) {
    const content = text.trim();

    if (content === "" || loading) {
      return;
    }

    const userMessage: ChatMessage = { role: "user", content };
    const history = [...messages, userMessage];

    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        let message = "No se pudo obtener respuesta del asistente.";

        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) {
            message = data.error;
          }
        } catch {
          // Respuesta sin JSON.
        }

        throw new Error(message);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const parts: string[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        parts.push(decoder.decode(value, { stream: true }));
        const accumulated = parts.join("");

        setMessages((previous) => {
          const next = [...previous];
          next[next.length - 1] = {
            role: "assistant",
            content: accumulated,
          };
          return next;
        });
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }

      setError(
        caught instanceof Error ? caught.message : "Error desconocido",
      );
      setMessages((previous) => {
        const last = previous[previous.length - 1];

        if (last?.role === "assistant" && last.content === "") {
          return previous.slice(0, -1);
        }

        return previous;
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function resetConversation() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setError(null);
    setLoading(false);
  }

  return (
    <div className="fixed right-4 bottom-20 z-40 flex flex-col items-end gap-3 lg:right-6 lg:bottom-6">
      {open ? (
        <div className="flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Bot
                className="size-5 text-brand dark:text-sky-300"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                IA Asistente
              </p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 ? (
                <button
                  type="button"
                  onClick={resetConversation}
                  aria-label="Nueva conversación"
                  className="rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar asistente"
                className="rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="flex min-h-[16rem] max-h-[60vh] flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Pregúntame por tus pedidos, lotes, modelos o estadísticas.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() => send(suggestion.prompt)}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-brand hover:text-brand dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  streaming={
                    loading &&
                    index === messages.length - 1 &&
                    message.role === "assistant"
                  }
                />
              ))
            )}

            {error ? (
              <p className="self-start rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </p>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu pregunta…"
              aria-label="Mensaje para el asistente"
              autoFocus
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || input.trim() === ""}
              aria-label="Enviar mensaje"
              className="size-10 shrink-0 px-0"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </Button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Abrir IA Asistente (DeepSeek)"
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors hover:bg-brand-hover"
      >
        <Bot className="size-6" aria-hidden="true" />
      </button>
    </div>
  );
}
