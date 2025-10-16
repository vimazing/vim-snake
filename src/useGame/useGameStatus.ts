import { useState, useEffect, useRef } from "react";
import type { GameStatus } from "../types";
import type { UseRendererType } from "./useRenderer";
import type { UseSnakeType } from "./useSnake";

const INITIAL_SPEED = 200;

export function useGameStatus(
  rendererManager: UseRendererType,
  snakeManager: UseSnakeType
) {
  const { containerRef } = rendererManager;
  const { initSnake, clearSnake } = snakeManager;
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const snakeManagerRef = useRef(snakeManager);

  snakeManagerRef.current = snakeManager;

  const startGame = () => {
    initSnake();
    setGameStatus("started");
  };

  const stopGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    clearSnake();
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
      gameLoopRef.current = setInterval(() => {
        console.log("Game loop tick");
        const result = snakeManagerRef.current.moveSnake();
        console.log("Move result:", result);
        
        if (result === "wall-collision") {
          setGameStatus("game-over");
        }
      }, INITIAL_SPEED);

      return () => {
        console.log("Cleaning up game loop");
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      };
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === "game-over") {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
  }, [gameStatus]);

  return {
    gameStatus,
    setGameStatus,
    startGame,
    stopGame,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
export type { GameStatus } from "../types";
