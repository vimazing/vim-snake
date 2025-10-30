import { useTimer } from "./hooks/useTimer";
import { useScoreTime } from "./useScoreTime";
import type { GameStatus, KeyLogEntry } from "../types";

export type UseScoreParams = {
  gameStatus: GameStatus;
  keyLog: KeyLogEntry[];
};

export function useScore({ gameStatus, keyLog }: UseScoreParams) {
  const timer = useTimer();
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  useScoreTime({ gameStatus, timer });

  return {
    timeValue,
    totalKeystrokes: keyLog.length,
    finalScore: null,   // TODO: Calculate on game-won
    startTimer,
    stopTimer,
    resetTimer,
  };
}
