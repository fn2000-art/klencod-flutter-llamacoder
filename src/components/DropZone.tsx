import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileArchive, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectFormat, findFormat, formatBytes } from "@/lib/formats";
import type { SourceFile } from "@/types/converter";

export function DropZone({
  source,
  onLoaded,
  onClear,
}: {
  source: SourceFile | null;
  onLoaded: (name: string, format: SourceFile["format"]) => void;
  onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (name: string) => {
    const fmt = detectFormat(name);
    if (!fmt) {
      setError("صيغة غير مدعومة. جرّب ملف .apk أو .deb أو .exe أو غيرها من القائمة.");
      return;
    }
    setError(null);
    onLoaded(name, fmt);
  };

  if (source) {
    const def = findFormat(source.format);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-900 to-slate-900/40 p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
            <FileArchive className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-100">{source.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {def?.label} · {formatBytes(source.size)} · {source.files.length} entries
            </p>
          </div>
          <button
            onClick={onClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { k: "Package", v: source.packageName },
            { k: "Version", v: source.version },
            { k: "Arch", v: source.arch },
          ].map((row) => (
            <div key={row.k} className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                {row.k}
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-slate-200">
                {row.v}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handle(f.name);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all",
          dragging
            ? "border-emerald-400/60 bg-emerald-400/5"
            : "border-white/10 bg-slate-900/40 hover:border-emerald-400/30 hover:bg-slate-900/60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f.name);
          }}
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 transition-transform group-hover:scale-105">
          <UploadCloud className="h-7 w-7 text-emerald-300" />
        </div>
        <p className="mt-4 font-medium text-slate-200">اسحب ملف الحزمة هنا</p>
        <p className="mt-1 text-sm text-slate-500">
          أو اضغط للاختيار — apk, deb, rpm, exe, msi, ipa, dmg وأكثر
        </p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}