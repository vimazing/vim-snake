import { useEffect } from "react";
import type { UseGameType } from "@vimazing/vim-snake";

export const useKeyBindings = (gameManager: UseGameType) => {
  const { gameStatus, startGame, stopGame, clearLog, resetCount } = gameManager;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      console.log("key pressed:", e.key, e.code);
      // start game
      if (e.code === "Space") {
        if (["waiting", "game-over", "game-won"].includes(gameStatus)) {
          // clearLog();
          // resetCount();
          if (gameStatus === "game-over" || gameStatus === "game-won") {
            stopGame();
            // setTimeout(() => initGame(true), 0);
          } else {
            startGame();
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
  }, [gameStatus, startGame, stopGame, clearLog, resetCount]);
};

