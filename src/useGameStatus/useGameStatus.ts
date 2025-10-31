import { useState, useEffect, useRef } from "react";
import type { GameStatus } from "../types";
import type { UseBoardType } from "../useBoard";
import type { UseCursorType } from "../useCursor";
import type { UseFoodType } from "../useGame/useFood";

export type UseGameStatusParams = {
  startingLevel?: number;
  foodsPerLevel?: number;
  maxLevel?: number;
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
  const { containerRef } = boardManager;
  const { initSnake, clearSnake, snakeBodyRef } = snakeManager;
  const { spawnFood, clearFood } = foodManager;
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(startingLevel);
  const [paused, setPaused] = useState(false);
  const levelRef = useRef(startingLevel);
  const foodsEatenRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const snakeManagerRef = useRef(snakeManager);
  const foodManagerRef = useRef(foodManager);

  snakeManagerRef.current = snakeManager;
  foodManagerRef.current = foodManager;

  const startGame = () => {
    initSnake();
    spawnFood(snakeBodyRef.current, 3);
    setScore(0);
    setLevel(startingLevel);
    levelRef.current = startingLevel;
    foodsEatenRef.current = 0;
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
         const msPerFrame = 1000 / levelRef.current;
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

              // Check BEFORE incrementing if we're about to level up
              const willLevelUp = (foodsEatenRef.current + 1) >= foodsPerLevel;

               foodsEatenRef.current += 1;

               // Save the current level BEFORE any changes
               const pointsToAdd = levelRef.current;
               
               // Update level OUTSIDE of setScore to avoid multiple triggers
               if (willLevelUp && levelRef.current < maxLevel) {
                 const newLevel = levelRef.current + 1;
                 levelRef.current = newLevel;
                 setLevel(newLevel);
                 foodsEatenRef.current = 0;
               }

               setScore((prev) => {
                 // Add points at CURRENT level
                 let newScore = prev + pointsToAdd;

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
