import { useEffect, useState } from "react";
import { Code2, RotateCcw, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildManifest } from "@/lib/formats";
import type { SourceFile } from "@/types/converter";

export function CodeEditor({
  source,
  onChange,
}: {
  source: SourceFile;
  onChange: (s: SourceFile) => void;
}) {
  const [code, setCode] = useState(
    source.manifest || buildManifest(source.name, source.format, source.packageName, source.version)
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCode(
      source.manifest ||
        buildManifest(source.name, source.format, source.packageName, source.version)
    );
  }, [source.name, source.format, source.packageName, source.version, source.manifest]);

  const lines = code.split("\n");

  function save() {
    onChange({ ...source, manifest: code });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-800 bg-slate-950 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Code2 className="h-4 w-4 text-emerald-400" />
          محرر كود المصدر
          <span className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-400">
            noxel.toml
          </span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setCode(
                buildManifest(source.name, source.format, source.packageName, source.version)
              )
            }
            className="text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            استرجاع
          </Button>
          <Button
            size="sm"
            onClick={save}
            className="bg-emerald-700 text-white hover:bg-emerald-600"
          >
            {saved ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                تم الحفظ
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                حفظ
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex max-h-96 overflow-auto font-mono text-xs leading-relaxed">
          <div className="select-none border-r border-slate-800 bg-slate-900/60 px-3 py-4 text-right text-slate-600">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="min-h-64 flex-1 resize-none bg-transparent px-4 py-4 text-emerald-200 outline-none placeholder:text-slate-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}