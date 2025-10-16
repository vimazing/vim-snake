import type { GameStatus } from "../types";
import { useEffect, useRef, useState } from "react";
import type { KeyLogEntry } from "../types";

export type GameBindingContext = {
  movePlayer: (dr: number, dc: number, count?: number) => void;
  gameStatus: GameStatus;
  mazeManager: any;
  playerManager: any;
};

type UseMazeKeyBindingsParams = {
  gameManager: GameBindingContext;
};

type Motion = { dr: number; dc: number; steps: number };

const RELEVANT_KEYS = new Set([
  "h", "H", "j", "J", "k", "K", "l", "L", ".", "^", "$", "g", "G", "0",
  "1", "2", "3", "4", "5", "6", "7", "8", "9"
]);

export const useKeyBindings = ({ gameManager }: UseMazeKeyBindingsParams) => {
  const { movePlayer, gameStatus } = gameManager;

  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const logRef = useRef<KeyLogEntry[]>([]);
  const countRef = useRef<string>("");
  const lastMotionRef = useRef<Motion | null>(null);
  const lastKeyRef = useRef<string>("");

  const relevantKeys = RELEVANT_KEYS;

  const clearLog = () => {
    logRef.current = [];
    setKeyLog([]);
  };

  const recordKey = (key: string) => {
    const entry = { key, timestamp: performance.now() };
    logRef.current.push(entry);
    setKeyLog([...logRef.current]);
  };

  const resetCount = () => { countRef.current = ""; };

  const findAnchorTarget = (dir: "left" | "right") => {
    const m = gameManager.mazeManager.mazeRef.current;
    const pos = gameManager.playerManager.playerPos;
    if (!m.length || !pos) return null;

    const colsCount = m[0]?.length ?? 0;
    const r = pos.r;
    const c = pos.c;

    if (!m[r] || !m[r][c] || m[r][c].includes("wall")) return null;

    const step = dir === "left" ? -1 : 1;
    let cc = c;

    while (true) {
      const next = cc + step;
      if (next < 0 || next >= colsCount) return null;
      if (m[r][next].includes("wall")) {
        const wallIdx = next;
        const expectedWallIdx = dir === "left" ? 0 : colsCount - 1;
        const expectedCellIdx = dir === "left" ? 1 : colsCount - 2;

        if (wallIdx !== expectedWallIdx) return null;
        if (cc !== expectedCellIdx) return null;
        if (cc === c) return null;

        return { r, cTarget: cc };
      }
      cc = next;
    }
  };

  const findColumnAnchorTarget = (dir: "top" | "bottom") => {
    const m = gameManager.mazeManager.mazeRef.current;
    const pos = gameManager.playerManager.playerPos;
    if (!m.length || !pos) return null;

    const rowsCount = m.length;
    const r = pos.r;
    const c = pos.c;

    if (!m[r] || !m[r][c] || m[r][c].includes("wall")) return null;

    const step = dir === "top" ? -1 : 1;
    let rr = r;

    while (true) {
      const next = rr + step;
      if (next < 0 || next >= rowsCount) return null;
      if (m[next][c].includes("wall")) {
        const wallIdx = next;
        const expectedWallIdx = dir === "top" ? 0 : rowsCount - 1;
        const expectedCellIdx = dir === "top" ? 1 : rowsCount - 2;

        if (wallIdx !== expectedWallIdx) return null;
        if (rr !== expectedCellIdx) return null;
        if (rr === r) return null;

        return { rTarget: rr, c };
      }
      rr = next;
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (["waiting", "game-over", "game-won"].includes(gameStatus)) return;

      // "0" behaves like Vim: beginning of line
      if (e.key === "0" && countRef.current === "") {
        recordKey("0");
        resetCount();

        const anchor = findAnchorTarget("left");
        if (!anchor) {
          window.dispatchEvent(new Event("maze-invalid"));
          return;
        }

        const pos = gameManager.playerManager.playerPos!;
        const dr = 0;
        const dc = anchor.cTarget > pos.c ? 1 : -1;
        const steps = Math.abs(anchor.cTarget - pos.c);

        movePlayer(dr, dc, steps);
        lastMotionRef.current = { dr, dc, steps };
        return;
      }

      const isDigit = e.key >= "0" && e.key <= "9";
      if (isDigit) {
        if (e.key === "0" && countRef.current === "") return;
        recordKey(e.key);
        countRef.current += e.key;
        return;
      }

      if (e.key === ".") {
        recordKey(".");
        const last = lastMotionRef.current;
        if (!last) return;
        const steps = Math.max(1, parseInt(countRef.current || String(last.steps), 10));
        resetCount();
        movePlayer(last.dr, last.dc, steps);
        lastMotionRef.current = { dr: last.dr, dc: last.dc, steps };
        return;
      }

      if (e.key === "^" || e.key === "$") {
        recordKey(e.key);
        resetCount();

        const dir = e.key === "^" ? "left" : "right";
        const anchor = findAnchorTarget(dir);
        if (!anchor) {
          window.dispatchEvent(new Event("maze-invalid"));
          return;
        }

        const pos = gameManager.playerManager.playerPos!;
        const dr = 0;
        const dc = anchor.cTarget > pos.c ? 1 : -1;
        const steps = Math.abs(anchor.cTarget - pos.c);

        movePlayer(dr, dc, steps);
        lastMotionRef.current = { dr, dc, steps };
        return;
      }

      if (e.key === "g" || e.key === "G") {
        if (e.key === "g") {
          if (lastKeyRef.current === "g") {
            recordKey(e.key);
            resetCount();
            lastKeyRef.current = "";

            const anchor = findColumnAnchorTarget("top");
            if (!anchor) {
              window.dispatchEvent(new Event("maze-invalid"));
              return;
            }

            const pos = gameManager.playerManager.playerPos!;
            const dr = anchor.rTarget > pos.r ? 1 : -1;
            const dc = 0;
            const steps = Math.abs(anchor.rTarget - pos.r);

            movePlayer(dr, dc, steps);
            lastMotionRef.current = { dr, dc, steps };
            return;
          } else {
            recordKey(e.key);
            lastKeyRef.current = "g";
            return;
          }
        } else {
          recordKey(e.key);
          resetCount();
          lastKeyRef.current = "";

          const anchor = findColumnAnchorTarget("bottom");
          if (!anchor) {
            window.dispatchEvent(new Event("maze-invalid"));
            return;
          }

          const pos = gameManager.playerManager.playerPos!;
          const dr = anchor.rTarget > pos.r ? 1 : -1;
          const dc = 0;
          const steps = Math.abs(anchor.rTarget - pos.r);

          movePlayer(dr, dc, steps);
          lastMotionRef.current = { dr, dc, steps };
          return;
        }
      }

      if (!relevantKeys.has(e.key)) return;

      recordKey(e.key);

      let dr = 0, dc = 0;
      switch (e.key) {
        case "h":
        case "H": dr = 0; dc = -1; break;
        case "j":
        case "J": dr = 1; dc = 0; break;
        case "k":
        case "K": dr = -1; dc = 0; break;
        case "l":
        case "L": dr = 0; dc = 1; break;
        default: return;
      }

      const steps = Math.max(1, parseInt(countRef.current || "1", 10));
      resetCount();
      movePlayer(dr, dc, steps);
      lastMotionRef.current = { dr, dc, steps };
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [movePlayer, gameStatus, gameManager]);

  return {
    keyLog,
    clearLog,
    resetCount,
    getLog: () => logRef.current,
  };
};

export type UseKeyBindingsType = ReturnType<typeof useKeyBindings>;
