import { useEffect, useRef, useState } from "react";
import { Play, Loader2, Download, Settings2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { formatMeta } from "@/lib/formats";
import type { SourceFile, OutputPackage, LogLine, FormatId } from "@/types/converter";

const STEPS = [
  { level: "cmd" as const, text: "noxel unpack --input {src}" },
  { level: "step" as const, text: "قراءة البيانات الوصفية واستخراج الملفات" },
  { level: "cmd" as const, text: "noxel render --target {tgt} --arch {arch}" },
  { level: "info" as const, text: "توليد ملف التحكم (control / spec / plist)" },
  { level: "step" as const, text: "ضغط الحزمة وبناء الهيكل النهائي" },
  { level: "cmd" as const, text: "noxel build --sign=false --output dist/" },
  { level: "ok" as const, text: "اكتمل التحويل بنجاح" },
];

export function ConversionPanel({
  source,
  target,
  running,
  output,
  onLog,
  onStart,
  onFinish,
}: {
  source: SourceFile;
  target: FormatId;
  running: boolean;
  output: OutputPackage | null;
  onLog: (l: LogLine) => void;
  onStart: () => void;
  onFinish: (p: OutputPackage) => void;
}) {
  const [arch, setArch] = useState(source.arch);
  const [maintainer, setMaintainer] = useState(source.maintainer);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);
  const meta = formatMeta(target);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  function start() {
    if (running) return;
    onStart();
    setProgress(0);
    let i = 0;
    const total = STEPS.length;
    timer.current = window.setInterval(() => {
      const step = STEPS[i];
      onLog({
        id: Date.now() + i,
        level: step.level,
        text: step.text
          .replace("{src}", source.name)
          .replace("{tgt}", target)
          .replace("{arch}", arch),
        time: new Date().toLocaleTimeString("en-GB"),
      });
      i += 1;
      setProgress(Math.round((i / total) * 100));
      if (i >= total) {
        if (timer.current) window.clearInterval(timer.current);
        const base = source.name.replace(/\.[^.]+$/, "");
        const control = [
          `Package: ${source.packageName}`,
          `Version: ${source.version}`,
          `Architecture: ${arch}`,
          `Format: ${meta.label}`,
          `Maintainer: ${maintainer}`,
          `Description: ${source.description}`,
        ].join("\n");
        onFinish({
          fileName: `${base}_${source.version}_${arch}.${meta.ext}`,
          size: Math.round(source.size * 0.82),
          format: target,
          arch,
          control,
        });
      }
    }, 620);
  }

  return (
    <Card className="rounded-2xl border-emerald-900/10 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
            <Settings2 className="h-4 w-4 text-emerald-700" />
          </span>
          إعدادات التحويل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="text-xs text-emerald-700">الهدف المحدد</p>
          <p className="mt-0.5 font-semibold text-emerald-900">{meta.label}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="arch">المعمارية</Label>
          <Select value={arch} onValueChange={setArch}>
            <SelectTrigger id="arch" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x86_64">x86_64</SelectItem>
              <SelectItem value="amd64">amd64</SelectItem>
              <SelectItem value="arm64">arm64</SelectItem>
              <SelectItem value="armhf">armhf</SelectItem>
              <SelectItem value="universal">universal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maint">المشرف (Maintainer)</Label>
          <Input
            id="maint"
            value={maintainer}
            onChange={(e) => setMaintainer(e.target.value)}
          />
        </div>

        <Button
          onClick={start}
          disabled={running}
          className="w-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جارٍ التحويل...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              ابدأ التحويل
            </>
          )}
        </Button>

        {(running || progress > 0) && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>التقدم</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {output && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
              <PackageCheck className="h-3.5 w-3.5" />
              الحزمة جاهزة
            </p>
            <p className="mt-1 break-all font-mono text-sm font-semibold text-emerald-900">
              {output.fileName}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              {(output.size / 1024 / 1024).toFixed(2)} MB · {output.arch}
            </p>
            <Button
              size="sm"
              className="mt-3 w-full bg-emerald-700 text-white hover:bg-emerald-800"
            >
              <Download className="mr-2 h-4 w-4" />
              تنزيل الحزمة
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}