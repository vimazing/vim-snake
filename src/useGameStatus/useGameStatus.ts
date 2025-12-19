import { useState, useEffect, useRef } from "react";
import type { GameStatus } from "../types";
import type { UseBoardType } from "../useBoard";
import type { UseCursorType } from "../useCursor";
import type { UseFoodType } from "../useGame/useFood";

export type UseGameStatusParams = {
  startingLevel?: number;
  foodsPerLevel?: number;
  maxLevel?: number;
  initialFoodCount?: number;
};

export function useGameStatus(
  boardManager: UseBoardType,
  snakeManager: UseCursorType,
  foodManager: UseFoodType,
  params?: UseGameStatusParams
) {
  const startingLevel = params?.startingLevel ?? 1;
  const foodsPerLevel = params?.foodsPerLevel ?? 10;
  const maxLevel = params?.maxLevel ?? 25;
  const initialFoodCount = params?.initialFoodCount ?? 1;

  const { renderFrame, spawnFoodParticles } = boardManager;
  const { initSnake, clearSnake, snakeBodyRef } = snakeManager;
  const { spawnFood, clearFood } = foodManager;

  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(startingLevel);
  const [paused, setPaused] = useState(false);

  const levelRef = useRef(startingLevel);
  const foodsEatenRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastGameTickRef = useRef<number>(0);
  const shouldGrowRef = useRef(false);
  const gameOverRef = useRef(false);

  const snakeManagerRef = useRef(snakeManager);
  const foodManagerRef = useRef(foodManager);
  const pausedRef = useRef(false);

  snakeManagerRef.current = snakeManager;
  foodManagerRef.current = foodManager;

  function startGame() {
    initSnake();
    spawnFood(snakeBodyRef.current, initialFoodCount);
    setScore(0);
    setLevel(startingLevel);
    levelRef.current = startingLevel;
    foodsEatenRef.current = 0;
    shouldGrowRef.current = false;
    gameOverRef.current = false;
    setGameStatus("started");
  }

  function stopGame() {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    clearSnake();
    clearFood();
    gameOverRef.current = false;
    setGameStatus("waiting");
  }

  function togglePause() {
    setPaused((curr) => {
      pausedRef.current = !curr;
      return !curr;
    });
  }

  useEffect(() => {
    if (gameStatus !== "started") return;

    lastGameTickRef.current = performance.now();

    function gameLoop(timestamp: number) {
      const msPerTick = 1000 / levelRef.current;
      const elapsed = timestamp - lastGameTickRef.current;

      if (!pausedRef.current && !gameOverRef.current) {
        if (elapsed >= msPerTick) {
          snakeManagerRef.current.applyBufferedDirection();

          const result = snakeManagerRef.current.moveSnake(shouldGrowRef.current);
          shouldGrowRef.current = false;

          if (result === "wall-collision" || result === "self-collision") {
            gameOverRef.current = true;
            setGameStatus("game-over");
          } else {
            const head = snakeManagerRef.current.snakeBodyRef.current[0];
            if (head && foodManagerRef.current.checkFoodCollision(head)) {
              spawnFoodParticles(head);
              foodManagerRef.current.removeFood(head);
              shouldGrowRef.current = true;

              const willLevelUp = foodsEatenRef.current + 1 >= foodsPerLevel;
              foodsEatenRef.current += 1;

              const pointsToAdd = levelRef.current;

              if (willLevelUp && levelRef.current < maxLevel) {
                const newLevel = levelRef.current + 1;
                levelRef.current = newLevel;
                setLevel(newLevel);
                foodsEatenRef.current = 0;
              }

              setScore((prev) => prev + pointsToAdd);

              foodManagerRef.current.spawnFood(
                snakeManagerRef.current.snakeBodyRef.current,
                1
              );
            }
          }

          lastGameTickRef.current = timestamp;
        }
      }

      renderFrame({
        snakeBody: snakeManagerRef.current.snakeBodyRef.current,
        direction: snakeManagerRef.current.directionRef.current,
        foodPositions: foodManagerRef.current.foodPositionsRef.current,
        gameOver: gameOverRef.current,
        paused: pausedRef.current,
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === "game-over" || gameStatus === "waiting") {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
  }, [gameStatus]);

  return {
    gameStatus,
    setGameStatus,
    startGame,
    stopGame,
    quitGame: stopGame,
    paused,
    togglePause,
    score,
    level,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
export type { GameStatus } from "../types";
