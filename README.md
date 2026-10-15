# 2048 Game

The classic 2048 puzzle built with vanilla JavaScript. Slide the tiles with the arrow keys, merge equal numbers and reach 2048.

## Live Preview

[nester02.github.io/game-2048](https://nester02.github.io/game-2048/)

## Design Reference

[play2048.co](https://play2048.co/) — the original game, used as the reference for rules and layout.

## Technologies Used

- JavaScript (ES6 classes and modules)
- HTML5
- SCSS
- Parcel (via `@mate-academy/scripts`)
- ESLint, Stylelint

## Getting Started

You need Node.js and npm installed.

```bash
git clone https://github.com/nester02/game-2048.git
cd game-2048
npm install
npm start
```

`npm start` runs a local dev server; open the address shown in the terminal.
`npm run build` makes a production build.

## Features

- Game logic in a separate `Game` class (`src/modules/Game.class.js`): board state, moves in four directions, merging, score, win and lose detection
- Keyboard controls with the arrow keys
- Smooth animations: tiles slide to their new cells, merged tiles pop and new tiles grow in; turned off with `prefers-reduced-motion`
- Start / Restart button, score counter, win and game-over messages
- A new tile after every move: 2 with a 90% chance, 4 with a 10% chance
