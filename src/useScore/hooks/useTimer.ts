import { useEffect, useRef, useState } from "react";

export type UseTimerReturn = {
  timeValue: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
};

export type UseTimerOptions = {
  interval?: number;
};

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { interval = 100 } = options;
  const [timeValue, setTimeValue] = useState(0);

  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offsetRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  function update() {
    if (startTimeRef.current === null) {
      return;
    }
    const now = performance.now();
    setTimeValue(offsetRef.current + (now - startTimeRef.current));
  }

  function startTimer() {
    if (intervalIdRef.current !== null) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    update();
    intervalIdRef.current = setInterval(update, Math.max(16, interval));
  }

  function stopTimer() {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (startTimeRef.current !== null) {
      update();
      offsetRef.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
  }

  function resetTimer() {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    startTimeRef.current = null;
    offsetRef.current = 0;
    setTimeValue(0);
  }

  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return {
    timeValue,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
