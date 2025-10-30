import { useState, useEffect, useRef } from "react";
import type { GameStatus } from "../types";
import type { UseBoardType } from "../useBoard";
import type { UseCursorType } from "../useCursor";
import type { UseFoodType } from "../useGame/useFood";

const INITIAL_FPS = 12;
const FOODS_PER_LEVEL = 2;

export function useGameStatus(
  boardManager: UseBoardType,
  snakeManager: UseCursorType,
  foodManager: UseFoodType
) {
  const { containerRef } = boardManager;
  const { initSnake, clearSnake, snakeBodyRef } = snakeManager;
  const { spawnFood, clearFood } = foodManager;
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const levelRef = useRef(1);
  const foodsEatenRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const snakeManagerRef = useRef(snakeManager);
  const foodManagerRef = useRef(foodManager);
  const currentFpsRef = useRef(INITIAL_FPS);

  snakeManagerRef.current = snakeManager;
  foodManagerRef.current = foodManager;

  const startGame = () => {
    initSnake();
    spawnFood(snakeBodyRef.current, 3);
    setScore(0);
    setLevel(1);
    levelRef.current = 1;
    foodsEatenRef.current = 0;
    currentFpsRef.current = INITIAL_FPS;
    setGameStatus("started");
  };

  const stopGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    clearSnake();
    clearFood();
    setGameStatus("waiting");
     const container = containerRef.current;
     container?.querySelectorAll(".snake-head, .snake-body, .snake-tail, .collision").forEach((el: Element) => {
       (el as HTMLElement).classList.remove("snake-head", "snake-body", "snake-tail", "collision");
     });
  };

  useEffect(() => {
    if (gameStatus === "started") {
      if (paused) return;
      let shouldGrow = false;
      lastUpdateRef.current = performance.now();

      const gameLoop = (timestamp: number) => {
        const msPerFrame = 1000 / currentFpsRef.current;
        const elapsed = timestamp - lastUpdateRef.current;

        if (elapsed >= msPerFrame) {
          // Apply any buffered direction input BEFORE moving
          snakeManagerRef.current.applyBufferedDirection();

          const result = snakeManagerRef.current.moveSnake(shouldGrow);

          shouldGrow = false;

          if (result === "wall-collision" || result === "self-collision") {
            const container = containerRef.current;
            container?.querySelectorAll(".snake-head, .snake-body, .snake-tail").forEach((el: Element) => {
              (el as HTMLElement).classList.add("collision");
            });
            setGameStatus("game-over");
            return;
          }

          const head = snakeManagerRef.current.snakeBodyRef.current[0];
          if (head && foodManagerRef.current.checkFoodCollision(head)) {
            foodManagerRef.current.removeFood(head);
            shouldGrow = true;

            foodsEatenRef.current += 1;

            setScore((prev) => {
              let newScore = prev + levelRef.current;
              if (foodsEatenRef.current >= FOODS_PER_LEVEL) {
                const newLevel = levelRef.current + 1;
                levelRef.current = newLevel;
                setLevel(newLevel);
                currentFpsRef.current = INITIAL_FPS + (newLevel - 1);
                foodsEatenRef.current = 0;
              }

              foodManagerRef.current.spawnFood(
                snakeManagerRef.current.snakeBodyRef.current,
                1
              );
              return newScore;
            });

          }

          lastUpdateRef.current = timestamp;
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };

      gameLoopRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      };
    }
  }, [gameStatus, paused]);

  useEffect(() => {
    if (gameStatus === "game-over") {
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
    togglePause: () => setPaused(curr => !curr),
    score,
    level,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
export type { GameStatus } from "../types";
