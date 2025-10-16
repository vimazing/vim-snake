import { useRef, useState } from "react";
import type { Direction, SnakeBody } from "../types";
import type { UseRendererType } from "./useRenderer";

export function useSnake(
  cols: number,
  rows: number,
  rendererManager: UseRendererType
) {
  const { containerRef } = rendererManager;
  const [snakeBody, setSnakeBody] = useState<SnakeBody>([]);
  const snakeBodyRef = useRef<SnakeBody>([]);
  const [direction, setDirection] = useState<Direction>("up");
  const directionRef = useRef<Direction>("up");

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
    renderSnake(initialBody);
  };

  const clearSnake = () => {
    setSnakeBody([]);
    snakeBodyRef.current = [];
    setDirection("up");
    directionRef.current = "up";
  };

  const renderSnake = (body: SnakeBody) => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll(".snake-head, .snake-body, .snake-tail").forEach((el) => {
      el.classList.remove("snake-head", "snake-body", "snake-tail");
    });

    body.forEach((segment, idx) => {
      const cell = container.querySelector(
        `.snake-cell[data-r="${segment.r}"][data-c="${segment.c}"]`
      );
      if (cell) {
        if (idx === 0) {
          cell.classList.add("snake-head");
        } else if (idx === body.length - 1) {
          cell.classList.add("snake-tail");
        } else {
          cell.classList.add("snake-body");
        }
      }
    });
  };

  const changeDirection = (newDirection: Direction) => {
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
  };

  const moveSnake = (): "continue" | "wall-collision" | "self-collision" => {
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
    const newBody = [newHead, ...body.slice(0, -1)];

    setSnakeBody(newBody);
    snakeBodyRef.current = newBody;
    renderSnake(newBody);

    return "continue";
  };

  return {
    snakeBody,
    snakeBodyRef,
    direction,
    directionRef,
    initSnake,
    clearSnake,
    changeDirection,
    moveSnake,
    renderSnake,
  };
}

export type UseSnakeType = ReturnType<typeof useSnake>;
