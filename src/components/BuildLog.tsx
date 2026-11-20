import { useEffect, useRef } from "react";
import { Terminal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogLine } from "@/types/converter";

const LEVEL_STYLE: Record<LogLine["level"], string> = {
  info: "text-slate-400",
  ok: "text-emerald-300",
  warn: "text-amber-300",
  error: "text-rose-300",
};

export function BuildLog({
  logs,
  running,
}: {
  logs: LogLine[];
  running: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-300" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200">
            سجل البناء
          </h2>
        </div>
        {running && (
          <span className="flex items-center gap-2 text-[11px] text-teal-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            يعمل
          </span>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto p-5 font-mono text-xs leading-relaxed">
        {logs.map((l) => (
          <div key={l.id} className="flex gap-3">
            <span className="shrink-0 text-slate-600">{l.time}</span>
            <span className={cn("min-w-0 flex-1 break-all", LEVEL_STYLE[l.level])}>
              {l.text}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}