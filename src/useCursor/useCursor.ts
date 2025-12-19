import { useRef, useState } from "react";
import type { Direction, SnakeBody, Position } from "../types";

export type UseCursorParams = {
  initialSnakeSize?: number;
};

export function useCursor(
  cols: number,
  rows: number,
  params?: UseCursorParams
) {
  const initialSnakeSize = params?.initialSnakeSize ?? 3;
  const [snakeBody, setSnakeBody] = useState<SnakeBody>([]);
  const snakeBodyRef = useRef<SnakeBody>([]);
  const [direction, setDirection] = useState<Direction>("up");
  const directionRef = useRef<Direction>("up");
  const lastMovedDirectionRef = useRef<Direction>("up");
  const nextDirectionRef = useRef<Direction | null>(null);
  const lastMotionRef = useRef<Direction | null>(null);

  function initSnake() {
    const centerR = Math.floor(rows / 2);
    const centerC = Math.floor(cols / 2);

    const initialBody: SnakeBody = [];
    for (let i = 0; i < initialSnakeSize; i++) {
      initialBody.push({ r: centerR + i, c: centerC });
    }

    setSnakeBody(initialBody);
    snakeBodyRef.current = initialBody;
    setDirection("up");
    directionRef.current = "up";
    lastMovedDirectionRef.current = "up";
    nextDirectionRef.current = null;
  }

  function clearSnake() {
    setSnakeBody([]);
    snakeBodyRef.current = [];
    setDirection("up");
    directionRef.current = "up";
    lastMovedDirectionRef.current = "up";
    nextDirectionRef.current = null;
  }

  function changeDirection(newDirection: Direction) {
    nextDirectionRef.current = newDirection;
    lastMotionRef.current = newDirection;
  }

  function applyBufferedDirection() {
    if (nextDirectionRef.current === null) return;

    const newDirection = nextDirectionRef.current;
    const opposites: Record<Direction, Direction> = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (opposites[directionRef.current] !== newDirection) {
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
    nextDirectionRef.current = null;
  }

  function moveSnake(grow: boolean = false): "continue" | "wall-collision" | "self-collision" {
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

    return "continue";
  }

  function position(): Position {
    const head = snakeBodyRef.current[0];
    return head || { r: 0, c: 0 };
  }

  function mode() {
    return "normal" as const;
  }

  function moveLeft(_count?: number) {
    changeDirection("left");
  }

  function moveRight(_count?: number) {
    changeDirection("right");
  }

  function moveUp(_count?: number) {
    changeDirection("up");
  }

  function moveDown(_count?: number) {
    changeDirection("down");
  }

  function moveToStart() {
    changeDirection("left");
  }

  function moveToEnd() {
    changeDirection("right");
  }

  function moveToTop() {
    changeDirection("up");
  }

  function moveToBottom() {
    changeDirection("down");
  }

  function repeatLastMotion() {
    if (lastMotionRef.current) {
      changeDirection(lastMotionRef.current);
    }
  }

  return {
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

    snakeBody,
    snakeBodyRef,
    direction,
    directionRef,
    initSnake,
    clearSnake,
    changeDirection,
    applyBufferedDirection,
    moveSnake,
  };
}

export type UseCursorType = ReturnType<typeof useCursor>;
