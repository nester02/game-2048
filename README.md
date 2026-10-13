# 2048

The classic 2048 puzzle built with vanilla JavaScript, HTML and SCSS.
Slide the tiles with the arrow keys, merge equal numbers and reach 2048.

**[Live demo](https://nester02.github.io/game-2048/)**

## Features

- Game logic in a separate ES class (`Game`): board state, moves in four directions, merging, score, win and lose detection
- Start / Restart button, score counter, win and game-over messages
- Random new tile after every move (2 with 90% chance, 4 with 10%)

## Tech stack

JavaScript (ES6 classes), HTML, SCSS, Parcel, ESLint, Stylelint.

## Run locally

```bash
git clone https://github.com/nester02/game-2048.git
cd game-2048
npm install
npm start
```
