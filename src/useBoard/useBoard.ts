import { useRef } from "react";
import { CanvasRenderer, type RenderState } from "./CanvasRenderer";

export type BoardData = {
  cols: number;
  rows: number;
};

export type UseBoardParams = {
  cellSize?: number;
};

export function useBoard(params?: UseBoardParams) {
  const cellSize = params?.cellSize ?? 24;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  function initCanvas(cols: number, rows: number) {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.id = "snake-canvas";
    canvas.className = "snake-canvas";
    container.appendChild(canvas);
    canvasRef.current = canvas;

    rendererRef.current = new CanvasRenderer(canvas, cols, rows, cellSize);
    lastFrameTimeRef.current = performance.now();
  }

  function renderBoard(cols: number, rows: number) {
    if (!canvasRef.current || !rendererRef.current) {
      initCanvas(cols, rows);
    } else {
      rendererRef.current.updateDimensions(cols, rows);
    }
  }

  function renderFrame(state: RenderState) {
    if (!rendererRef.current) return;

    const now = performance.now();
    const deltaTime = (now - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = now;

    rendererRef.current.render(state, deltaTime);
  }

  function spawnFoodParticles(pos: { r: number; c: number }) {
    rendererRef.current?.spawnFoodParticles(pos);
  }

  function getRenderer(): CanvasRenderer | null {
    return rendererRef.current;
  }

  return {
    containerRef,
    canvasRef,
    renderBoard,
    renderFrame,
    spawnFoodParticles,
    getRenderer,
  };
}

export type UseBoardType = ReturnType<typeof useBoard>;
