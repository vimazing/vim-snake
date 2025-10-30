import { useRef, useState } from "react";
import type { Direction, SnakeBody, Position } from "../types";
import type { UseBoardType } from "../useBoard";

export function useCursor(
  cols: number,
  rows: number,
  boardManager: UseBoardType
) {
  const { containerRef } = boardManager;
  const [snakeBody, setSnakeBody] = useState<SnakeBody>([]);
  const snakeBodyRef = useRef<SnakeBody>([]);
  const [direction, setDirection] = useState<Direction>("up");
  const directionRef = useRef<Direction>("up");
  const lastMovedDirectionRef = useRef<Direction>("up");
  const nextDirectionRef = useRef<Direction | null>(null);

   const initSnake = () => {
     const centerR = Math.floor(rows / 2);
     const centerC = Math.floor(cols / 2);
     
     const initialBody: SnakeBody = [
       { r: centerR, c: centerC },
       { r: centerR + 1, c: centerC },
       { r: centerR + 2, c: centerC },
       { r: centerR + 3, c: centerC },
       { r: centerR + 4, c: centerC },
       { r: centerR + 5, c: centerC },
     ];
    
    setSnakeBody(initialBody);
    snakeBodyRef.current = initialBody;
    setDirection("up");
    directionRef.current = "up";
    lastMovedDirectionRef.current = "up";
    renderSnake(initialBody);
  };

  const clearSnake = () => {
    setSnakeBody([]);
    snakeBodyRef.current = [];
    setDirection("up");
    directionRef.current = "up";
    lastMovedDirectionRef.current = "up";
  };

  const renderSnake = (body: SnakeBody) => {
    const container = containerRef.current;
    if (!container) return;

    const dir = directionRef.current;
    const newPositions = new Set<string>();
    
    // First, apply new positions and track them
    body.forEach((segment, idx) => {
      const posKey = `${segment.r},${segment.c}`;
      newPositions.add(posKey);
      
      const cell = container.querySelector(
        `.snake-cell[data-r="${segment.r}"][data-c="${segment.c}"]`
      );
      if (cell) {
        cell.className = "snake-cell";
        if (idx === 0) {
          cell.classList.add("snake-head", `dir-${dir}`);
        } else if (idx === body.length - 1) {
          const tailDir = getTailDirection(body);
          cell.classList.add("snake-tail", `dir-${tailDir}`);
        } else {
          cell.classList.add("snake-body");
        }
      }
    });

    // Then clear old positions not in the new body
     const allSnakeCells = container.querySelectorAll(".snake-head, .snake-body, .snake-tail");
     allSnakeCells.forEach((el: Element) => {
       const r = el.getAttribute("data-r");
       const c = el.getAttribute("data-c");
       const posKey = `${r},${c}`;
       if (!newPositions.has(posKey)) {
         (el as HTMLElement).className = "snake-cell";
       }
     });
  };

  const getTailDirection = (body: SnakeBody): Direction => {
    if (body.length < 2) return directionRef.current;
    
    const tail = body[body.length - 1];
    const beforeTail = body[body.length - 2];
    
    // Tail points away from beforeTail
    if (tail.r < beforeTail.r) return "up";
    if (tail.r > beforeTail.r) return "down";
    if (tail.c < beforeTail.c) return "left";
    if (tail.c > beforeTail.c) return "right";
    
    return directionRef.current;
  };

  const changeDirection = (newDirection: Direction) => {
    // Simply buffer the direction - apply validation on next move
    nextDirectionRef.current = newDirection;
  };

  const applyBufferedDirection = () => {
    if (nextDirectionRef.current === null) return;

    const newDirection = nextDirectionRef.current;
    const opposites: Record<Direction, Direction> = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    // Only prevent immediate 180° reversal (would cause self-collision on same frame)
    // This is the CURRENT direction, not the last moved direction
    if (opposites[directionRef.current] !== newDirection) {
      setDirection(newDirection);
      directionRef.current = newDirection;
      nextDirectionRef.current = null;
    }
  };

  const moveSnake = (grow: boolean = false): "continue" | "wall-collision" | "self-collision" => {
    const body = snakeBodyRef.current;
    if (body.length === 0) return "continue";

    const head = body[0];
    const dir = directionRef.current;

    let newR = head.r;
    let newC = head.c;

    switch (dir) {
      case "up":
        newR -= 1;
        break;
      case "down":
        newR += 1;
        break;
      case "left":
        newC -= 1;
        break;
      case "right":
        newC += 1;
        break;
    }

    if (newR < 0 || newR >= rows || newC < 0 || newC >= cols) {
      return "wall-collision";
    }

    const newHead = { r: newR, c: newC };

    // Check self-collision (excluding tail if not growing, as tail will move)
    const bodyToCheck = grow ? body : body.slice(0, -1);
    const collision = bodyToCheck.some(
      (segment) => segment.r === newHead.r && segment.c === newHead.c
    );

    if (collision) {
      return "self-collision";
    }

    const newBody = grow 
      ? [newHead, ...body]
      : [newHead, ...body.slice(0, -1)];

    lastMovedDirectionRef.current = dir;
    
    setSnakeBody(newBody);
    snakeBodyRef.current = newBody;
    renderSnake(newBody);

    return "continue";
  };

  // Unified API compliant methods
  const position = (): Position => {
    const head = snakeBodyRef.current[0];
    return head || { r: 0, c: 0 };
  };

  const mode = () => 'normal' as const;

  const moveLeft = (_count?: number) => {
    changeDirection('left');
  };

  const moveRight = (_count?: number) => {
    changeDirection('right');
  };

  const moveUp = (_count?: number) => {
    changeDirection('up');
  };

  const moveDown = (_count?: number) => {
    changeDirection('down');
  };

  const moveToStart = () => {
    // Snake-specific: move to leftmost position on current row
    changeDirection('left');
  };

  const moveToEnd = () => {
    // Snake-specific: move to rightmost position on current row
    changeDirection('right');
  };

  const moveToTop = () => {
    // Snake-specific: move to top of board
    changeDirection('up');
  };

  const moveToBottom = () => {
    // Snake-specific: move to bottom of board
    changeDirection('down');
  };

  const lastMotionRef = useRef<Direction | null>(null);

  const repeatLastMotion = () => {
    if (lastMotionRef.current) {
      changeDirection(lastMotionRef.current);
    }
  };

  return {
    // Unified API methods
    position,
    mode,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    moveToStart,
    moveToEnd,
    moveToTop,
    moveToBottom,
    repeatLastMotion,

    // Snake-specific methods (with proper values)
    snakeBody,
    snakeBodyRef,
    direction,
    directionRef,
    initSnake,
    clearSnake,
    changeDirection,
    applyBufferedDirection,
    moveSnake,
    renderSnake,
  };
}

export type UseCursorType = ReturnType<typeof useCursor>;
