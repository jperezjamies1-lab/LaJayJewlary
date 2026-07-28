import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import { AI_TOOLS, runTool } from "@/lib/ai/tools";
import { getSiteSettings } from "@/lib/settings";
import { getCustomerSession } from "@/lib/auth/customer";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/log";

const AI_SESSION_COOKIE = "jay_ai_session";

export async function POST(req: NextRequest) {
  // ANTHROPIC_API_KEY is optional site-wide. The Anthropic SDK throws at
  // construction time if no key is present, so this is checked — and the
  // client only ever constructed — inside the request handler, never at
  // module scope, so a missing key can never break a cold start or a build.
  if (!process.env.ANTHROPIC_API_KEY) {
    const { locale = "es" } = await req.json().catch(() => ({ locale: "es" }));
    return NextResponse.json(
      {
        reply:
          locale === "es"
            ? "Asistente no disponible por el momento."
            : "Assistant unavailable at the moment.",
        disabled: true,
      },
      { status: 200 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const { messages, locale = "es" } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      locale: "en" | "es";
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const customer = await getCustomerSession();

    // Persist the conversation so it shows up in admin > Jay AI, and so
    // "AI conversations" logging (master prompt requirement) is real.
    let sessionId = req.cookies.get(AI_SESSION_COOKIE)?.value;
    if (!sessionId) sessionId = crypto.randomBytes(16).toString("hex");

    let conversation = await prisma.aiConversation.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });
    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: { sessionId, language: locale, customerId: customer?.id },
      });
      await logActivity({ category: "AI", action: "CONVERSATION_STARTED", entity: "AiConversation", entityId: conversation.id });
    }

    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      await prisma.aiMessage.create({
        data: { conversationId: conversation.id, role: "user", content: lastUserMessage.content },
      });
    }

    let workingMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    async function finish(reply: string, escalated = false) {
      await prisma.aiMessage.create({
        data: { conversationId: conversation!.id, role: "assistant", content: reply },
      });
      if (escalated) {
        await prisma.aiConversation.update({ where: { id: conversation!.id }, data: { escalated: true } });
      }
      const res = NextResponse.json({ reply });
      res.cookies.set(AI_SESSION_COOKIE, sessionId!, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      return res;
    }

    // Tool-use loop: Claude may call one or more tools before giving a final answer.
    // Capped at 4 round-trips to keep latency bounded for a chat widget.
    let sawEscalation = false;
    for (let i = 0; i < 4; i++) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: buildSystemPrompt(locale, settings),
        tools: AI_TOOLS,
        messages: workingMessages,
      });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) {
        const textBlock = response.content.find((b) => b.type === "text");
        const reply =
          textBlock && textBlock.type === "text"
            ? textBlock.text
            : locale === "es"
            ? "Con gusto te ayudo — ¿puedes darme más detalles?"
            : "Happy to help — could you tell me a bit more?";
        return finish(reply, sawEscalation);
      }

      if (toolUseBlocks.some((b) => b.name === "escalate_to_human")) sawEscalation = true;

      // Execute tools, then feed results back for the next turn.
      workingMessages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: JSON.stringify(await runTool(block.name, block.input as Record<string, unknown>)),
        }))
      );

      workingMessages.push({ role: "user", content: toolResults });
    }

    return finish(
      locale === "es"
        ? "Puedo conectarte con nuestro equipo para resolver esto directamente."
        : "Let me connect you with our team to sort this out directly.",
      true
    );
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
