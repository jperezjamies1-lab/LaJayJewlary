"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiChatMessage } from "@/types";

const WELCOME: Record<"en" | "es", string> = {
  en: "Welcome to Jay La Joyería! I'm your personal shopping assistant. I can help you find jewelry, answer questions, recommend gifts, and assist with your order.",
  es: "¡Bienvenido a Jay La Joyería! Soy tu asistente personal de compras. Estoy aquí para ayudarte a encontrar la joyería perfecta, responder preguntas y ayudarte con tu pedido.",
};

const QUICK_PROMPTS: Record<"en" | "es", string[]> = {
  en: ["I need a gift", "Where is my order?", "Compare two necklaces", "Ring sizing help"],
  es: ["Necesito un regalo", "¿Dónde está mi pedido?", "Comparar dos collares", "Ayuda con talla de anillo"],
};

export default function AiConciergeWidget({ locale = "es" as "en" | "es" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME[locale],
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: AiChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
          locale,
        }),
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            locale === "en"
              ? "I'm having trouble connecting right now. You can reach our team directly via WhatsApp or email, and I'll be back shortly."
              : "Tengo problemas para conectarme en este momento. Puedes contactar a nuestro equipo por WhatsApp o correo, y estaré de vuelta pronto.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open Jay AI Concierge"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gold text-onyx px-5 py-3.5 shadow-lg shadow-black/40 transition-transform hover:scale-105",
          open && "hidden"
        )}
      >
        <Sparkles size={18} />
        <span className="text-sm font-medium hidden sm:inline">
          {locale === "en" ? "Ask Jay AI" : "Pregunta a Jay AI"}
        </span>
      </button>

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[600px] flex flex-col rounded-lg border border-gold/30 bg-onyx2 shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-onyx">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                <Sparkles size={16} className="text-gold" />
              </div>
              <div>
                <p className="text-sm text-ivory font-medium leading-none">Jay AI Concierge</p>
                <p className="text-[11px] text-ivory/40 mt-0.5">
                  {locale === "en" ? "Personal shopping assistant" : "Asistente personal de compras"}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-ivory/50 hover:text-ivory">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-gold text-onyx rounded-br-sm"
                      : "bg-white/5 text-ivory/90 rounded-bl-sm"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-ivory/50 rounded-lg rounded-bl-sm px-3.5 py-2.5 text-sm">
                  {locale === "en" ? "Thinking…" : "Pensando…"}
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {QUICK_PROMPTS[locale].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs border border-white/15 rounded-full px-3 py-1.5 text-ivory/70 hover:border-gold hover:text-gold transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3 bg-onyx"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={locale === "en" ? "Ask about jewelry, orders, gifts…" : "Pregunta sobre joyería, pedidos, regalos…"}
              className="flex-1 bg-white/5 rounded-full px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/30 outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="rounded-full bg-gold text-onyx p-2.5 disabled:opacity-40 transition-opacity"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
