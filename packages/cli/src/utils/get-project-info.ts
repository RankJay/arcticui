import * as fs from "fs-extra"
import * as path from "path"

export interface ProjectInfo {
  isMonorepo: boolean
  isTurborepo: boolean
  workspaceRoot: string
  currentWorkspace: string | null
}

export async function getProjectInfo(cwd: string = process.cwd()): Promise<ProjectInfo> {
  let currentDir = cwd
  let workspaceRoot = cwd
  let isMonorepo = false
  let isTurborepo = false

  // Look for turbo.json or root package.json with workspaces
  while (currentDir !== path.parse(currentDir).root) {
    const turboConfigPath = path.join(currentDir, "turbo.json")
    const packageJsonPath = path.join(currentDir, "package.json")

    if (fs.existsSync(turboConfigPath)) {
      isTurborepo = true
      isMonorepo = true
      workspaceRoot = currentDir
      break
    }

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath)
      if (packageJson.workspaces) {
        isMonorepo = true
        workspaceRoot = currentDir
        break
      }
    }

    currentDir = path.dirname(currentDir)
  }

  // Determine current workspace if in monorepo
  let currentWorkspace: string | null = null
  if (isMonorepo && cwd !== workspaceRoot) {
    currentWorkspace = path.relative(workspaceRoot, cwd)
  }

  return {
    isMonorepo,
    isTurborepo,
    workspaceRoot,
    currentWorkspace,
  }
}

export function resolveComponentPath(
  registryPath: string,
  config: any,
  cwd: string = process.cwd()
): string {
  // Replace alias with actual path
  let componentPath = registryPath

  if (componentPath.startsWith("@/components")) {
    componentPath = componentPath.replace("@/components", config.aliases.components)
  }

  // Remove alias prefix and resolve to actual file path
  if (componentPath.startsWith("@/")) {
    componentPath = componentPath.replace("@/", "")
  }

  // Handle different path formats
  if (!componentPath.startsWith("components/") && config.aliases.components.includes("components")) {
    const aliasPath = config.aliases.components.replace("@/", "")
    componentPath = path.join(aliasPath.replace("components", ""), componentPath)
  }

  return path.join(cwd, componentPath)
}

