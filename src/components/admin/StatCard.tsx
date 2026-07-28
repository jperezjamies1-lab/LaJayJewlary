import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-ivory/40">{label}</span>
        <Icon size={16} className="text-gold" />
      </div>
      <p className="font-mono text-2xl text-ivory">{value}</p>
      {delta && (
        <p className={cn("text-xs mt-1.5", delta.positive ? "text-success" : "text-garnet")}>
          {delta.positive ? "▲" : "▼"} {delta.value}
        </p>
      )}
    </div>
  );
}
