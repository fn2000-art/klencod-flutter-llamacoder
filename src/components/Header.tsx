import { Terminal, Cpu, PanelLeft } from "lucide-react";

export function Header({ onOpenEditor }: { onOpenEditor: () => void }) {
  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <motionless />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Terminal className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold leading-tight text-slate-50">
              noxel
            </h1>
            <p className="text-[11px] text-slate-500">
              universal package converter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-200 sm:flex">
            <Cpu className="h-3.5 w-3.5" />
            محلي بالكامل · بدون سيرفر
          </span>
          <button
            onClick={onOpenEditor}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-slate-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-200"
          >
            <PanelLeft className="h-4 w-4" />
            المحرر
          </button>
        </div>
      </div>
    </header>
  );
}

function motionless() {
  return null;
}