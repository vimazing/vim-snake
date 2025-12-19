import { useState, useRef } from "react";
import type { Position, SnakeBody } from "../types";

export function useFood(cols: number, rows: number) {
  const [foodPositions, setFoodPositions] = useState<Position[]>([]);
  const foodPositionsRef = useRef<Position[]>([]);

  function spawnFood(snakeBody: SnakeBody, count: number = 1) {
    const occupiedPositions = new Set(
      snakeBody.map((seg) => `${seg.r},${seg.c}`)
    );

    foodPositionsRef.current.forEach((f) => {
      occupiedPositions.add(`${f.r},${f.c}`);
    });

    const availablePositions: Position[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        if (!occupiedPositions.has(key)) {
          availablePositions.push({ r, c });
        }
      }
    }

    const newFood: Position[] = [...foodPositionsRef.current];
    for (let i = 0; i < count && availablePositions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const food = availablePositions.splice(randomIndex, 1)[0];
      newFood.push(food);
    }

    setFoodPositions(newFood);
    foodPositionsRef.current = newFood;
  }

  function clearFood() {
    setFoodPositions([]);
    foodPositionsRef.current = [];
  }

  function checkFoodCollision(headPos: Position): boolean {
    const food = foodPositionsRef.current;
    return food.some((f) => f.r === headPos.r && f.c === headPos.c);
  }

  function removeFood(pos: Position) {
    const newFood = foodPositionsRef.current.filter(
      (f) => !(f.r === pos.r && f.c === pos.c)
    );
    setFoodPositions(newFood);
    foodPositionsRef.current = newFood;
  }

  return {
    foodPositions,
    foodPositionsRef,
    spawnFood,
    clearFood,
    checkFoodCollision,
    removeFood,
  };
}

export type UseFoodType = ReturnType<typeof useFood>;
