import { useTimer } from "./hooks/useTimer";
import { useScoreTime } from "./useScoreTime";
import type { GameStatus, KeyLogEntry } from "../types";

export type UseScoreParams = {
  gameStatus: GameStatus;
  keyLog: KeyLogEntry[];
  currentScore: number;
};

export function useScore({ gameStatus, keyLog, currentScore }: UseScoreParams) {
  const timer = useTimer();
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  useScoreTime({ gameStatus, timer });

  const finalScore = gameStatus === 'game-over' || gameStatus === 'game-won' ? currentScore : null;

  return {
    timeValue,
    totalKeystrokes: keyLog.length,
    finalScore,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
