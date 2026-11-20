import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
  ConversionAction,
  ConversionState,
  FormatId,
  LogLine,
  SourceFile,
} from "@/types/converter";
import { buildManifest, findFormat, makeSourceFile } from "@/lib/formats";

const initialState: ConversionState = {
  phase: "idle",
  source: null,
  target: "deb",
  manifest: "",
  logs: [],
  output: null,
  progress: 0,
  error: null,
};

function reducer(state: ConversionState, action: ConversionAction): ConversionState {
  switch (action.type) {
    case "LOAD_FILE":
      return {
        ...initialState,
        phase: "configuring",
        source: action.file,
        target: state.target === action.file.format ? "deb" : state.target,
        manifest: buildManifest(action.file),
      };
    case "CLEAR_FILE":
      return { ...initialState, target: state.target };
    case "SET_TARGET":
      return { ...state, target: action.target };
    case "SET_MANIFEST":
      return { ...state, manifest: action.value };
    case "UPDATE_FILE":
      if (!state.source) return state;
      return {
        ...state,
        source: {
          ...state.source,
          files: state.source.files.map((f) =>
            f.id === action.id ? { ...f, content: action.content } : f
          ),
        },
      };
    case "START":
      if (!state.source) return state;
      return { ...state, phase: "building", logs: [], output: null, progress: 0, error: null };
    case "PROGRESS":
      return { ...state, progress: action.value };
    case "LOG":
      return { ...state, logs: [...state.logs, action.line] };
    case "FINISH":
      return { ...state, phase: "done", output: action.output, progress: 100 };
    case "FAIL":
      return { ...state, phase: "error", error: action.message };
    case "RESET":
      return {
        ...state,
        phase: state.source ? "configuring" : "idle",
        logs: [],
        output: null,
        progress: 0,
        error: null,
      };
    default:
      return state;
  }
}

const now = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

let logSeq = 0;
const line = (level: LogLine["level"], text: string): LogLine => ({
  id: `log-${++logSeq}`,
  level,
  text,
  time: now(),
});

export function useConversion() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const loadFile = useCallback(
    (name: string, format: FormatId) => {
      clearTimers();
      dispatch({ type: "LOAD_FILE", file: makeSourceFile(name, format) });
    },
    [clearTimers]
  );

  const clearFile = useCallback(() => {
    clearTimers();
    dispatch({ type: "CLEAR_FILE" });
  }, [clearTimers]);

  const setTarget = useCallback(
    (target: FormatId) => dispatch({ type: "SET_TARGET", target }),
    []
  );
  const setManifest = useCallback(
    (value: string) => dispatch({ type: "SET_MANIFEST", value }),
    []
  );
  const updateFile = useCallback(
    (id: string, content: string) => dispatch({ type: "UPDATE_FILE", id, content }),
    []
  );
  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: "RESET" });
  }, [clearTimers]);

  const start = useCallback(() => {
    const source: SourceFile | null = state.source;
    if (!source) return;
    clearTimers();
    dispatch({ type: "START" });

    const targetDef = findFormat(state.target);
    const steps: { delay: number; level: LogLine["level"]; text: string }[] = [
      { delay: 300, level: "info", text: `$ noxel unpack ${source.name}` },
      { delay: 900, level: "ok", text: `extracted ${source.files.length} entries` },
      { delay: 1500, level: "info", text: "parsing package metadata" },
      {
        delay: 2100,
        level: "warn",
        text: "native bytecode is not portable — running translation shim",
      },
      {
        delay: 2800,
        level: "info",
        text: `mapping permissions → ${targetDef?.platform} sandbox`,
      },
      {
        delay: 3500,
        level: "info",
        text: `writing control manifest for ${targetDef?.ext}`,
      },
      { delay: 4200, level: "ok", text: "repacking archive" },
      {
        delay: 4900,
        level: "ok",
        text: `build complete → ${source.packageName}${targetDef?.ext}`,
      },
    ];

    steps.forEach((s) => {
      const t = window.setTimeout(() => {
        dispatch({ type: "LOG", line: line(s.level, s.text) });
        dispatch({ type: "PROGRESS", value: Math.round((s.delay / 4900) * 100) });
      }, s.delay);
      timers.current.push(t);
    });

    const done = window.setTimeout(() => {
      dispatch({
        type: "FINISH",
        output: {
          name: `${source.packageName}${targetDef?.ext ?? ""}`,
          format: state.target,
          size: Math.round(source.size * 0.82),
          checksum: Math.random().toString(16).slice(2, 14),
        },
      });
    }, 5300);
    timers.current.push(done);
  }, [state.source, state.target, clearTimers]);

  return {
    state,
    loadFile,
    clearFile,
    setTarget,
    setManifest,
    updateFile,
    start,
    reset,
  };
}