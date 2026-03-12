# arcticui CLI

Add arcticui components to your React + Tailwind project.

**Requirements:** Node 18+, existing React project with Tailwind CSS.

## Quick start

```bash
npx arcticui init
npx arcticui add radial-menu liquid-glass
```

## Commands

### init

Creates `components.json` in your project root and configures paths.

```bash
npx arcticui init
```

### add

Adds one or more components. Run from your project root.

```bash
npx arcticui add <component-name>
npx arcticui add radial-menu ai-orb liquid-glass
```

**Options:**

- `-c, --cwd <path>` — working directory (default: current directory)

## Available components

| Component      | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| `radial-menu`  | Circular menu that expands around the touch point               |
| `ai-orb`       | Audio-reactive orb with pitch detection and mesh gradients      |
| `liquid-glass` | Draggable glass lens using SVG displacement and backdrop-filter |

## Configuration

`init` creates `components.json` with your component path and style preferences. Edit it to change where files are written.

## Links

- [arcticui](https://arcticui-web.vercel.app/) — source & demo

---

[arcticui](https://github.com/RankJay/arcticui)
