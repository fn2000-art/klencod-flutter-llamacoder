import { useState } from "react";
import { useRef } from "react";
import { Upload, Monitor, Smartphone, Apple, Terminal, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FORMATS, PLATFORMS, detectFormat } from "@/lib/formats";
import type { FormatId, PlatformId, SourceFile } from "@/types/converter";

const PLATFORM_ICON: Record<PlatformId, typeof Monitor> = {
  linux: Terminal,
  windows: Monitor,
  macos: Apple,
  android: Smartphone,
  ios: Apple,
};

function fakeParse(name: string, size: number): SourceFile {
  const fmt = detectFormat(name);
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "") || "app";
  const pkg = `io.noxel.${base.toLowerCase().slice(0, 10)}`;
  return {
    name,
    size,
    format: fmt,
    packageName: pkg,
    version: `${1 + (base.length % 4)}.${base.length % 9}.${(size % 20) + 1}`,
    arch: "x86_64",
    maintainer: "dev@noxel.io",
    description: `Repackaged ${base} application`,
    permissions: [
      "network.access",
      "filesystem.read",
      "filesystem.write",
      "notifications",
    ].slice(0, 3 + (base.length % 2)),
    files: [
      { path: "bin/app", kind: "executable", size: Math.round(size * 0.4) },
      { path: "lib/core.so", kind: "library", size: Math.round(size * 0.3) },
      { path: "share/icon.png", kind: "asset", size: 40960 },
      { path: "share/manifest.json", kind: "config", size: 2048 },
    ],
    manifest: "",
  };
}

export function Sidebar({
  source,
  target,
  onTarget,
  onPick,
}: {
  source: SourceFile | null;
  target: FormatId;
  onTarget: (f: FormatId) => void;
  onPick: (f: SourceFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [openPlatform, setOpenPlatform] = useState<PlatformId | null>(null);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-6 lg:flex">
      <Card className="rounded-2xl border-emerald-900/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">الحزمة المصدر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(fakeParse(f.name, f.size));
            }}
          />
          <Button
            onClick={() => inputRef.current?.click()}
            className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <Upload className="mr-2 h-4 w-4" />
            رفع ملف
          </Button>
          {source && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="truncate text-sm font-medium text-slate-800">
                {source.name}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {(source.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-emerald-900/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-emerald-700" />
            صيغة الهدف
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PLATFORMS.map((p) => {
            const Icon = PLATFORM_ICON[p.id];
            const formats = FORMATS.filter((f) => f.platform === p.id);
            const isOpen = openPlatform === p.id;
            return (
              <div key={p.id}>
                <button
                  onClick={() => setOpenPlatform(isOpen ? null : p.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    isOpen
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {p.label}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formats.length}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-1 space-y-1 pl-3">
                    {formats.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onTarget(f.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                          target === f.id
                            ? "bg-emerald-700 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span>{f.label}</span>
                        <span className="font-mono opacity-70">.{f.ext}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}