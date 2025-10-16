import { useState, useRef } from "react";
import type { Position, SnakeBody } from "../types";
import type { UseRendererType } from "./useRenderer";

export function useFood(
  cols: number,
  rows: number,
  rendererManager: UseRendererType
) {
  const { containerRef } = rendererManager;
  const [foodPositions, setFoodPositions] = useState<Position[]>([]);
  const foodPositionsRef = useRef<Position[]>([]);

  const spawnFood = (snakeBody: SnakeBody, count: number = 1) => {
    const occupiedPositions = new Set(
      snakeBody.map((seg) => `${seg.r},${seg.c}`)
    );

    const availablePositions: Position[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        if (!occupiedPositions.has(key)) {
          availablePositions.push({ r, c });
        }
      }
    }

    const newFood: Position[] = [];
    for (let i = 0; i < count && availablePositions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const food = availablePositions.splice(randomIndex, 1)[0];
      newFood.push(food);
    }

    setFoodPositions(newFood);
    foodPositionsRef.current = newFood;
    renderFood(newFood);
  };

  const clearFood = () => {
    setFoodPositions([]);
    foodPositionsRef.current = [];
    const container = containerRef.current;
    container?.querySelectorAll(".food").forEach((el) => {
      el.classList.remove("food");
    });
  };

  const renderFood = (positions: Position[]) => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll(".food").forEach((el) => {
      el.classList.remove("food");
    });

    positions.forEach((pos) => {
      const cell = container.querySelector(
        `.snake-cell[data-r="${pos.r}"][data-c="${pos.c}"]`
      );
      if (cell) {
        cell.classList.add("food");
      }
    });
  };

  const checkFoodCollision = (headPos: Position): boolean => {
    const food = foodPositionsRef.current;
    const collision = food.some(
      (f) => f.r === headPos.r && f.c === headPos.c
    );
    return collision;
  };

  const removeFood = (pos: Position) => {
    const newFood = foodPositionsRef.current.filter(
      (f) => !(f.r === pos.r && f.c === pos.c)
    );
    setFoodPositions(newFood);
    foodPositionsRef.current = newFood;
    renderFood(newFood);
  };

  return {
    foodPositions,
    foodPositionsRef,
    spawnFood,
    clearFood,
    checkFoodCollision,
    removeFood,
    renderFood,
  };
}

export type UseFoodType = ReturnType<typeof useFood>;
