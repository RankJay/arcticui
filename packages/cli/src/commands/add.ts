import ora from "ora"
import * as fs from "fs-extra"
import * as path from "path"
import chalk from "chalk"
import { execa } from "execa"
import { logger } from "../utils/logger"
import { getConfig } from "../utils/get-config"
import { resolveComponentPath } from "../utils/get-project-info"
import { transformImports } from "../utils/transformers"
import { getRegistryItem, getAllComponents, type RegistryItem } from "../registry"

export async function add(components: string[], cwd: string = process.cwd()) {
  // Check if config exists
  const config = await getConfig(cwd)
  if (!config) {
    logger.error("Configuration not found. Please run 'init' first:")
    logger.info(`  ${chalk.cyan("npx arcticui init")}`)
    return
  }

  // Validate components
  const availableComponents = getAllComponents()
  const invalidComponents = components.filter(
    (name) => !availableComponents.includes(name)
  )

  if (invalidComponents.length > 0) {
    logger.error(`Invalid component(s): ${invalidComponents.join(", ")}`)
    logger.info(`Available components: ${availableComponents.join(", ")}`)
    return
  }

  const spinner = ora("Preparing components...").start()

  try {
    // Collect all registry items (including dependencies)
    const registryItems: RegistryItem[] = []
    const processedComponents = new Set<string>()

    async function collectDependencies(componentName: string) {
      if (processedComponents.has(componentName)) {
        return
      }

      const item = getRegistryItem(componentName)
      if (!item) {
        throw new Error(`Component "${componentName}" not found in registry`)
      }

      processedComponents.add(componentName)
      registryItems.push(item)

      // Recursively collect registry dependencies
      if (item.registryDependencies && item.registryDependencies.length > 0) {
        for (const dep of item.registryDependencies) {
          await collectDependencies(dep)
        }
      }
    }

    for (const component of components) {
      await collectDependencies(component)
    }

    // Collect all npm dependencies
    const allDependencies = [
      ...new Set(registryItems.flatMap((item) => item.dependencies || [])),
    ]

    // Install npm dependencies if any
    if (allDependencies.length > 0) {
      spinner.text = "Installing dependencies..."
      try {
        await execa("npm", ["install", ...allDependencies], { cwd })
      } catch (error) {
        spinner.warn("Failed to install some dependencies. You may need to install them manually.")
      }
    }

    // Write component files
    spinner.text = "Adding components..."
    
    for (const item of registryItems) {
      for (const file of item.files) {
        const targetPath = resolveComponentPath(file.path, config, cwd)

        // Transform imports based on config
        const transformedContent = await transformImports(file.content, config)

        // Ensure directory exists
        await fs.ensureDir(path.dirname(targetPath))

        // Write file
        await fs.writeFile(targetPath, transformedContent, "utf-8")

        spinner.succeed(`Added ${chalk.green(item.name)}`)
        spinner.start()
      }
    }

    spinner.stop()
    logger.break()
    logger.success(`Successfully added ${components.length} component(s)!`)
    
    // Show where components were added
    logger.break()
    logger.info("Components added to:")
    for (const item of registryItems) {
      for (const file of item.files) {
        const targetPath = resolveComponentPath(file.path, config, cwd)
        const relativePath = path.relative(cwd, targetPath)
        logger.info(`  ${chalk.cyan(relativePath)}`)
      }
    }
    logger.break()

  } catch (error) {
    spinner.fail("Failed to add components")
    if (error instanceof Error) {
      logger.error(error.message)
    }
    process.exit(1)
  }
}

