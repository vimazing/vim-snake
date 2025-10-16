import { useEffect } from "react";
import { useRenderer } from "./useRenderer";

export function useGame(cols: number, rows: number, platformHook?: unknown) {
  const rendererManager = useRenderer();
  const { containerRef, renderBoard } = rendererManager;

  useEffect(() => {
    renderBoard(cols, rows);
  }, [cols, rows]);

  const fullGameManager = {
    containerRef,
    renderBoard,
  };

  if (typeof platformHook === "function") {
    platformHook(fullGameManager);
  }

  return fullGameManager;
}

export type { GameStatus } from "../types";
