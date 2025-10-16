import { useGame } from "@vimazing/vim-snake";
import "@vimazing/vim-snake/game.css";
import { useKeyBindings } from "./useKeyBindings";

function App() {
  const { containerRef, gameStatus } = useGame(30, 20, useKeyBindings);

  return (
    <div className="relative mx-auto my-4 w-fit space-y-4">
      <h1 className="text-2xl font-bold text-center">VIMazing Snake</h1>
      <div ref={containerRef} className="relative" />
      <div className="text-center text-sm text-muted-foreground">
        {gameStatus === "waiting" && <p>Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to start</p>}
        {gameStatus === "started" && <p>Use <kbd className="px-2 py-1 bg-muted rounded">hjkl</kbd> to move • Press <kbd className="px-2 py-1 bg-muted rounded">q</kbd> to quit</p>}
        {gameStatus === "game-over" && <p>Game Over! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
      </div>
    </div>
  );
}

export default App;
