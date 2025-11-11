import * as fs from "fs"
import * as path from "path"

export interface RegistryItem {
  name: string
  type: "components:ui" | "components:component" | "components:example"
  files: Array<{
    path: string
    content: string
    type: "registry:ui" | "registry:component" | "registry:example"
  }>
  dependencies?: string[]
  registryDependencies?: string[]
}

export interface Registry {
  [key: string]: RegistryItem
}

// Helper function to read component files
function readComponentFile(componentName: string): string {
  const filePath = path.join(__dirname, "components", `${componentName}.tsx`)
  return fs.readFileSync(filePath, "utf-8")
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
}

export function getRegistryItem(name: string): RegistryItem | null {
  return registry[name] || null
}

export function getAllComponents(): string[] {
  return Object.keys(registry)
}

