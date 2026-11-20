import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORMATS, FAMILY_LABEL } from "@/lib/formats";
import type { FormatId } from "@/types/converter";

export function FormatSearch({
  target,
  onTarget,
  sourceFormat,
}: {
  target: FormatId;
  onTarget: (id: FormatId) => void;
  sourceFormat: FormatId | null;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = FORMATS.filter((f) => f.id !== sourceFormat);
    if (!q) return pool;
    return pool.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.ext.toLowerCase().includes(q) ||
        f.platform.toLowerCase().includes(q) ||
        f.id.includes(q)
    );
  }, [query, sourceFormat]);

  const active = FORMATS.find((f) => f.id === target);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-300" />
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">
          اختر صيغة الهدف
        </h2>
        {sourceFormat && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
            المصدر: {sourceFormat.toUpperCase()}
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border bg-slate-900/60 px-4 py-3 backdrop-blur transition-colors",
          open ? "border-emerald-400/40" : "border-white/10 hover:border-white/20"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="ابحث عن صيغة… deb, rpm, exe, dmg, ipa"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none"
        />
        {active && (
          <span className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <ArrowRight className="h-3 w-3" />
            {active.ext}
          </span>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                لا توجد صيغة مطابقة
              </p>
            ) : (
              results.map((f) => (
                <button
                  key={f.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onTarget(f.id);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    target === f.id ? "bg-emerald-400/10" : "hover:bg-white/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-[10px] font-bold",
                      f.color
                    )}
                  >
                    {f.id.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-200">
                      {f.label}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {FAMILY_LABEL[f.family]} · {f.platform} · {f.ext}
                    </span>
                  </span>
                  {target === f.id && (
                    <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}