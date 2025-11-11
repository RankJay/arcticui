#!/usr/bin/env node

import { Command } from "commander"
import { init } from "./commands/init"
import { add } from "./commands/add"
import packageJson from "../package.json"

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
  const program = new Command()
    .name("elasticui")
    .description("Add elasticui components to your project")
    .version(
      packageJson.version || "0.1.0",
      "-v, --version",
      "display the version number"
    )

  program
    .command("init")
    .description("Initialize your project and create components.json")
    .option("-c, --cwd <cwd>", "the working directory", process.cwd())
    .action(async (options) => {
      await init(options.cwd)
    })

  program
    .command("add")
    .description("Add components to your project")
    .argument("[components...]", "the components to add")
    .option("-c, --cwd <cwd>", "the working directory", process.cwd())
    .option("-a, --all", "install all available components", false)
    .action(async (components: string[], options) => {
      if (options.all) {
        // Future: Add all components
        console.log("Installing all components is not yet supported")
        return
      }

      if (!components || components.length === 0) {
        console.error("Please specify at least one component to add")
        console.log("Example: npx elasticui add radial-menu")
        process.exit(1)
      }

      await add(components, options.cwd)
    })

  program.parse()
}

main()

