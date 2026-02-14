import { Game } from './Game';

// Initialize the game when the DOM is ready
let game: Game | null = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
  });
} else {
  game = new Game();
}

// Allow cleanup if needed (optional)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (game) {
      game.dispose();
      game = null;
    }
  });
}

