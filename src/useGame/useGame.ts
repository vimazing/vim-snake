import { useEffect } from "react";
import type { GameManager, GameOptions } from "../types";
import { useBoard } from "../useBoard";
import { useCursor } from "../useCursor";
import { useFood } from "./useFood";
import { useGameStatus } from "../useGameStatus";
import { useKeyBindings, type UseKeyBindingsType } from "./useKeyBindings";
import { useScore } from "../useScore";

export function useGame(options?: GameOptions, platformHook?: unknown): GameManager {
  const {
    cols = 30,
    rows = 20,
    startingLevel,
    foodsPerLevel,
    maxLevel,
    initialSnakeSize,
    initialFoodCount,
    cellSize,
  } = options ?? {};

  const boardManager = useBoard({ cellSize });
  const { containerRef, renderBoard, renderFrame } = boardManager;

  const snakeManager = useCursor(cols, rows, { initialSnakeSize });
  const { changeDirection, snakeBodyRef, directionRef } = snakeManager;

  const foodManager = useFood(cols, rows);

  const gameManager = useGameStatus(boardManager, snakeManager, foodManager, {
    startingLevel,
    foodsPerLevel,
    maxLevel,
    initialFoodCount,
  });
  const { gameStatus, setGameStatus, startGame, quitGame, togglePause, score, level } = gameManager;

  useEffect(() => {
    renderBoard(cols, rows);

    renderFrame({
      snakeBody: snakeBodyRef.current,
      direction: directionRef.current,
      foodPositions: foodManager.foodPositionsRef.current,
      gameOver: false,
      paused: false,
    });
  }, [cols, rows]);

  const keyBindings: UseKeyBindingsType = useKeyBindings({
    gameManager: {
      gameStatus,
      changeDirection,
    },
  });

  const scoreManager = useScore({ gameStatus, keyLog: keyBindings.keyLog, currentScore: score });

  function renderBoardWrapped() {
    renderBoard(cols, rows);
  }

  const gameManagerResult: GameManager = {
    containerRef,
    renderBoard: renderBoardWrapped,

    cursor: snakeManager,
    scoreManager,

    gameStatus,
    setGameStatus,
    startGame,
    quitGame,

    level,
    score,

    keyLog: keyBindings.keyLog,
    clearKeyLog: keyBindings.clearLog,
    getKeyLog: keyBindings.getLog,

    togglePause,
  };

  if (typeof platformHook === "function") {
    platformHook(gameManagerResult);
  }

  return gameManagerResult;
}

export type { GameStatus } from "../types";
