import { useEffect, useRef, useState } from "react";
import { useTimer } from "../hooks/useTimer";
import { useScoreTime } from "./useScoreTime";
import { useScorePaths } from "./useScorePaths";
import type { KeyLogProvider, GameScoreContext } from "../types";

type UseScoreParams = {
  gameContext: GameScoreContext;
  keyManager?: KeyLogProvider;
};

export function useScore({ gameContext, keyManager }: UseScoreParams) {
  const timer = useTimer();
  const { gameStatus, setGameStatus } = gameContext;
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  // ✅ useScorePaths always returns distances under these names
  const {
    entranceToKey = 0,
    entranceToExit = 0,
    heroToKey = 0,
    heroToExit = 0,
  } = gameContext.mazeManager
      ? useScorePaths({ gameManager: gameContext as any })
      : {};

  // ✅ use unified naming for internal logic
  const distToKey = entranceToKey || heroToKey;
  const distToExit = entranceToExit || heroToExit;

  const [finalScore, setFinalScore] = useState<number | null>(null);
  const optimalRef = useRef<number>(0);
  const keystrokes = keyManager ? keyManager.keyLog.length : 0;

  // 1️⃣ Manage visible wall-clock timer
  useScoreTime({ gameStatus, timer });

  // 2️⃣ Compute static optimal path when maze (re)starts
  useEffect(() => {
    const maze = gameContext.mazeManager?.mazeInstanceRef?.current;
    if (!maze) return;

    const k = maze.getDistance("entrance", "key");
    const e = maze.getDistance("key", "exit");
    const total = k + e;

    if (Number.isFinite(total) && total > 0) {
      optimalRef.current = total;
    }
  }, [gameStatus, gameContext.mazeManager?.mazeInstanceRef]);

  const optimalSteps = optimalRef.current;

  // 3️⃣ Efficiency (keystrokes vs optimal steps)
  const efficiency =
    optimalSteps > 0 ? Math.round((keystrokes / optimalSteps) * 100) : 0;

  // 4️⃣ Logic time (internal motion time)
  const [logicFirst, setLogicFirst] = useState<number | null>(null);
  const [logicLast, setLogicLast] = useState<number | null>(null);

  useEffect(() => {
    if (gameStatus === "started") {
      setLogicFirst(null);
      setLogicLast(null);
      setPlayerSteps(0);
      prevPosRef.current = null;
    }
  }, [gameStatus]);

  useEffect(() => {
    const onTick = (e: Event) => {
      const t =
        (e as CustomEvent<{ t?: number }>).detail?.t ?? performance.now();
      setLogicFirst((prev) => prev ?? t);
      setLogicLast(t);
    };
    window.addEventListener("maze-logic-tick", onTick as EventListener);
    return () =>
      window.removeEventListener("maze-logic-tick", onTick as EventListener);
  }, []);

  // 5️⃣ Actual player steps
  const [playerSteps, setPlayerSteps] = useState(0);
  const prevPosRef = useRef<{ r: number; c: number } | null>(null);

  useEffect(() => {
    const pos = gameContext.playerManager?.playerPos;
    if (!pos) {
      prevPosRef.current = null;
      return;
    }

    if (!["started", "hasKey"].includes(gameStatus)) {
      prevPosRef.current = pos;
      return;
    }

    const prev = prevPosRef.current;
    prevPosRef.current = pos;
    if (!prev) return;

    const delta = Math.abs(pos.r - prev.r) + Math.abs(pos.c - prev.c);
    if (delta > 0) setPlayerSteps((s) => s + delta);
  }, [gameStatus, gameContext.playerManager?.playerPos]);

  // 6️⃣ Auto game-over on inefficiency
  useEffect(() => {
    if (gameStatus === "started" && efficiency > 150) {
      setGameStatus("game-over");
    }
  }, [efficiency, gameStatus, setGameStatus]);

  // 7️⃣ Final score on win
  useEffect(() => {
    if (gameStatus !== "game-won") return;

    const logicMs =
      logicFirst != null && logicLast != null
        ? Math.max(1, logicLast - logicFirst)
        : timeValue;

    const optimalMs = optimalSteps * 200;
    const ratio = Math.max(0.1, optimalMs / logicMs);
    const score = Math.min(100000, Math.round(ratio * 100000));

    setFinalScore(score);
  }, [gameStatus, logicFirst, logicLast, timeValue, optimalSteps, playerSteps]);

  // ✅ Return clean, typed object
  return {
    timeValue,
    startTimer,
    stopTimer,
    resetTimer,
    distToKey,
    distToExit,
    keystrokes,
    optimalSteps,
    efficiency,
    finalScore,
  };
}
