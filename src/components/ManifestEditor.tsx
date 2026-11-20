import { FileCode2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function ManifestEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-teal-300" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200">
            بيان الحزمة
          </h2>
        </div>
        {disabled && (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="h-3 w-3" />
            مقفل
          </span>
        )}
      </div>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="حمّل ملفًا أولًا لتوليد البيان تلقائيًا…"
        className={cn(
          "h-52 w-full resize-none bg-transparent px-5 py-4 font-mono text-xs leading-relaxed outline-none",
          disabled ? "text-slate-600" : "text-slate-200"
        )}
      />
    </div>
  );
}