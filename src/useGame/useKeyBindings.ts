import { useEffect } from "react";
import type { GameStatus, Direction } from "../types";

export type GameBindingContext = {
  gameStatus: GameStatus;
  startGame: () => void;
  stopGame: () => void;
  changeDirection: (dir: Direction) => void;
};

type UseKeyBindingsParams = {
  gameManager: GameBindingContext;
};

export function useKeyBindings({ gameManager }: UseKeyBindingsParams) {
  const { gameStatus, startGame, stopGame, changeDirection } = gameManager;

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (!["started"].includes(gameStatus)) return;

      switch (ev.key) {
        case "h":
        case "H":
          changeDirection("left");
          break;
        case "j":
        case "J":
          changeDirection("down");
          break;
        case "k":
        case "K":
          changeDirection("up");
          break;
        case "l":
        case "L":
          changeDirection("right");
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus, startGame, stopGame, changeDirection]);

  return {};
}

export type UseKeyBindingsType = ReturnType<typeof useKeyBindings>;
