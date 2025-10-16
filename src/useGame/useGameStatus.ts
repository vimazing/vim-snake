import { useState, useEffect, useRef } from "react";
import type { GameStatus } from "../types";
import type { UseRendererType } from "./useRenderer";
import type { UseSnakeType } from "./useSnake";
import type { UseFoodType } from "./useFood";

const INITIAL_FPS = 5;
const FOODS_PER_LEVEL = 2;

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
  const [level, setLevel] = useState(1);
  const foodsEatenRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const snakeManagerRef = useRef(snakeManager);
  const foodManagerRef = useRef(foodManager);
  const currentFpsRef = useRef(INITIAL_FPS);
  const collisionGracePeriodRef = useRef(false);

  snakeManagerRef.current = snakeManager;
  foodManagerRef.current = foodManager;

  const startGame = () => {
    initSnake();
    spawnFood(snakeBodyRef.current, 3);
    setScore(0);
    setLevel(1);
    foodsEatenRef.current = 0;
    currentFpsRef.current = INITIAL_FPS;
    collisionGracePeriodRef.current = false;
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
    container?.querySelectorAll(".snake-head, .snake-body, .snake-tail, .collision").forEach((el) => {
      el.classList.remove("snake-head", "snake-body", "snake-tail", "collision");
    });
  };

  useEffect(() => {
    console.log("useGameStatus effect - gameStatus:", gameStatus);
    if (gameStatus === "started") {
      console.log("Starting game loop");
      
      let shouldGrow = false;
      lastUpdateRef.current = performance.now();

      const gameLoop = (timestamp: number) => {
        const msPerFrame = 1000 / currentFpsRef.current;
        const elapsed = timestamp - lastUpdateRef.current;

        if (elapsed >= msPerFrame) {
          console.log("Game loop tick");
          const result = snakeManagerRef.current.moveSnake(shouldGrow);
          console.log("Move result:", result);
          
          shouldGrow = false;
          
          if (result === "wall-collision" || result === "self-collision") {
            if (collisionGracePeriodRef.current) {
              const container = containerRef.current;
              container?.querySelectorAll(".snake-head, .snake-body, .snake-tail").forEach((el) => {
                el.classList.add("collision");
              });
              setGameStatus("game-over");
              return;
            } else {
              collisionGracePeriodRef.current = true;
              lastUpdateRef.current = timestamp;
              gameLoopRef.current = requestAnimationFrame(gameLoop);
              return;
            }
          }
          
          collisionGracePeriodRef.current = false;

          const head = snakeManagerRef.current.snakeBodyRef.current[0];
          if (head && foodManagerRef.current.checkFoodCollision(head)) {
            console.log("Food eaten!");
            foodManagerRef.current.removeFood(head);
            shouldGrow = true;
            
            foodsEatenRef.current += 1;
            
            if (foodsEatenRef.current >= FOODS_PER_LEVEL) {
              setLevel((lvl) => {
                const newLevel = lvl + 1;
                currentFpsRef.current = INITIAL_FPS + (newLevel - 1);
                console.log(`Level up! Level ${newLevel}, FPS: ${currentFpsRef.current}`);
                return newLevel;
              });
              foodsEatenRef.current = 0;
            }
            
            setScore((prev) => prev + level);
            
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
    level,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
export type { GameStatus } from "../types";
