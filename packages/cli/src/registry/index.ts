import * as fs from "fs";
import * as path from "path";

export interface RegistryItem {
  name: string;
  type: "components:ui" | "components:component" | "components:example";
  files: Array<{
    path: string;
    content: string;
    type: "registry:ui" | "registry:component" | "registry:example";
  }>;
  dependencies?: string[];
  registryDependencies?: string[];
}

export interface Registry {
  [key: string]: RegistryItem;
}

// Helper function to read component files
function readComponentFile(
  componentName: string,
  extension: string = ".tsx",
): string {
  const filePath = path.join(
    __dirname,
    "components",
    `${componentName}${extension}`,
  );
  return fs.readFileSync(filePath, "utf-8");
}

export const registry: Registry = {
  "radial-menu": {
    name: "radial-menu",
    type: "components:ui",
    files: [
      {
        path: "components/ui/radial-menu.tsx",
        content: readComponentFile("radial-menu"),
        type: "registry:ui",
      },
    ],
    dependencies: ["motion"],
    registryDependencies: [],
  },
  "ai-orb": {
    name: "ai-orb",
    type: "components:ui",
    files: [
      {
        path: "components/ui/ai-orb.tsx",
        content: readComponentFile("ai-orb", ".tsx"),
        type: "registry:ui",
      },
      {
        path: "components/ui/use-audio-pitch.ts",
        content: readComponentFile("use-audio-pitch", ".ts"),
        type: "registry:ui",
      },
    ],
    dependencies: ["@paper-design/shaders-react@^0.0.71"],
    registryDependencies: [],
  },
  "liquid-glass": {
    name: "liquid-glass",
    type: "components:ui",
    files: [
      {
        path: "components/ui/liquid-glass.tsx",
        content: readComponentFile("liquid-glass"),
        type: "registry:ui",
      },
    ],
    dependencies: [],
    registryDependencies: [],
  },
};

export function getRegistryItem(name: string): RegistryItem | null {
  return registry[name] || null;
}

export function getAllComponents(): string[] {
  return Object.keys(registry);
}
