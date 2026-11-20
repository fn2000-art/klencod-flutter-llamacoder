import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FORMATS, PLATFORMS, formatMeta, platformMeta } from "@/lib/formats";
import type { FormatId } from "@/types/converter";

export function FormatGrid({
  target,
  onTarget,
  sourceFormat,
}: {
  target: FormatId;
  onTarget: (f: FormatId) => void;
  sourceFormat: FormatId | null;
}) {
  const [query, setQuery] = useState("");

  const sourcePlatform = sourceFormat ? formatMeta(sourceFormat).platform : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FORMATS;
    return FORMATS.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.ext.toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q) ||
        platformMeta(f.platform).label.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-white">
            اختر صيغة الهدف
          </h2>
          <p className="text-sm text-slate-400">
            {FORMATS.length} صيغة عبر {PLATFORMS.length} أنظمة
          </p>
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن صيغة..."
            className="border-white/10 bg-slate-900/40 pl-9 text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="space-y-6">
        {PLATFORMS.map((p, pi) => {
          const formats = filtered.filter((f) => f.platform === p.id);
          if (formats.length === 0) return null;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.05 }}
            >
              <div className="mb-2.5 flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", p.dot)} />
                <span className={cn("text-sm font-semibold", p.color)}>
                  {p.label}
                </span>
                <span className="text-xs text-slate-500">
                  {formats.length} صيغ
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {formats.map((f) => {
                    const active = target === f.id;
                    const isSource = sourceFormat === f.id;
                    const crossPlatform =
                      sourcePlatform !== null && sourcePlatform !== f.platform;
                    return (
                      <motion.button
                        key={f.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => onTarget(f.id)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border p-3 text-left transition-colors",
                          active
                            ? "border-emerald-400/60 bg-emerald-400/10"
                            : "border-white/10 bg-slate-900/40 hover:border-white/25"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="target-glow"
                            className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-400/20 to-teal-500/10"
                          />
                        )}
                        <div className="flex items-center justify-between">
                          <span className="truncate font-mono text-xs text-slate-400">
                            .{f.ext}
                          </span>
                          {active && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400">
                              <Check className="h-3 w-3 text-slate-950" />
                            </span>
                          )}
                          {isSource && !active && (
                            <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                              المصدر
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 truncate font-semibold text-white">
                          {f.label}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                          {crossPlatform && (
                            <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400/70" />
                          )}
                          {f.desc}
                        </p>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            لا توجد صيغ مطابقة لـ «{query}»
          </p>
        )}
      </div>
    </div>
  );
}