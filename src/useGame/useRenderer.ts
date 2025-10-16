import { useRef } from "react";

export type BoardData = {
  cols: number;
  rows: number;
};

export function useRenderer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const renderBoard = (cols: number, rows: number) => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const board = document.createElement("div");
    board.id = "snake-board";
    board.className = "snake-board";

    for (let r = 0; r < rows; r++) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "snake-row";
      rowDiv.setAttribute("data-r", String(r));

      for (let c = 0; c < cols; c++) {
        const cellDiv = document.createElement("div");
        cellDiv.className = "snake-cell";
        cellDiv.setAttribute("data-r", String(r));
        cellDiv.setAttribute("data-c", String(c));
        rowDiv.appendChild(cellDiv);
      }

      board.appendChild(rowDiv);
    }

    container.appendChild(board);
  };

  return {
    containerRef,
    renderBoard,
  };
}

export type UseRendererType = ReturnType<typeof useRenderer>;
