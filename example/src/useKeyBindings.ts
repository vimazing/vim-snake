import { useEffect } from "react";
import type { UseGameType } from "@vimazing/vim-maze";

export const useKeyBindings = (gameManager: UseGameType) => {
  const { gameStatus, initGame, stopGame, clearLog, resetCount } = gameManager;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // start game
      if (e.key === "i" || e.key === "I") {
        if (["waiting", "game-over", "game-won"].includes(gameStatus)) {
          clearLog();
          resetCount();
          if (gameStatus === "game-over" || gameStatus === "game-won") {
            stopGame();
            setTimeout(() => initGame(true), 0);
          } else {
            initGame(true);
          }
          return;
        }
      }

      // ignore other keys while waiting
      if (gameStatus === "waiting") return;

      // cancel count or stop game
      if (e.key === "Escape") {
        stopGame();
        resetCount();
        return;
      }

      // quit
      if (e.key === "q" || e.key === "Q") {
        stopGame();
        resetCount();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus, initGame, stopGame, clearLog, resetCount]);
};

