export type FormatId =
  | "apk"
  | "aab"
  | "deb"
  | "rpm"
  | "appimage"
  | "flatpak"
  | "snap"
  | "pacman"
  | "ipa"
  | "dmg"
  | "pkg"
  | "exe"
  | "msi"
  | "msix"
  | "appx"
  | "jar"
  | "war"
  | "whl"
  | "tar"
  | "zip"
  | "iso"
  | "xbps"
  | "apk-linux"
  | "ebuild";

export type PackageFile = {
  id: string;
  path: string;
  kind: string;
  size: number;
  content: string;
  editable: boolean;
};

export type SourceFile = {
  name: string;
  format: FormatId;
  packageName: string;
  version: string;
  arch: string;
  maintainer: string;
  description: string;
  permissions: string[];
  size: number;
  files: PackageFile[];
};

export type LogLine = {
  id: string;
  level: "info" | "ok" | "warn" | "error";
  text: string;
  time: string;
};

export type OutputPackage = {
  name: string;
  format: FormatId;
  size: number;
  checksum: string;
};

export type Phase =
  | "idle"
  | "detecting"
  | "configuring"
  | "building"
  | "done"
  | "error";

export type ConversionState = {
  phase: Phase;
  source: SourceFile | null;
  target: FormatId;
  manifest: string;
  logs: LogLine[];
  output: OutputPackage | null;
  progress: number;
  error: string | null;
};

export type ConversionAction =
  | { type: "LOAD_FILE"; file: SourceFile }
  | { type: "CLEAR_FILE" }
  | { type: "SET_TARGET"; target: FormatId }
  | { type: "SET_MANIFEST"; value: string }
  | { type: "UPDATE_FILE"; id: string; content: string }
  | { type: "START" }
  | { type: "PROGRESS"; value: number }
  | { type: "LOG"; line: LogLine }
  | { type: "FINISH"; output: OutputPackage }
  | { type: "FAIL"; message: string }
  | { type: "RESET" };