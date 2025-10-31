import { useGame } from "@vimazing/vim-snake";
import "@vimazing/vim-snake/game.css";
import { useKeyBindings } from "./useKeyBindings";

function App() {
  const { containerRef, gameStatus, scoreManager, keyLog, score, level } = useGame({}, useKeyBindings);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative mx-auto my-4 w-fit space-y-4">
      <h1 className="text-2xl font-bold text-center">VIMazing Snake</h1>
      
      <div className="flex gap-4 justify-center text-sm font-mono">
        <div className="px-3 py-1 bg-muted rounded">
          Time: {formatTime(scoreManager.timeValue)}
        </div>
        <div className="px-3 py-1 bg-muted rounded">
          Level: {level}
        </div>
        <div className="px-3 py-1 bg-muted rounded">
          Score: {score}
        </div>
        <div className="px-3 py-1 bg-muted rounded">
          Keystrokes: {scoreManager.totalKeystrokes}
        </div>
        {scoreManager.finalScore !== null && (
          <div className="px-3 py-1 bg-muted rounded font-bold">
            Final Score: {scoreManager.finalScore}
          </div>
        )}
      </div>

      <div ref={containerRef} className="relative" />
      
      <div className="text-center text-sm text-muted-foreground">
        {gameStatus === "waiting" && <p>Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to start</p>}
        {gameStatus === "started" && <p>Use <kbd className="px-2 py-1 bg-muted rounded">hjkl</kbd> to change direction • Press <kbd className="px-2 py-1 bg-muted rounded">q</kbd> to quit</p>}
        {gameStatus === "game-over" && <p>Game Over! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
        {gameStatus === "game-won" && <p>You Won! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
      </div>
    </div>
  );
}

export default App;
