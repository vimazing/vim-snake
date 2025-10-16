import { useCallback, useState, useMemo } from "react";
import type { UseMazeType } from "./useMaze";
import type { UsePlayerType } from "./usePlayer";
import type { GameStatus } from "../types";
import { getGamePhase, isPlaying } from "../types";

export type { GameStatus } from "../types";

export function useGameStatus(mazeManager: UseMazeType, playerManager: UsePlayerType) {
  const { mazeRef, containerRef } = mazeManager;
  const { setPlayerPos } = playerManager;
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");

  const gamePhase = useMemo(() => getGamePhase(gameStatus), [gameStatus]);
  const playStatus = useMemo(
    () => (isPlaying(gameStatus) ? gameStatus : null),
    [gameStatus]
  );

  // 🕹 Start the game (place hero)
  const startGame = useCallback(() => {
    const m = mazeRef.current;
    if (!m.length) return;

    for (let c = 0; c < m[0].length; c++) {
      if (m[m.length - 1][c].includes("entrance")) {
        setPlayerPos({ r: m.length - 1, c });
        break;
      }
    }

    setGameStatus("started");
  }, [mazeRef, setPlayerPos]);

  // 🧍 Stop / exit game
  const stopGame = useCallback(() => {
    setPlayerPos(null);
    setGameStatus("waiting");
    const container = containerRef.current;
    container?.querySelector("#maze")?.classList.remove("finished");
    container?.querySelectorAll(".hero").forEach((el) => el.classList.remove("hero"));
  }, [setPlayerPos, containerRef]);

  return {
    gameStatus,
    gamePhase,
    playStatus,
    setGameStatus,
    startGame,
    stopGame,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;

