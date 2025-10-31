import type { RefObject, MutableRefObject } from 'react';

// ============================================================================
// Core Game Types
// ============================================================================

export type GameStatus = 'waiting' | 'started' | 'game-won' | 'game-over';
export type GamePhase = 'idle' | 'playing';
export type PlayStatus = 'started' | 'game-over' | 'game-won';

export const isPlaying = (status: GameStatus): status is PlayStatus =>
  status === 'started' || status === 'game-over' || status === 'game-won';

export const getGamePhase = (status: GameStatus): GamePhase =>
  status === 'waiting' ? 'idle' : 'playing';

// ============================================================================
// Snake-Specific Types
// ============================================================================

export type Direction = 'up' | 'down' | 'left' | 'right';
export type Position = { r: number; c: number };
export type SnakeBody = Position[];

// ============================================================================
// Input & Key Tracking
// ============================================================================

export type KeyLogEntry = { key: string; timestamp: number };

export type GameOptions = {
  cols?: number;
  rows?: number;
  timeLimit?: number;
  startingLevel?: number;
  foodsPerLevel?: number;
  maxLevel?: number;
};

// ============================================================================
// Manager Interfaces - Board
// ============================================================================

export type BoardManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: (cols: number, rows: number) => void;
};

// ============================================================================
// Manager Interfaces - Cursor/Snake
// ============================================================================

export type CursorMode = 'normal';

export type CursorManager = {
  position: () => Position;
  mode: () => CursorMode;

  // VIM-style motions (required by Unified API)
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  moveToStart: () => void;
  moveToEnd: () => void;
  moveToTop: () => void;
  moveToBottom: () => void;
  repeatLastMotion: () => void;
};

export type SnakeCursorManager = CursorManager & {
  snakeBody: SnakeBody;
  direction: Direction;
  changeDirection: (dir: Direction) => void;
  // Snake-specific for internal use
  snakeBodyRef: MutableRefObject<SnakeBody>;
  directionRef: MutableRefObject<Direction>;
  initSnake: () => void;
  clearSnake: () => void;
  moveSnake: (grow?: boolean) => 'continue' | 'wall-collision' | 'self-collision';
  renderSnake: (body: SnakeBody) => void;
};

// ============================================================================
// Manager Interfaces - Score
// ============================================================================

export type ScoreManager = {
  timeValue: number;
  totalKeystrokes: number;
  finalScore: number | null;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
};

// ============================================================================
// Manager Interfaces - Game Status
// ============================================================================

export type GameStatusManager = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  quitGame: () => void;
  level: number;
  score: number;
  togglePause: () => void;
};

// ============================================================================
// Manager Interfaces - Key Tracking
// ============================================================================

export type GameKeyManager = {
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
};

// ============================================================================
// Unified Game Manager - Main Interface
// ============================================================================

export type GameManager = {
  // Required rendering
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;

  // Required managers
  cursor: SnakeCursorManager;
  scoreManager: ScoreManager;

  // Required lifecycle
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  quitGame: () => void;

  // Required state
  level: number;
  score: number;

  // Required key tracking
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];

  // Game-specific additions
  togglePause: () => void;
};

// ============================================================================
// Hook Return Types
// ============================================================================

// Forward declarations for hook return types
// These will be imported from their respective modules

export type UseGameType = ReturnType<typeof import('./useGame').useGame>;
