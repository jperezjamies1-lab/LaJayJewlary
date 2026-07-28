import { prisma } from "@/lib/db";
import { MessageCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAiPage() {
  const conversations = await prisma.aiConversation.findMany({
    include: { messages: true, customer: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const total = await prisma.aiConversation.count();
  const escalated = await prisma.aiConversation.count({ where: { escalated: true } });
  const resolved = await prisma.aiConversation.count({ where: { resolved: true } });

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Jay AI Concierge</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wider text-ivory/40 mb-2">Total Conversations</p>
          <p className="font-mono text-2xl text-ivory">{total}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wider text-ivory/40 mb-2">Resolved</p>
          <p className="font-mono text-2xl text-success">{resolved}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wider text-ivory/40 mb-2">Escalated</p>
          <p className="font-mono text-2xl text-garnet">{escalated}</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-16 text-center text-ivory/40 text-sm">
          No AI conversations yet. They'll appear here once customers start chatting with Jay AI Concierge.
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <details key={c.id} className="rounded-lg border border-white/10 p-4">
              <summary className="flex items-center justify-between cursor-pointer text-sm">
                <span className="flex items-center gap-2 text-ivory/80">
                  {c.escalated ? (
                    <AlertTriangle size={14} className="text-garnet" />
                  ) : (
                    <MessageCircle size={14} className="text-gold" />
                  )}
                  {c.customer?.email ?? "Guest"} · {c.language.toUpperCase()}
                </span>
                <span className="text-ivory/40 text-xs">{new Date(c.createdAt).toLocaleString()}</span>
              </summary>
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                {c.messages.map((m) => (
                  <p key={m.id} className="text-xs">
                    <span className={m.role === "user" ? "text-gold" : "text-ivory/50"}>
                      {m.role === "user" ? "Customer: " : "Jay AI: "}
                    </span>
                    <span className="text-ivory/70">{m.content}</span>
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
