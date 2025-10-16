import { useState } from "react";
import type { GameStatus } from "../types";
import type { UseRendererType } from "./useRenderer";
import type { UseSnakeType } from "./useSnake";

export function useGameStatus(
  rendererManager: UseRendererType,
  snakeManager: UseSnakeType
) {
  const { containerRef } = rendererManager;
  const { initSnake, clearSnake } = snakeManager;
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");

  const startGame = () => {
    initSnake();
    setGameStatus("started");
  };

  const stopGame = () => {
    clearSnake();
    setGameStatus("waiting");
    const container = containerRef.current;
    container?.querySelectorAll(".snake-head, .snake-body").forEach((el) => {
      el.classList.remove("snake-head", "snake-body");
    });
  };

  return {
    gameStatus,
    setGameStatus,
    startGame,
    stopGame,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
export type { GameStatus } from "../types";
