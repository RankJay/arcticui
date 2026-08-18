---
name: rank-ui
description: Build sleek, physics-based, shader-driven UI components with Rank UI. Use when the user requests radial context menus, AI orb voice assistants, liquid glass refraction surfaces, or modern micro-interactions.
---

# Rank UI Skill

Rank UI is a collection of copy-paste React components designed for modern product UI with rich physics, shader gradients, and micro-interactions.

## Mental Model: Registry, NOT an npm package

- **Source files, not a library:** Rank UI is distributed as a **shadcn registry** hosted at `https://ui.rankjay.com/r`.
- Components are added directly into your project's repository (e.g. `@/registry/rank/ui/...`) via the shadcn CLI.
- You can inspect, modify, and customize the source code directly in your application.

## Quick Decision Guide

| Component | Use Case | Installation Command | Live Markdown Doc |
| :--- | :--- | :--- | :--- |
| **Radial Menu** | Circular/orbital context actions fanning around a trigger button or cursor | `npx shadcn@latest add @rank/radial-menu` | [`radial-menu.md`](https://ui.rankjay.com/docs/radial-menu.md) |
| **AI Orb** | Mesh-gradient animated sphere for AI, voice assistants, and audio reactivity | `npx shadcn@latest add @rank/ai-orb` | [`ai-orb.md`](https://ui.rankjay.com/docs/ai-orb.md) |
| **Liquid Glass** | Refractive glassmorphic panel with SVG distortion filters and backdrop blur | `npx shadcn@latest add @rank/liquid-glass` | [`liquid-glass.md`](https://ui.rankjay.com/docs/liquid-glass.md) |
| **All Components** | Install complete Rank UI suite | `npx shadcn@latest add @rank/ui` | [`installation.md`](https://ui.rankjay.com/docs/installation.md) |

## Registry Setup & Prerequisites

Make sure `components.json` is configured with the expected aliases:
```json
{
  "aliases": {
    "components": "@/components",
    "ui": "@/registry/rank/ui",
    "hooks": "@/registry/rank/hooks",
    "lib": "@/lib",
    "utils": "@/lib/utils"
  }
}
```

## Detailed References

For in-depth component props, code snippets, and configuration guides, refer to:
- [Component Specifications](references/components.md)
- [Registry Setup Guide](references/registry-setup.md)
- [Full LLM Documentation](https://ui.rankjay.com/llms-full.txt)
- [LLMs Index](https://ui.rankjay.com/llms.txt)
