export const gameInfo = {
  name: 'VIMazing Snake',
  description: 'Classic snake game with VIM-style hjkl controls',

  controls: {
    navigation: [
      { keys: 'h', description: 'Turn left' },
      { keys: 'j', description: 'Turn down' },
      { keys: 'k', description: 'Turn up' },
      { keys: 'l', description: 'Turn right' },
    ],

    game: [
      { keys: 'Space', description: 'Start game (when waiting) or restart (when game over)' },
      { keys: 'q', description: 'Quit game' },
      { keys: 'p', description: 'Pause/unpause game' },
    ],
  },

  rules: {
    movement: [
      { rule: 'Continuous Motion', description: 'Snake moves continuously in current direction' },
      { rule: 'Direction Changes', description: 'hjkl change direction on next movement frame' },
      { rule: 'Input Buffering', description: 'Rapid key presses are buffered for smooth control' },
    ],

    gameFlow: [
      {
        phase: 'Start',
        description: 'Snake spawns at center with initial size',
        objective: 'Eat food to grow and earn points',
      },
      {
        phase: 'Growth',
        description: 'Each food eaten grows snake by 1 segment',
        objective: 'Survive and reach higher levels',
      },
      {
        phase: 'Level Up',
        description: 'After eating enough food, level increases',
        objective: 'Speed increases with each level',
      },
      {
        phase: 'Game Over',
        description: 'Collision with wall or self',
        objective: 'Final score is calculated',
      },
    ],

    gameElements: [
      { element: 'Snake Head', appearance: 'Highlighted segment', description: 'Leads the snake' },
      { element: 'Snake Body', appearance: 'Connected segments', description: 'Grows when eating food' },
      { element: 'Food', appearance: 'Single cell marker', description: 'Eat to grow and gain points' },
      { element: 'Walls', appearance: 'Board boundaries', description: 'Collision causes game over' },
    ],

    collisions: [
      { type: 'Wall Collision', trigger: 'Snake head hits board edge', result: 'Game Over' },
      { type: 'Self Collision', trigger: 'Snake head collides with own body', result: 'Game Over' },
    ],
  },

  scoring: {
    formula: 'Points per food = Current Level',
    levelProgression: 'Level increases after eating {foodsPerLevel} foods (configurable)',
    speedScaling: 'Game speed (FPS) equals current level',
    finalScore: 'Current game score when game ends',
    range: 'Dynamic based on level reached',

    examples: [
      {
        level: 1,
        foodsEaten: 1,
        pointsPerFood: 1,
        totalPoints: 1,
        description: 'Starting level, first food',
      },
      {
        level: 5,
        foodsEaten: 1,
        pointsPerFood: 5,
        totalPoints: 20,
        description: 'Level 5, each food worth 5 points',
      },
      {
        level: 10,
        foodsEaten: 5,
        pointsPerFood: 10,
        totalPoints: 50,
        description: 'Level 10, eating multiple foods at high level',
      },
    ],
  },

  gameOver: {
    conditions: [
      {
        type: 'Wall Collision',
        trigger: 'Snake head reaches board boundary',
        message: 'Crashed into wall!',
        configurable: false,
      },
      {
        type: 'Self Collision',
        trigger: 'Snake head hits own body',
        message: 'Crashed into yourself!',
        configurable: false,
      },
    ],
    note: 'Final score equals current game score when collision occurs',
  },

  metrics: {
    tracked: [
      { metric: 'Time', unit: 'seconds', description: 'Elapsed time since game start' },
      { metric: 'Level', unit: 'count', description: 'Current level (also equals FPS)' },
      { metric: 'Score', unit: 'points', description: 'Total points earned' },
      { metric: 'Keystrokes', unit: 'count', description: 'Total keys pressed during game' },
      { metric: 'Snake Length', unit: 'segments', description: 'Current snake size' },
      { metric: 'Final Score', unit: 'points', description: 'Score when game ends' },
    ],
    displayed: 'Live during gameplay and final score on game over',
  },

  configuration: {
    options: [
      { option: 'cols', default: 30, description: 'Board width in cells' },
      { option: 'rows', default: 20, description: 'Board height in cells' },
      { option: 'startingLevel', default: 1, description: 'Initial level (affects starting speed and points)' },
      { option: 'foodsPerLevel', default: 10, description: 'Foods needed to level up' },
      { option: 'maxLevel', default: 25, description: 'Maximum level cap' },
      { option: 'initialSnakeSize', default: 3, description: 'Snake segments at game start' },
      { option: 'initialFoodCount', default: 1, description: 'Food items on board at start' },
    ],
    example: 'useGame({ cols: 40, rows: 30, startingLevel: 5, maxLevel: 20 })',
  },

  speedProgression: {
    formula: 'FPS = Current Level',
    description: 'Game speed is directly tied to level',
    examples: [
      { level: 1, fps: '1 frame/sec', msPerFrame: '1000ms' },
      { level: 5, fps: '5 frames/sec', msPerFrame: '200ms' },
      { level: 10, fps: '10 frames/sec', msPerFrame: '100ms' },
      { level: 25, fps: '25 frames/sec (max default)', msPerFrame: '40ms' },
    ],
  },

  objective: 'Grow your snake by eating food while avoiding walls and yourself. Higher levels mean faster gameplay and more points per food.',

  winCondition: 'There is no win condition - survival and high scores are the goal. Reach maxLevel to cap difficulty.',

  tips: [
    'Use hjkl to smoothly change direction - input buffering helps with precise turns',
    'Plan ahead - remember the snake moves every frame',
    'Higher levels are harder but award more points',
    'Try different startingLevel values for custom difficulty',
    'Configure foodsPerLevel to control level progression speed',
  ],
} as const;

export type GameInfo = typeof gameInfo;
