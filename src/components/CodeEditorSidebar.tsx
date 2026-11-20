import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  Save,
  Undo2,
  Redo2,
  Search,
  WrapText,
  Hash,
  Copy,
  Check,
  FileCode,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/formats";
import type { PackageFile, SourceFile } from "@/types/converter";

type Tab = "files" | "manifest";

export function CodeEditorSidebar({
  source,
  manifest,
  open,
  onToggle,
  onUpdateFile,
  onManifest,
}: {
  source: SourceFile | null;
  manifest: string;
  open: boolean;
  onToggle: () => void;
  onUpdateFile: (id: string, content: string) => void;
  onManifest: (v: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("files");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [wrap, setWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [copied, setCopied] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile: PackageFile | null = useMemo(
    () => source?.files.find((f) => f.id === activeId) ?? null,
    [source, activeId]
  );

  useEffect(() => {
    if (source && !activeId) setActiveId(source.files[0]?.id ?? null);
  }, [source, activeId]);

  useEffect(() => {
    if (tab === "files" && activeFile) {
      setDraft(activeFile.content);
      setHistory([]);
      setFuture([]);
    } else if (tab === "manifest") {
      setDraft(manifest);
      setHistory([]);
      setFuture([]);
    }
  }, [activeId, tab, activeFile, manifest]);

  const commit = (value: string) => {
    setHistory((h) => [...h, draft]);
    setFuture([]);
    setDraft(value);
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [draft, ...f]);
      setDraft(prev);
      return h.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, draft]);
      setDraft(next);
      return f.slice(1);
    });
  };

  const save = () => {
    if (tab === "files" && activeFile) onUpdateFile(activeFile.id, draft);
    else if (tab === "manifest") onManifest(draft);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const lines = draft.split("\n");
  const matchCount = findText
    ? lines.filter((l) => l.toLowerCase().includes(findText.toLowerCase())).length
    : 0;

  return (
    <>
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-1/2 z-40 flex h-14 w-7 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-white/10 bg-slate-900 text-slate-400 shadow-lg transition-all hover:text-emerald-300",
          open ? "left-96" : "left-0"
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
            animate={{ width: 384, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative z-30 shrink-0 overflow-hidden border-r border-white/10 bg-slate-900/80 backdrop-blur-xl"
          >
            <div className="flex h-screen w-96 flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-300" />
                  <h2 className="text-sm font-semibold tracking-wide text-slate-200">
                    محرر الأكواد
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <ToolButton label="تراجع" onClick={undo} disabled={history.length === 0}>
                    <Undo2 className="h-3.5 w-3.5" />
                  </ToolButton>
                  <ToolButton label="إعادة" onClick={redo} disabled={future.length === 0}>
                    <Redo2 className="h-3.5 w-3.5" />
                  </ToolButton>
                  <ToolButton label="حفظ" onClick={save} accent>
                    <Save className="h-3.5 w-3.5" />
                  </ToolButton>
                </div>
              </div>

              <div className="flex gap-1 border-b border-white/10 px-4 py-2">
                <TabButton active={tab === "files"} onClick={() => setTab("files")}>
                  <FileCode className="h-3.5 w-3.5" />
                  الملفات
                </TabButton>
                <TabButton
                  active={tab === "manifest"}
                  onClick={() => setTab("manifest")}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  البيان
                </TabButton>
              </div>

              {tab === "files" && (
                <div className="max-h-44 overflow-y-auto border-b border-white/10 p-2">
                  {!source ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-5 text-center">
                      <FileArchive className="mx-auto h-5 w-5 text-slate-600" />
                      <p className="mt-2 text-[11px] text-slate-500">
                        حمّل ملفًا لعرض محتوياته
                      </p>
                    </div>
                  ) : (
                    source.files.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setActiveId(f.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                          activeId === f.id
                            ? "bg-emerald-400/10 text-emerald-200"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate font-mono text-[11px]">
                          {f.path}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-600">
                          {formatBytes(f.size)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="flex items-center gap-1 border-b border-white/10 px-4 py-2">
                <ToolButton
                  label="التفاف النص"
                  onClick={() => setWrap((v) => !v)}
                  active={wrap}
                >
                  <WrapText className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton
                  label="أرقام الأسطر"
                  onClick={() => setLineNumbers((v) => !v)}
                  active={lineNumbers}
                >
                  <Hash className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton
                  label="بحث"
                  onClick={() => setFindOpen((v) => !v)}
                  active={findOpen}
                >
                  <Search className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton label="نسخ" onClick={copy}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </ToolButton>
                <span className="ml-auto font-mono text-[10px] text-slate-600">
                  {lines.length} lines
                </span>
              </div>

              <AnimatePresence>
                {findOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b border-white/10"
                  >
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Search className="h-3.5 w-3.5 text-slate-500" />
                      <input
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        placeholder="ابحث داخل الملف…"
                        className="min-w-0 flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-600 outline-none"
                      />
                      {findText && (
                        <span className="shrink-0 font-mono text-[10px] text-slate-500">
                          {matchCount} hits
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative flex min-h-0 flex-1">
                {lineNumbers && (
                  <div className="select-none overflow-hidden border-r border-white/5 bg-slate-950/40 px-2 py-3 text-right font-mono text-[11px] leading-relaxed text-slate-600">
                    {lines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                )}
                <textarea
                  ref={areaRef}
                  value={draft}
                  onChange={(e) => commit(e.target.value)}
                  spellCheck={false}
                  wrap={wrap ? "soft" : "off"}
                  placeholder="لا يوجد ملف مفتوح…"
                  className="min-h-0 flex-1 resize-none bg-transparent px-3 py-3 font-mono text-[11px] leading-relaxed text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-slate-600">
                <span className="font-mono">
                  {tab === "files" ? activeFile?.path ?? "—" : "DEBIAN/control"}
                </span>
                <span className="font-mono">
                  {tab === "files" ? activeFile?.kind ?? "" : "manifest"}
                </span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function ToolButton({
  children,
  label,
  onClick,
  disabled,
  active,
  accent,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        disabled
          ? "cursor-not-allowed text-slate-700"
          : accent
            ? "bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
            : active
              ? "bg-white/10 text-emerald-200"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      )}
    >
      {children}
    </button>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-emerald-400/10 text-emerald-200"
          : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
      )}
    >
      {children}
    </button>
  );
}