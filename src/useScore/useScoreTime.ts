import { useEffect, useRef } from "react";
import type { UseTimerReturn } from "./hooks/useTimer";
import type { GameStatus } from "../types";

type UseScoreTimeParams = {
  gameStatus: GameStatus;
  timer: UseTimerReturn;
};

export function useScoreTime({ gameStatus, timer }: UseScoreTimeParams) {
  const prevStatusRef = useRef<GameStatus | null>(null);
  const { startTimer, stopTimer, resetTimer } = timer;

  useEffect(() => {
    // const prevStatus = prevStatusRef.current;
    prevStatusRef.current = gameStatus;

    switch (gameStatus) {
      case "started":
        // Always reset and start a fresh timer when a new game begins
        resetTimer();
        startTimer();
        break;

      case "hasKey":
        // Keep running
        break;

      case "game-over":
      case "game-won":
      case "waiting":
        // Stop timer when game finishes or is exited
        stopTimer();
        break;
    }
  }, [gameStatus, startTimer, stopTimer, resetTimer]);
}

