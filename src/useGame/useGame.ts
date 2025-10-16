import { useEffect } from "react";
import { useRenderer } from "./useRenderer";
import { useSnake } from "./useSnake";
import { useGameStatus } from "./useGameStatus";
import { useKeyBindings, type UseKeyBindingsType } from "./useKeyBindings";
import { useScore } from "../useScore";

export function useGame(cols: number, rows: number, platformHook?: unknown) {
  const rendererManager = useRenderer();
  const { containerRef, renderBoard } = rendererManager;

  const snakeManager = useSnake(cols, rows, rendererManager);
  const { changeDirection } = snakeManager;

  const gameManager = useGameStatus(rendererManager, snakeManager);
  const { gameStatus, startGame, stopGame } = gameManager;

  useEffect(() => {
    renderBoard(cols, rows);
  }, [cols, rows]);

  const keyBindings: UseKeyBindingsType = useKeyBindings({
    gameManager: {
      gameStatus,
      changeDirection,
    },
  });

  const scoreManager = useScore({ gameStatus });

  const fullGameManager = {
    containerRef,
    gameStatus,
    startGame,
    stopGame,
    ...snakeManager,
    ...keyBindings,
    scoreManager,
  };

  if (typeof platformHook === "function") {
    platformHook(fullGameManager);
  }

  return fullGameManager;
}

export type { GameStatus } from "../types";
