import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Loader2,
  CheckCircle2,
  Download,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { findFormat, formatBytes } from "@/lib/formats";
import type { ConversionState } from "@/types/converter";

const PHASE_LABEL: Record<ConversionState["phase"], string> = {
  idle: "بانتظار ملف",
  detecting: "جاري الفحص",
  configuring: "جاهز للتحويل",
  building: "جاري البناء",
  done: "اكتمل",
  error: "فشل",
};

export function ConversionFlow({
  state,
  onStart,
  onReset,
}: {
  state: ConversionState;
  onStart: () => void;
  onReset: () => void;
}) {
  const { phase, source, target, progress, output, error } = state;
  const targetDef = findFormat(target);
  const busy = phase === "building";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/40 p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">
          خط التحويل
        </h2>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-medium",
            phase === "done" && "bg-emerald-400/10 text-emerald-200",
            phase === "building" && "bg-teal-400/10 text-teal-200",
            phase === "error" && "bg-rose-400/10 text-rose-200",
            (phase === "idle" || phase === "configuring") &&
              "bg-white/5 text-slate-400"
          )}
        >
          {PHASE_LABEL[phase]}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-white/5 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            من
          </p>
          <p className="mt-0.5 font-mono text-xs text-slate-200">
            {source ? source.format.toUpperCase() : "—"}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10">
          <Play className="h-3.5 w-3.5 text-emerald-300" />
        </div>
        <div className="flex-1 rounded-xl bg-white/5 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            إلى
          </p>
          <p className="mt-0.5 font-mono text-xs text-emerald-200">
            {targetDef?.ext}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="mt-2 text-right font-mono text-[11px] text-slate-500">
          {progress}%
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onStart}
          disabled={!source || busy}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
            !source || busy
              ? "cursor-not-allowed bg-white/5 text-slate-600"
              : "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110"
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري البناء…
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              ابدأ التحويل
            </>
          )}
        </button>
        {(phase === "done" || phase === "error") && (
          <button
            onClick={onReset}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:border-white/20 hover:text-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-200"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {output && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"
          >
            <div className="flex items-center gap-2 text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">تم إنشاء الحزمة</span>
            </div>
            <p className="mt-2 truncate font-mono text-xs text-slate-300">
              {output.name}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>{formatBytes(output.size)}</span>
              <span className="font-mono">sha256:{output.checksum}</span>
            </div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20">
              <Download className="h-3.5 w-3.5" />
              تنزيل الحزمة
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}