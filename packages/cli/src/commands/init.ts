import prompts from "prompts";
import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import { logger } from "../utils/logger";
import { getConfig, writeConfig, type Config } from "../utils/get-config";
import { getProjectInfo } from "../utils/get-project-info";

export async function init(cwd: string = process.cwd()) {
  logger.info("Initializing arcticui...");
  logger.break();

  // Check if config already exists
  const existingConfig = await getConfig(cwd);
  if (existingConfig) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: "components.json already exists. Overwrite?",
      initial: false,
    });

    if (!overwrite) {
      logger.info("Initialization cancelled.");
      return;
    }
  }

  // Get project info
  const projectInfo = await getProjectInfo(cwd);

  if (projectInfo.isTurborepo && projectInfo.currentWorkspace) {
    logger.info(
      `Detected Turborepo workspace: ${chalk.cyan(projectInfo.currentWorkspace)}`,
    );
    logger.break();
  }

  // Prompt user for configuration
  const options = await prompts([
    {
      type: "select",
      name: "typescript",
      message: "Would you like to use TypeScript?",
      choices: [
        { title: "Yes", value: true },
        { title: "No", value: false },
      ],
      initial: 0,
    },
    {
      type: "select",
      name: "style",
      message: "Which style would you like to use?",
      choices: [
        { title: "Default", value: "default" },
        { title: "New York", value: "new-york" },
      ],
      initial: 0,
    },
    {
      type: "text",
      name: "tailwindConfig",
      message: "Where is your tailwind.config file located?",
      initial: "tailwind.config.ts",
    },
    {
      type: "text",
      name: "tailwindCss",
      message: "Where is your global CSS file?",
      initial: "app/globals.css",
    },
    {
      type: "select",
      name: "baseColor",
      message: "Choose a base color for your components:",
      choices: [
        { title: "Slate", value: "slate" },
        { title: "Gray", value: "gray" },
        { title: "Zinc", value: "zinc" },
        { title: "Neutral", value: "neutral" },
        { title: "Stone", value: "stone" },
      ],
      initial: 0,
    },
    {
      type: "text",
      name: "components",
      message: "Configure the import alias for components:",
      initial: "@/components",
    },
    {
      type: "text",
      name: "utils",
      message: "Configure the import alias for utils:",
      initial: "@/lib/utils",
    },
  ]);

  // Check if user cancelled
  if (!options.typescript) {
    logger.error("Initialization cancelled.");
    return;
  }

  // Create config object
  const config: Config = {
    $schema: "https://ui.rankjay.com/schema.json",
    style: options.style,
    typescript: options.typescript,
    tailwind: {
      config: options.tailwindConfig,
      css: options.tailwindCss,
      baseColor: options.baseColor,
    },
    aliases: {
      components: options.components,
      utils: options.utils,
    },
  };

  // Write config file
  await writeConfig(config, cwd);

  logger.break();
  logger.success("Configuration saved to components.json");
  logger.break();
  logger.info("You can now start adding components:");
  logger.info(`  ${chalk.cyan("npx arcticui add radial-menu")}`);
  logger.break();
}
