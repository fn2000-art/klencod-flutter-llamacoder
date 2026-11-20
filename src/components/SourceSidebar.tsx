import { motion, AnimatePresence } from "framer-motion";
import { Code2, ChevronLeft, ChevronRight, FileArchive } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/formats";
import type { SourceFile } from "@/types/converter";

export function SourceSidebar({
  source,
  open,
  onToggle,
}: {
  source: SourceFile | null;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-1/2 z-40 flex h-12 w-7 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-white/10 bg-slate-900 text-slate-400 transition-all hover:text-emerald-300",
          open ? "left-80" : "left-0"
        )}
      >
        {open ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-30 shrink-0 overflow-hidden border-r border-white/10 bg-slate-900/80 backdrop-blur-xl"
          >
            <div className="w-80 p-6">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-300" />
                <h2 className="text-sm font-semibold tracking-wide text-slate-200">
                  كود المصدر
                </h2>
              </div>

              {!source ? (
                <div className="mt-6 rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <FileArchive className="mx-auto h-6 w-6 text-slate-600" />
                  <p className="mt-3 text-xs text-slate-500">
                    حمّل ملفًا لعرض محتوياته
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="truncate text-xs font-medium text-slate-200">
                      {source.name}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {formatBytes(source.size)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">
                      المحتويات
                    </p>
                    <div className="space-y-1">
                      {source.files.map((f) => (
                        <div
                          key={f.path}
                          className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                        >
                          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-300">
                            {f.path}
                          </span>
                          <span className="ml-2 shrink-0 text-[10px] text-slate-600">
                            {formatBytes(f.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">
                      الأذونات
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {source.permissions.map((p) => (
                        <span
                          key={p}
                          className="rounded-md bg-emerald-400/10 px-2 py-1 font-mono text-[10px] text-emerald-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}