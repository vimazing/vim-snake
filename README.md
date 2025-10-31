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
  const { containerRef, gameStatus, score, level } = useGame();

  return (
    <section className="mx-auto w-fit space-y-4">
      <h1 className="text-2xl font-bold">VIMazing Snake</h1>
      <div className="flex gap-4 justify-center">
        <div>Score: {score}</div>
        <div>Level: {level}</div>
      </div>
      <div ref={containerRef} className="relative" />
      {gameStatus === "game-over" && <p>Game Over! Press Space to restart</p>}
    </section>
  );
}
```

> **Note:** You must manually import the CSS file. The package exports styles but does not auto-import them, giving you control over when and how styles are loaded.

### Default Controls

| Key         | Action              |
| ----------- | ------------------- |
| `Space`     | Start / Restart     |
| `h` / `l`   | Turn left / right   |
| `j` / `k`   | Turn down / up      |
| `q`         | Quit game           |
| `p`         | Pause / unpause     |

### Game Options

Use `GameOptions` to customize the game:

```tsx
const game = useGame({
  cols: 40,                    // Board width (default: 30)
  rows: 25,                    // Board height (default: 20)
  startingLevel: 5,            // Initial level (default: 1)
  foodsPerLevel: 5,            // Foods to level up (default: 10)
  maxLevel: 20,                // Maximum level (default: 25)
  initialSnakeSize: 5,         // Snake segments at start (default: 3)
  initialFoodCount: 2,         // Food items at start (default: 1)
});
```

All options are optional with sensible defaults. Call `useGame()` with no arguments for default settings.

---

## API

### useGame Hook

Main hook that orchestrates all game mechanics:

```ts
const gameManager = useGame(options?, platformHook?);
```

**Parameters:**
- `options` (optional): `GameOptions` object for customization
- `platformHook` (optional): Function to handle platform-specific logic

**Returns:** `GameManager` with:
- `containerRef` – DOM ref for game board rendering
- `gameStatus` – Current state ('waiting' | 'started' | 'game-over' | 'game-won')
- `score` – Current game score
- `level` – Current level (also equals game speed in FPS)
- `scoreManager` – Tracks time, keystrokes, and final score
- `cursor` – Snake manager with movement and state
- `keyLog` – Array of all key presses during game
- Control methods: `startGame()`, `quitGame()`, `togglePause()`, etc.

### gameInfo Export

Get complete game documentation for platforms:

```ts
import { gameInfo } from "@vimazing/vim-snake";

console.log(gameInfo.name);           // "VIMazing Snake"
console.log(gameInfo.controls);       // Control mappings
console.log(gameInfo.scoring);        // Scoring rules
console.log(gameInfo.configuration);  // All GameOptions
```

Perfect for building help screens, settings, and platform integrations.

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
