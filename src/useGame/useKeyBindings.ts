import { useEffect, useRef, useState } from "react";
import type { GameStatus, Direction } from "../types";

export type KeyLogEntry = { key: string; timestamp: number };

export type GameBindingContext = {
  gameStatus: GameStatus;
  changeDirection: (dir: Direction) => void;
};

type UseKeyBindingsParams = {
  gameManager: GameBindingContext;
};

export function useKeyBindings({ gameManager }: UseKeyBindingsParams) {
  const { gameStatus, changeDirection } = gameManager;
  
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const logRef = useRef<KeyLogEntry[]>([]);
  const countRef = useRef<string>("");

  const recordKey = (key: string) => {
    const entry = { key, timestamp: performance.now() };
    logRef.current.push(entry);
    setKeyLog([...logRef.current]);
  };

  const clearLog = () => {
    logRef.current = [];
    setKeyLog([]);
  };

  const resetCount = () => {
    countRef.current = "";
  };

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (!["started"].includes(gameStatus)) return;

      recordKey(ev.key);

      let handled = false;

      switch (ev.key) {
        case "h":
        case "H":
          changeDirection("left");
          handled = true;
          break;
        case "j":
        case "J":
          changeDirection("down");
          handled = true;
          break;
        case "k":
        case "K":
          changeDirection("up");
          handled = true;
          break;
        case "l":
        case "L":
          changeDirection("right");
          handled = true;
          break;
      }

      if (handled) {
        ev.stopPropagation();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus, changeDirection]);

  return {
    keyLog,
    clearLog,
    resetCount,
    getLog: () => logRef.current,
  };
}

export type UseKeyBindingsType = ReturnType<typeof useKeyBindings>;
