import { Project, SourceFile } from "ts-morph";
import type { Config } from "./get-config";

export async function transformImports(
  content: string,
  config: Config,
): Promise<string> {
  try {
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        jsx: 1, // JsxPreserve
      },
    });

    const sourceFile = project.createSourceFile("temp.tsx", content);

    // Transform import declarations
    sourceFile.getImportDeclarations().forEach((importDecl) => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();

      // Replace component alias
      if (moduleSpecifier.startsWith("@/components")) {
        importDecl.setModuleSpecifier(
          moduleSpecifier.replace("@/components", config.aliases.components),
        );
      }

      // Replace utils alias
      if (moduleSpecifier.startsWith("@/lib/utils")) {
        importDecl.setModuleSpecifier(
          moduleSpecifier.replace("@/lib/utils", config.aliases.utils),
        );
      }
    });

    return sourceFile.getFullText();
  } catch (error) {
    // If transformation fails, return original content
    console.warn("Failed to transform imports, using original content");
    return content;
  }
}

export function replaceAliasPath(
  content: string,
  alias: string,
  replacement: string,
): string {
  return content.replace(new RegExp(alias, "g"), replacement);
}
