# @vimazing/vim-snake

Lightweight, typed **React hooks** and utilities for building interactive snake games with VIM-inspired controls.

Part of the [VIMazing](https://vimazing.com) project - [GitHub](https://github.com/andrepadez/vimazing-vimaze).

---

## Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Hooks](#core-hooks)
- [Utilities](#utilities)
- [Example App](#example-app)
- [Build & Release](#build--release)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features
- **Drop-in hooks** for snake game mechanics, scoring, and key logging.
- **Typed API** with generated declaration files for editor IntelliSense.
- **VIM-style controls** (`h`, `j`, `k`, `l` for direction changes).
- **Composable architecture** – bring your own rendering and platform-specific bindings.
- **Tree-shakeable exports** to keep bundles lean.

---

## Installation

Using **npm**:

```bash
npm install @vimazing/vim-snake
```

Or with **bun**:

```bash
bun add @vimazing/vim-snake
```

---

## Quick Start

```tsx
import { useEffect } from "react";
import { useGame } from "@vimazing/vim-snake";
import "@vimazing/vim-snake/game.css";

export function SnakeGame() {
  const { containerRef, gameStatus, startGame } = useGame(30, 20);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <section className="mx-auto w-fit space-y-4">
      <h1 className="text-2xl font-bold">VIMazing Snake</h1>
      <div ref={containerRef} className="relative" />
      {gameStatus === "game-won" && <p>🎉 You won!</p>}
    </section>
  );
}
```

> **Note:** You must manually import the CSS file. The package exports styles but does not auto-import them, giving you control over when and how styles are loaded.

Default controls:

| Key                 | Action          |
| ------------------- | --------------- |
| `i`                 | Start game      |
| `h` / `j` / `k` / `l` | Change direction |
| `q`                 | Quit game       |
| `Esc`               | Cancel / pause  |

---

## Core Hooks

| Hook | Description |
| ---- | ----------- |
| `useGame(cols, rows, platformHook?)` | One-stop hook that wires board rendering, snake state, food spawning, scoring, and keyboard bindings. Returns refs, status helpers, and managers you can compose with your UI. |
| `useScore()` | Tracks timers, level progression, and final score calculation. |

Each hook is exported individually, so you can cherry-pick only what you need:

```ts
import { useScore } from "@vimazing/vim-snake/useScore";
```

---

## Utilities

Besides the hooks, the library exports:

- `types` – shared TypeScript types such as `GameStatus`, `Direction`, and `Position`.

```ts
import { GameStatus } from "@vimazing/vim-snake";
```

---

## Example App

A demo application lives under `example/` and consumes the package directly.

```bash
cd example
bun install
bun run dev
```

During local development the Vite config aliases `@vimazing/vim-snake` to the source folder so you can iterate without rebuilding. When publishing, run the build first (see below) so editors consume the generated declarations in `dist/`.

---

## Build & Release

Build the distributable bundle and type declarations:

```bash
bun run build
```

This writes JavaScript, type definitions, and styles to `dist/`. The `prepublishOnly` hook reuses the same command to guarantee fresh artifacts before publishing.

---

## License

MIT © [André Padez](https://github.com/andrepadez)

---

## Acknowledgements

Classic Snake game reimagined for the VIMazing platform with Vim-style controls.
