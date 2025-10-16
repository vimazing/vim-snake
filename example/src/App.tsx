import { useGame } from "@vimazing/vim-snake";
import "@vimazing/vim-snake/game.css";
import { useKeyBindings } from "./useKeyBindings";

function App() {
  const { containerRef } = useGame(30, 20, useKeyBindings);

  return (
    <div className="relative mx-auto my-4 w-fit space-y-4">
      <h1 className="text-2xl font-bold text-center">VIMazing Snake</h1>
      <div ref={containerRef} className="relative" />
    </div>
  );
}

export default App;
