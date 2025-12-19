import type { Position, SnakeBody, Direction } from "../types";

export type RenderState = {
  snakeBody: SnakeBody;
  direction: Direction;
  foodPositions: Position[];
  gameOver: boolean;
  paused: boolean;
};

export type CanvasTheme = {
  background: string;
  gridLine: string;
  snakeHead: string;
  snakeHeadGlow: string;
  snakeBody: string;
  snakeBodyGlow: string;
  snakeTail: string;
  snakeEye: string;
  food: string;
  foodGlow: string;
  collision: string;
  collisionGlow: string;
};

const DEFAULT_THEME: CanvasTheme = {
  background: "#1e2030",
  gridLine: "#2f334d",
  snakeHead: "#ffc777",
  snakeHeadGlow: "rgba(255, 199, 119, 0.6)",
  snakeBody: "#ffb347",
  snakeBodyGlow: "rgba(255, 179, 71, 0.3)",
  snakeTail: "#ff9933",
  snakeEye: "#1b1d2b",
  food: "#c3e88d",
  foodGlow: "rgba(195, 232, 141, 0.5)",
  collision: "#c53b53",
  collisionGlow: "rgba(197, 59, 83, 0.8)",
};

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cols: number;
  private rows: number;
  private cellSize: number;
  private theme: CanvasTheme;
  private animationTime: number = 0;
  private particleSystem: Particle[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    cols: number,
    rows: number,
    cellSize: number = 24,
    theme: Partial<CanvasTheme> = {}
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2d context");
    this.ctx = ctx;
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this.theme = { ...DEFAULT_THEME, ...theme };

    this.canvas.width = cols * cellSize;
    this.canvas.height = rows * cellSize;
  }

  updateDimensions(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.canvas.width = cols * this.cellSize;
    this.canvas.height = rows * this.cellSize;
  }

  render(state: RenderState, deltaTime: number) {
    this.animationTime += deltaTime;
    this.updateParticles(deltaTime);

    this.clearCanvas();
    this.drawBackground();
    this.drawGrid();
    this.drawParticles();
    this.drawFood(state.foodPositions);
    this.drawSnake(state.snakeBody, state.direction, state.gameOver);

    if (state.paused) {
      this.drawPauseOverlay();
    }
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBackground() {
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2
    );
    gradient.addColorStop(0, "#252840");
    gradient.addColorStop(1, this.theme.background);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawGrid() {
    this.ctx.strokeStyle = this.theme.gridLine;
    this.ctx.lineWidth = 0.5;

    for (let c = 0; c <= this.cols; c++) {
      const x = c * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let r = 0; r <= this.rows; r++) {
      const y = r * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  private drawSnake(body: SnakeBody, direction: Direction, gameOver: boolean) {
    if (body.length === 0) return;

    const color = gameOver ? this.theme.collision : this.theme.snakeBody;
    const glowColor = gameOver ? this.theme.collisionGlow : this.theme.snakeBodyGlow;

    for (let i = body.length - 1; i >= 0; i--) {
      const segment = body[i];
      const x = segment.c * this.cellSize;
      const y = segment.r * this.cellSize;
      const padding = 2;
      const size = this.cellSize - padding * 2;

      if (i === 0) {
        this.drawSnakeHead(x, y, direction, gameOver);
      } else if (i === body.length - 1) {
        this.drawSnakeTail(x, y, body, i, gameOver);
      } else {
        this.drawSnakeBody(x, y, size, padding, color, glowColor, i / body.length, body, i);
      }
    }
  }

  private drawSnakeHead(x: number, y: number, direction: Direction, gameOver: boolean) {
    const padding = 1;
    const size = this.cellSize - padding * 2;
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;

    const headColor = gameOver ? this.theme.collision : this.theme.snakeHead;
    const glowColor = gameOver ? this.theme.collisionGlow : this.theme.snakeHeadGlow;

    this.ctx.save();
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = gameOver ? 20 + Math.sin(this.animationTime * 10) * 5 : 15;

    const gradient = this.ctx.createRadialGradient(
      centerX - size * 0.2,
      centerY - size * 0.2,
      0,
      centerX,
      centerY,
      size * 0.6
    );
    gradient.addColorStop(0, this.lightenColor(headColor, 30));
    gradient.addColorStop(1, headColor);

    this.ctx.fillStyle = gradient;
    this.drawRoundedRect(
      x + padding,
      y + padding,
      size,
      size,
      this.getHeadRadius(direction)
    );
    this.ctx.fill();
    this.ctx.restore();

    if (!gameOver) {
      this.drawEyes(centerX, centerY, direction, size);
    } else {
      this.drawDeadEyes(centerX, centerY, direction, size);
    }
  }

  private getHeadRadius(direction: Direction): [number, number, number, number] {
    const large = this.cellSize * 0.35;
    const small = this.cellSize * 0.1;

    switch (direction) {
      case "up":
        return [large, large, small, small];
      case "down":
        return [small, small, large, large];
      case "left":
        return [large, small, small, large];
      case "right":
        return [small, large, large, small];
    }
  }

  private drawEyes(cx: number, cy: number, direction: Direction, size: number) {
    const eyeSize = size * 0.15;
    const eyeOffset = size * 0.2;
    const pupilOffset = size * 0.05;

    let eye1X: number, eye1Y: number, eye2X: number, eye2Y: number;
    let pupilDX = 0, pupilDY = 0;

    switch (direction) {
      case "up":
        eye1X = cx - eyeOffset;
        eye1Y = cy - eyeOffset * 0.5;
        eye2X = cx + eyeOffset;
        eye2Y = cy - eyeOffset * 0.5;
        pupilDY = -pupilOffset;
        break;
      case "down":
        eye1X = cx - eyeOffset;
        eye1Y = cy + eyeOffset * 0.5;
        eye2X = cx + eyeOffset;
        eye2Y = cy + eyeOffset * 0.5;
        pupilDY = pupilOffset;
        break;
      case "left":
        eye1X = cx - eyeOffset * 0.5;
        eye1Y = cy - eyeOffset;
        eye2X = cx - eyeOffset * 0.5;
        eye2Y = cy + eyeOffset;
        pupilDX = -pupilOffset;
        break;
      case "right":
        eye1X = cx + eyeOffset * 0.5;
        eye1Y = cy - eyeOffset;
        eye2X = cx + eyeOffset * 0.5;
        eye2Y = cy + eyeOffset;
        pupilDX = pupilOffset;
        break;
    }

    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = this.theme.snakeEye;
    this.ctx.beginPath();
    this.ctx.arc(eye1X + pupilDX, eye1Y + pupilDY, eyeSize * 0.6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(eye2X + pupilDX, eye2Y + pupilDY, eyeSize * 0.6, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawDeadEyes(cx: number, cy: number, direction: Direction, size: number) {
    const eyeOffset = size * 0.2;
    const xSize = size * 0.12;

    let eye1X: number, eye1Y: number, eye2X: number, eye2Y: number;

    switch (direction) {
      case "up":
        eye1X = cx - eyeOffset;
        eye1Y = cy - eyeOffset * 0.5;
        eye2X = cx + eyeOffset;
        eye2Y = cy - eyeOffset * 0.5;
        break;
      case "down":
        eye1X = cx - eyeOffset;
        eye1Y = cy + eyeOffset * 0.5;
        eye2X = cx + eyeOffset;
        eye2Y = cy + eyeOffset * 0.5;
        break;
      case "left":
        eye1X = cx - eyeOffset * 0.5;
        eye1Y = cy - eyeOffset;
        eye2X = cx - eyeOffset * 0.5;
        eye2Y = cy + eyeOffset;
        break;
      case "right":
        eye1X = cx + eyeOffset * 0.5;
        eye1Y = cy - eyeOffset;
        eye2X = cx + eyeOffset * 0.5;
        eye2Y = cy + eyeOffset;
        break;
    }

    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;

    [{ x: eye1X, y: eye1Y }, { x: eye2X, y: eye2Y }].forEach(({ x, y }) => {
      this.ctx.beginPath();
      this.ctx.moveTo(x - xSize, y - xSize);
      this.ctx.lineTo(x + xSize, y + xSize);
      this.ctx.moveTo(x + xSize, y - xSize);
      this.ctx.lineTo(x - xSize, y + xSize);
      this.ctx.stroke();
    });
  }

  private drawSnakeBody(
    x: number,
    y: number,
    size: number,
    padding: number,
    color: string,
    glowColor: string,
    progress: number,
    body: SnakeBody,
    index: number
  ) {
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;
    const opacity = 0.9 - progress * 0.3;

    this.ctx.save();
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = 8;
    this.ctx.globalAlpha = opacity;

    const gradient = this.ctx.createRadialGradient(
      centerX - size * 0.15,
      centerY - size * 0.15,
      0,
      centerX,
      centerY,
      size * 0.5
    );
    gradient.addColorStop(0, this.lightenColor(color, 20));
    gradient.addColorStop(1, color);

    this.ctx.fillStyle = gradient;

    const radius = this.getBodyRadius(body, index);
    this.drawRoundedRect(x + padding, y + padding, size, size, radius);
    this.ctx.fill();

    this.ctx.restore();
  }

  private getBodyRadius(body: SnakeBody, index: number): [number, number, number, number] {
    const defaultRadius = this.cellSize * 0.15;
    if (index <= 0 || index >= body.length - 1) {
      return [defaultRadius, defaultRadius, defaultRadius, defaultRadius];
    }

    const prev = body[index - 1];
    const curr = body[index];
    const next = body[index + 1];

    const fromPrev = { dr: curr.r - prev.r, dc: curr.c - prev.c };
    const toNext = { dr: next.r - curr.r, dc: next.c - curr.c };

    if (fromPrev.dr === toNext.dr && fromPrev.dc === toNext.dc) {
      return [defaultRadius, defaultRadius, defaultRadius, defaultRadius];
    }

    const large = this.cellSize * 0.3;
    const small = this.cellSize * 0.08;

    if (fromPrev.dr === -1 && toNext.dc === 1) return [small, large, small, small];
    if (fromPrev.dr === -1 && toNext.dc === -1) return [large, small, small, small];
    if (fromPrev.dr === 1 && toNext.dc === 1) return [small, small, small, large];
    if (fromPrev.dr === 1 && toNext.dc === -1) return [small, small, large, small];
    if (fromPrev.dc === -1 && toNext.dr === 1) return [small, small, small, large];
    if (fromPrev.dc === -1 && toNext.dr === -1) return [small, large, small, small];
    if (fromPrev.dc === 1 && toNext.dr === 1) return [small, small, large, small];
    if (fromPrev.dc === 1 && toNext.dr === -1) return [large, small, small, small];

    return [defaultRadius, defaultRadius, defaultRadius, defaultRadius];
  }

  private drawSnakeTail(x: number, y: number, body: SnakeBody, _index: number, gameOver: boolean) {
    const padding = 3;
    const size = this.cellSize - padding * 2;
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;

    const color = gameOver ? this.theme.collision : this.theme.snakeTail;
    const glowColor = gameOver ? this.theme.collisionGlow : this.theme.snakeBodyGlow;

    const tailDir = this.getTailDirection(body);

    this.ctx.save();
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = 5;
    this.ctx.globalAlpha = 0.6;

    const gradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      size * 0.5
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.darkenColor(color, 20));

    this.ctx.fillStyle = gradient;
    this.drawRoundedRect(
      x + padding,
      y + padding,
      size,
      size,
      this.getTailRadius(tailDir)
    );
    this.ctx.fill();
    this.ctx.restore();
  }

  private getTailDirection(body: SnakeBody): Direction {
    if (body.length < 2) return "up";
    const tail = body[body.length - 1];
    const beforeTail = body[body.length - 2];

    if (tail.r < beforeTail.r) return "up";
    if (tail.r > beforeTail.r) return "down";
    if (tail.c < beforeTail.c) return "left";
    return "right";
  }

  private getTailRadius(direction: Direction): [number, number, number, number] {
    const large = this.cellSize * 0.4;
    const small = this.cellSize * 0.05;

    switch (direction) {
      case "up":
        return [large, large, small, small];
      case "down":
        return [small, small, large, large];
      case "left":
        return [large, small, small, large];
      case "right":
        return [small, large, large, small];
    }
  }

  private drawFood(positions: Position[]) {
    positions.forEach((pos) => {
      const x = pos.c * this.cellSize;
      const y = pos.r * this.cellSize;
      const centerX = x + this.cellSize / 2;
      const centerY = y + this.cellSize / 2;
      const baseRadius = this.cellSize * 0.35;

      const pulse = 1 + Math.sin(this.animationTime * 4) * 0.08;
      const radius = baseRadius * pulse;

      this.ctx.save();
      this.ctx.shadowColor = this.theme.foodGlow;
      this.ctx.shadowBlur = 15 + Math.sin(this.animationTime * 3) * 5;

      const gradient = this.ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, this.lightenColor(this.theme.food, 40));
      gradient.addColorStop(0.5, this.theme.food);
      gradient.addColorStop(1, this.darkenColor(this.theme.food, 20));

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = this.darkenColor(this.theme.food, 40);
      this.ctx.beginPath();
      this.ctx.ellipse(
        centerX + radius * 0.3,
        centerY - radius * 0.5,
        radius * 0.2,
        radius * 0.1,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      this.ctx.beginPath();
      this.ctx.arc(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  private drawPauseOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = `bold ${this.cellSize}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("PAUSED", this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.restore();
  }

  spawnFoodParticles(pos: Position) {
    const centerX = pos.c * this.cellSize + this.cellSize / 2;
    const centerY = pos.r * this.cellSize + this.cellSize / 2;

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
      const speed = 50 + Math.random() * 50;
      this.particleSystem.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 2 + Math.random(),
        size: 3 + Math.random() * 2,
        color: this.theme.food,
      });
    }
  }

  private updateParticles(deltaTime: number) {
    this.particleSystem = this.particleSystem.filter((p) => {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= p.decay * deltaTime;
      p.vx *= 0.98;
      p.vy *= 0.98;
      return p.life > 0;
    });
  }

  private drawParticles() {
    this.particleSystem.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 5;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radii: [number, number, number, number]
  ) {
    const [tl, tr, br, bl] = radii;
    this.ctx.beginPath();
    this.ctx.moveTo(x + tl, y);
    this.ctx.lineTo(x + width - tr, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
    this.ctx.lineTo(x + width, y + height - br);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
    this.ctx.lineTo(x + bl, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
    this.ctx.lineTo(x, y + tl);
    this.ctx.quadraticCurveTo(x, y, x + tl, y);
    this.ctx.closePath();
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
  }
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
};
