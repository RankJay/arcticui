import * as fs from "fs-extra";
import * as path from "path";
import { z } from "zod";

export const configSchema = z.object({
  $schema: z.string().optional(),
  style: z.string(),
  typescript: z.boolean().default(true),
  tailwind: z.object({
    config: z.string(),
    css: z.string(),
    baseColor: z.string(),
  }),
  aliases: z.object({
    components: z.string(),
    utils: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

export async function getConfig(
  cwd: string = process.cwd(),
): Promise<Config | null> {
  try {
    const configPath = path.join(cwd, "components.json");

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const config = await fs.readJSON(configPath);
    return configSchema.parse(config);
  } catch (error) {
    return null;
  }
}

export async function writeConfig(
  config: Config,
  cwd: string = process.cwd(),
): Promise<void> {
  const configPath = path.join(cwd, "components.json");
  await fs.writeJSON(configPath, config, { spaces: 2 });
}
