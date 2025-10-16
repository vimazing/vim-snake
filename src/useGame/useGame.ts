import { useEffect } from "react";
import { useRenderer } from "./useRenderer";
import { useSnake } from "./useSnake";
import { useFood } from "./useFood";
import { useGameStatus } from "./useGameStatus";
import { useKeyBindings, type UseKeyBindingsType } from "./useKeyBindings";
import { useScore } from "../useScore";

export function useGame(cols: number, rows: number, platformHook?: unknown) {
  const rendererManager = useRenderer();
  const { containerRef, renderBoard } = rendererManager;

  const snakeManager = useSnake(cols, rows, rendererManager);
  const { changeDirection } = snakeManager;

  const foodManager = useFood(cols, rows, rendererManager);

  const gameManager = useGameStatus(rendererManager, snakeManager, foodManager);
  const { gameStatus, startGame, stopGame, score, level } = gameManager;

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
    score,
    level,
    ...snakeManager,
    ...foodManager,
    ...keyBindings,
    scoreManager,
  };

  if (typeof platformHook === "function") {
    platformHook(fullGameManager);
  }

  return fullGameManager;
}

export type { GameStatus } from "../types";
