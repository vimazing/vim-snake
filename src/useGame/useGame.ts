import { useEffect } from "react";
import type { GameManager, GameOptions } from "../types";
import { useBoard } from "../useBoard";
import { useCursor } from "../useCursor";
import { useFood } from "./useFood";
import { useGameStatus } from "../useGameStatus";
import { useKeyBindings, type UseKeyBindingsType } from "./useKeyBindings";
import { useScore } from "../useScore";

export function useGame(options?: GameOptions, platformHook?: unknown): GameManager {
  const { cols = 30, rows = 20, startingLevel, foodsPerLevel } = options ?? {};

  const boardManager = useBoard();
  const { containerRef, renderBoard } = boardManager;

  const snakeManager = useCursor(cols, rows, boardManager);
  const { changeDirection } = snakeManager;

  const foodManager = useFood(cols, rows, boardManager);

  const gameManager = useGameStatus(boardManager, snakeManager, foodManager, { startingLevel, foodsPerLevel });
  const { gameStatus, setGameStatus, startGame, quitGame, togglePause, score, level } = gameManager;

  useEffect(() => {
    renderBoard(cols, rows);
  }, [cols, rows]);

  const keyBindings: UseKeyBindingsType = useKeyBindings({
    gameManager: {
      gameStatus,
      changeDirection,
    },
  });

  const scoreManager = useScore({ gameStatus, keyLog: keyBindings.keyLog, currentScore: score });

  // Wrap renderBoard to match Unified API signature
  const renderBoardWrapped = () => {
    renderBoard(cols, rows);
  };

  // Build Unified API compliant GameManager
  const gameManagerResult: GameManager = {
    // Required rendering
    containerRef,
    renderBoard: renderBoardWrapped,

    // Required managers
    cursor: snakeManager,
    scoreManager,

    // Required lifecycle
    gameStatus,
    setGameStatus,
    startGame,
    quitGame,

    // Required state
    level,
    score,

    // Required key tracking
    keyLog: keyBindings.keyLog,
    clearKeyLog: keyBindings.clearLog,
    getKeyLog: keyBindings.getLog,

    // Game-specific additions
    togglePause,
  };

  if (typeof platformHook === "function") {
    platformHook(gameManagerResult);
  }

  return gameManagerResult;
}

export type { GameStatus } from "../types";
