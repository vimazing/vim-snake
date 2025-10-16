import { useGame } from "./useGame";

export type UseGameType = ReturnType<typeof useGame>;

export type GamePhase = "idle" | "playing";
export type PlayStatus = "started" | "game-over" | "game-won";
export type GameStatus = "waiting" | "started" | "game-over" | "game-won";

export const isPlaying = (status: GameStatus): status is PlayStatus =>
  status === "started" || status === "game-over" || status === "game-won";

export const getGamePhase = (status: GameStatus): GamePhase =>
  status === "waiting" ? "idle" : "playing";

export type Direction = "up" | "down" | "left" | "right";
export type Position = { r: number; c: number };
export type SnakeBody = Position[];

