# Rank UI Registry Setup Guide

How to configure a project to consume Rank UI registry components directly with `shadcn`.

## 1. Prerequisites

Make sure the project has Tailwind CSS and `components.json` initialized:

```bash
npx shadcn@latest init
```

## 2. Alias Configuration

Update `components.json` to register the Rank UI namespace aliases:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/registry/rank/ui",
    "hooks": "@/registry/rank/hooks"
  }
}
```

## 3. Direct Registry URLs

If you prefer pointing directly to full URLs instead of scoped registry shortcuts:

- Radial Menu: `npx shadcn@latest add https://ui.rankjay.com/r/radial-menu.json`
- AI Orb: `npx shadcn@latest add https://ui.rankjay.com/r/ai-orb.json`
- Liquid Glass: `npx shadcn@latest add https://ui.rankjay.com/r/liquid-glass.json`
- Suite: `npx shadcn@latest add https://ui.rankjay.com/r/ui.json`
