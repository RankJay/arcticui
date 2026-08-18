import { ComponentPreview } from "@/components/docs/component-preview";
import { AIOrbDemo } from "@/components/docs/demos/ai-orb-demo";
import { LiquidGlassDemo } from "@/components/docs/demos/liquid-glass-demo";
import { RadialMenuDemo } from "@/components/docs/demos/radial-menu-demo";
import { createGenerator, createFileSystemGeneratorCache } from "fumadocs-typescript";
import { AutoTypeTable, type AutoTypeTableProps } from "fumadocs-typescript/ui";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

const generator = createGenerator({
  cache: createFileSystemGeneratorCache(".next/fumadocs-typescript"),
});

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    AutoTypeTable: (props: Partial<AutoTypeTableProps>) => (
      <AutoTypeTable {...props} generator={generator} />
    ),
    ComponentPreview,
    RadialMenuDemo,
    AIOrbDemo,
    LiquidGlassDemo,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
