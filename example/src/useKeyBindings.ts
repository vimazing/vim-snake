import { useEffect } from "react";
import type { UseGameType } from "@vimazing/vim-snake";

export const useKeyBindings = (gameManager: UseGameType) => {
  const { gameStatus, startGame, stopGame, clearLog, resetCount } = gameManager;

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {

      // start game
      if (ev.code === "Space") {
        if (["waiting", "game-over", "game-won"].includes(gameStatus)) {
          clearLog();
          resetCount();
          if (gameStatus === "game-over" || gameStatus === "game-won") {
            stopGame();
            setTimeout(() => startGame(), 0);
          } else {
            startGame();
          }
          return;
        }
      }

      // quit
      if (ev.key === "q" || ev.key === "Q") {
        if (gameStatus === "started") {
          stopGame();
          resetCount();
          return;
        }
      }
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [gameStatus, startGame, stopGame, clearLog, resetCount]);
};

