import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { X, FileCode2, HardDrive } from "lucide-react";
import { formatMeta } from "@/lib/formats";
import type { SourceFile } from "@/types/converter";

export function PackageInfo({
  source,
  onClear,
}: {
  source: SourceFile;
  onClear: () => void;
}) {
  const meta = formatMeta(source.format);
  return (
    <Card className="rounded-2xl border-emerald-900/10 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100">
            <HardDrive className="h-4 w-4 text-teal-700" />
          </span>
          بيانات الحزمة
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="text-slate-400 hover:text-rose-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <Badge className="bg-emerald-700 text-white hover:bg-emerald-700">
            {meta.label}
          </Badge>
          <span className="truncate font-mono text-sm text-emerald-900">
            {source.name}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "المعرّف", v: source.packageName },
            { l: "الإصدار", v: source.version },
            { l: "المعمارية", v: source.arch },
            { l: "الحجم", v: `${(source.size / 1024 / 1024).toFixed(2)} MB` },
          ].map((r) => (
            <div key={r.l} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-xs text-muted-foreground">{r.l}</p>
              <p className="mt-0.5 truncate font-mono text-sm font-medium text-slate-800">
                {r.v}
              </p>
            </div>
          ))}
        </div>
        <Separator />
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileCode2 className="h-3.5 w-3.5" />
            محتويات الحزمة ({source.files.length})
          </p>
          <div className="space-y-1.5">
            {source.files.map((f) => (
              <div
                key={f.path}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="truncate font-mono text-xs text-slate-700">
                  {f.path}
                </span>
                <span className="ml-3 shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {f.kind}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}