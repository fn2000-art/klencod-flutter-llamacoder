import type { FormatId, PackageFile, SourceFile } from "@/types/converter";

export type FormatDef = {
  id: FormatId;
  label: string;
  ext: string;
  platform: string;
  family: "android" | "linux" | "windows" | "apple" | "jvm" | "python" | "universal";
  color: string;
};

export const FORMATS: FormatDef[] = [
  { id: "apk", label: "Android Package", ext: ".apk", platform: "Android", family: "android", color: "text-emerald-300" },
  { id: "aab", label: "Android App Bundle", ext: ".aab", platform: "Android", family: "android", color: "text-emerald-300" },
  { id: "deb", label: "Debian Package", ext: ".deb", platform: "Debian / Ubuntu", family: "linux", color: "text-amber-300" },
  { id: "rpm", label: "Red Hat Package", ext: ".rpm", platform: "Fedora / RHEL", family: "linux", color: "text-amber-300" },
  { id: "appimage", label: "AppImage", ext: ".AppImage", platform: "Linux", family: "linux", color: "text-amber-300" },
  { id: "flatpak", label: "Flatpak Bundle", ext: ".flatpak", platform: "Linux", family: "linux", color: "text-amber-300" },
  { id: "snap", label: "Snap Package", ext: ".snap", platform: "Ubuntu", family: "linux", color: "text-amber-300" },
  { id: "pacman", label: "Pacman Package", ext: ".pkg.tar.zst", platform: "Arch Linux", family: "linux", color: "text-amber-300" },
  { id: "xbps", label: "XBPS Package", ext: ".xbps", platform: "Void Linux", family: "linux", color: "text-amber-300" },
  { id: "apk-linux", label: "Alpine Package", ext: ".apk", platform: "Alpine Linux", family: "linux", color: "text-amber-300" },
  { id: "ebuild", label: "Gentoo Ebuild", ext: ".ebuild", platform: "Gentoo", family: "linux", color: "text-amber-300" },
  { id: "ipa", label: "iOS App Archive", ext: ".ipa", platform: "iOS", family: "apple", color: "text-sky-300" },
  { id: "dmg", label: "Apple Disk Image", ext: ".dmg", platform: "macOS", family: "apple", color: "text-sky-300" },
  { id: "pkg", label: "macOS Installer", ext: ".pkg", platform: "macOS", family: "apple", color: "text-sky-300" },
  { id: "exe", label: "Windows Executable", ext: ".exe", platform: "Windows", family: "windows", color: "text-cyan-300" },
  { id: "msi", label: "Windows Installer", ext: ".msi", platform: "Windows", family: "windows", color: "text-cyan-300" },
  { id: "msix", label: "MSIX Package", ext: ".msix", platform: "Windows", family: "windows", color: "text-cyan-300" },
  { id: "appx", label: "AppX Package", ext: ".appx", platform: "Windows", family: "windows", color: "text-cyan-300" },
  { id: "jar", label: "Java Archive", ext: ".jar", platform: "JVM", family: "jvm", color: "text-rose-300" },
  { id: "war", label: "Web Archive", ext: ".war", platform: "JVM", family: "jvm", color: "text-rose-300" },
  { id: "whl", label: "Python Wheel", ext: ".whl", platform: "Python", family: "python", color: "text-teal-300" },
  { id: "tar", label: "Tarball", ext: ".tar.gz", platform: "Universal", family: "universal", color: "text-slate-300" },
  { id: "zip", label: "Zip Archive", ext: ".zip", platform: "Universal", family: "universal", color: "text-slate-300" },
  { id: "iso", label: "Disk Image", ext: ".iso", platform: "Universal", family: "universal", color: "text-slate-300" },
];

export const FAMILY_LABEL: Record<FormatDef["family"], string> = {
  android: "Android",
  linux: "Linux",
  windows: "Windows",
  apple: "Apple",
  jvm: "JVM",
  python: "Python",
  universal: "Universal",
};

export const findFormat = (id: FormatId) => FORMATS.find((f) => f.id === id);

export function detectFormat(name: string): FormatId | null {
  const lower = name.toLowerCase();
  const hit = FORMATS.find((f) => lower.endsWith(f.ext.toLowerCase()));
  return hit ? hit.id : null;
}

export function buildManifest(file: SourceFile): string {
  return [
    `Package: ${file.packageName}`,
    `Version: ${file.version}`,
    `Architecture: ${file.arch}`,
    `Maintainer: ${file.maintainer}`,
    `Description: ${file.description}`,
    `Permissions: ${file.permissions.join(", ")}`,
    "",
    "# عدّل أي قيمة ثم ابدأ التحويل",
  ].join("\n");
}

const SAMPLE_DEX = `// classes.dex (decompiled preview)
package com.noxel.app;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.main);
        Log.i("noxel", "boot ok");
    }
}`;

const SAMPLE_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.noxel.app">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <application android:label="Noxel App" android:icon="@drawable/icon">
        <activity android:name=".MainActivity" android:exported="true" />
    </application>
</manifest>`;

const SAMPLE_CONTROL = `Package: noxel-app
Version: 1.0.0
Section: utils
Priority: optional
Architecture: amd64
Depends: libc6 (>= 2.31), libgtk-3-0
Maintainer: dev@localhost
Description: Converted package
 Built by Noxel universal converter.`;

const SAMPLE_SCRIPT = `#!/bin/sh
set -e
echo "installing noxel-app..."
mkdir -p /opt/noxel-app
cp -r ./payload/* /opt/noxel-app/
ln -sf /opt/noxel-app/noxel-app /usr/bin/noxel-app
echo "done."`;

const SAMPLE_ICON = `# binary asset preview (PNG)
# 512x512 RGBA
# sha256: 9f2a...c41d
# هذا الملف ثنائي — التعديل هنا يغيّر البيانات الوصفية فقط`;

const SAMPLE_README = `# Noxel App

Universal package payload.

- entry: ./noxel-app
- runtime: bundled
- license: MIT
`;

export function makeSourceFile(name: string, format: FormatId): SourceFile {
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  const seed = base.length + name.length;
  const files: PackageFile[] = [
    {
      id: "f1",
      path: "classes.dex",
      kind: "bytecode",
      size: 2_310_000,
      content: SAMPLE_DEX,
      editable: true,
    },
    {
      id: "f2",
      path: "AndroidManifest.xml",
      kind: "manifest",
      size: 6_200,
      content: SAMPLE_MANIFEST,
      editable: true,
    },
    {
      id: "f3",
      path: "DEBIAN/control",
      kind: "control",
      size: 1_120,
      content: SAMPLE_CONTROL,
      editable: true,
    },
    {
      id: "f4",
      path: "DEBIAN/postinst",
      kind: "script",
      size: 840,
      content: SAMPLE_SCRIPT,
      editable: true,
    },
    {
      id: "f5",
      path: "res/drawable/icon.png",
      kind: "resource",
      size: 18_400,
      content: SAMPLE_ICON,
      editable: true,
    },
    {
      id: "f6",
      path: "README.md",
      kind: "doc",
      size: 512,
      content: SAMPLE_README,
      editable: true,
    },
  ];

  return {
    name,
    format,
    packageName: base.toLowerCase() || "unnamed-app",
    version: `1.${seed % 9}.${seed % 5}`,
    arch: format === "apk" || format === "aab" ? "arm64-v8a" : "amd64",
    maintainer: "dev@localhost",
    description: `Converted from ${name}`,
    permissions: ["INTERNET", "READ_EXTERNAL_STORAGE", "VIBRATE", "WRITE_SETTINGS"],
    size: 4_200_000 + seed * 137_000,
    files,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}