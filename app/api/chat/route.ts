import { getUser } from "@/lib/auth";
import { streamAssistantReply } from "@/lib/deepseek";
import type { ChatMessage } from "@/types/assistant";

const MAX_MESSAGE_LENGTH = 4000;

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown }).messages;

  if (
    !Array.isArray(rawMessages) ||
    rawMessages.length === 0 ||
    !rawMessages.every(isChatMessage)
  ) {
    return Response.json({ error: "Mensajes inválidos" }, { status: 400 });
  }

  try {
    const stream = streamAssistantReply(rawMessages as ChatMessage[]);

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    return Response.json({ error: message }, { status: 502 });
  }
}
