import { useEffect } from "react";
import { useBoard } from "../useBoard";
import { useCursor } from "../useCursor";
import { useFood } from "./useFood";
import { useGameStatus } from "../useGameStatus";
import { useKeyBindings, type UseKeyBindingsType } from "./useKeyBindings";
import { useScore } from "../useScore";

export function useGame(cols: number, rows: number, platformHook?: unknown) {
  const boardManager = useBoard();
  const { containerRef, renderBoard } = boardManager;

  const snakeManager = useCursor(cols, rows, boardManager);
  const { changeDirection } = snakeManager;

  const foodManager = useFood(cols, rows, boardManager);

  const gameManager = useGameStatus(boardManager, snakeManager, foodManager);
  const { gameStatus, startGame, stopGame, togglePause, score, level } = gameManager;

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
    togglePause,
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
