import { useTimer } from "./hooks/useTimer";
import { useScoreTime } from "./useScoreTime";
import type { GameStatus } from "../types";

export type UseScoreParams = {
  gameStatus: GameStatus;
};

export function useScore({ gameStatus }: UseScoreParams) {
  const timer = useTimer();
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  useScoreTime({ gameStatus, timer });

  return {
    timeValue,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
