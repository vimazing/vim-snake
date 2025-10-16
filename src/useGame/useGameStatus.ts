import { useState, useEffect, useRef } from "react";
import type { GameStatus } from "../types";
import type { UseRendererType } from "./useRenderer";
import type { UseSnakeType } from "./useSnake";
import type { UseFoodType } from "./useFood";

const FRAMES_PER_SECOND = 5;

export function useGameStatus(
  rendererManager: UseRendererType,
  snakeManager: UseSnakeType,
  foodManager: UseFoodType
) {
  const { containerRef } = rendererManager;
  const { initSnake, clearSnake, snakeBodyRef } = snakeManager;
  const { spawnFood, clearFood } = foodManager;
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [score, setScore] = useState(0);
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
    container?.querySelectorAll(".snake-head, .snake-body, .snake-tail").forEach((el) => {
      el.classList.remove("snake-head", "snake-body", "snake-tail");
    });
  };

  useEffect(() => {
    console.log("useGameStatus effect - gameStatus:", gameStatus);
    if (gameStatus === "started") {
      console.log("Starting game loop");
      
      let shouldGrow = false;
      const msPerFrame = 1000 / FRAMES_PER_SECOND;
      lastUpdateRef.current = performance.now();

      const gameLoop = (timestamp: number) => {
        const elapsed = timestamp - lastUpdateRef.current;

        if (elapsed >= msPerFrame) {
          console.log("Game loop tick");
          const result = snakeManagerRef.current.moveSnake(shouldGrow);
          console.log("Move result:", result);
          
          shouldGrow = false;
          
          if (result === "wall-collision") {
            setGameStatus("game-over");
            return;
          }

          const head = snakeManagerRef.current.snakeBodyRef.current[0];
          if (head && foodManagerRef.current.checkFoodCollision(head)) {
            console.log("Food eaten!");
            foodManagerRef.current.removeFood(head);
            shouldGrow = true;
            setScore((prev) => prev + 1);
            foodManagerRef.current.spawnFood(
              snakeManagerRef.current.snakeBodyRef.current,
              1
            );
          }

          lastUpdateRef.current = timestamp;
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };

      gameLoopRef.current = requestAnimationFrame(gameLoop);

      return () => {
        console.log("Cleaning up game loop");
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      };
    }
  }, [gameStatus]);

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
    score,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
export type { GameStatus } from "../types";
