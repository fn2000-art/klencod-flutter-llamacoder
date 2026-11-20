import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { DropZone } from "@/components/DropZone";
import { FormatSearch } from "@/components/FormatSearch";
import { ConversionFlow } from "@/components/ConversionFlow";
import { BuildLog } from "@/components/BuildLog";
import { CodeEditorSidebar } from "@/components/CodeEditorSidebar";
import { useConversion } from "@/hooks/useConversion";

export default function App() {
  const {
    state,
    loadFile,
    clearFile,
    setTarget,
    updateFile,
    setManifest,
    start,
    reset,
  } = useConversion();
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-slate-950 text-slate-100">
      <CodeEditorSidebar
        source={state.source}
        manifest={state.manifest}
        open={editorOpen}
        onToggle={() => setEditorOpen((v) => !v)}
        onUpdateFile={updateFile}
        onManifest={setManifest}
      />

      <div className="relative min-h-screen flex-1 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10">
          <Header onOpenEditor={() => setEditorOpen(true)} />
          <main className="mx-auto max-w-7xl px-6 pb-24 pt-10">
            <div className="grid gap-8 lg:grid-cols-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 lg:col-span-7"
              >
                <DropZone
                  source={state.source}
                  onLoaded={loadFile}
                  onClear={clearFile}
                />
                <FormatSearch
                  target={state.target}
                  onTarget={setTarget}
                  sourceFormat={state.source?.format ?? null}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-8 lg:col-span-5"
              >
                <ConversionFlow state={state} onStart={start} onReset={reset} />
              </motion.div>
            </div>

            <AnimatePresence>
              {state.logs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8"
                >
                  <BuildLog logs={state.logs} running={state.phase === "building"} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}