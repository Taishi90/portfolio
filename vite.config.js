import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths: the built site works at any address, e.g.
  // https://<user>.github.io/portfolio/ (GitHub Pages) or a custom domain.
  base: './',
  build: {
    // Phaser alone is ~1.2 MB; that is expected for a game, so don't warn about it
    chunkSizeWarningLimit: 1600,
  },
});
