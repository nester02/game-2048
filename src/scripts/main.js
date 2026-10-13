'use strict';

const Game = require('../modules/Game.class');
const game = new Game();

const tileLayer = document.querySelector('.tiles');
const startButton = document.querySelector('.start');
const scoreElement = document.querySelector('.game-score');
const startMessage = document.querySelector('.message-start');
const winMessage = document.querySelector('.message-win');
const loseMessage = document.querySelector('.message-lose');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const SLIDE_MS = 120;

const KEY_TO_MOVE = {
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowUp: 'moveUp',
  ArrowDown: 'moveDown',
};

let tiles = createEmptyGrid();
let pendingAnimation = null;

function createEmptyGrid() {
  return Array.from({ length: 4 }, () => Array(4).fill(null));
}

function placeTile(tile, row, col) {
  tile.style.setProperty('--row', row);
  tile.style.setProperty('--col', col);
}

function createTile(value, row, col, modifier) {
  const tile = document.createElement('div');

  tile.className = `tile tile--${value}`;

  if (modifier) {
    tile.classList.add(`tile--${modifier}`);
  }

  tile.textContent = value;
  placeTile(tile, row, col);
  tileLayer.append(tile);

  return tile;
}

function renderBoard({ appear = false } = {}) {
  tileLayer.innerHTML = '';
  tiles = createEmptyGrid();

  game.getState().forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value !== 0) {
        tiles[rowIndex][colIndex] = createTile(
          value,
          rowIndex,
          colIndex,
          appear ? 'new' : null,
        );
      }
    });
  });
}

function finishPendingAnimation() {
  if (pendingAnimation) {
    clearTimeout(pendingAnimation.timer);
    pendingAnimation.finish();
  }
}

function animateMove() {
  const { moves, spawned } = game.getLastMove();
  const nextTiles = createEmptyGrid();
  const mergedSources = [];
  const mergedCells = [];

  moves.forEach(({ from, to, merged }) => {
    const tile = tiles[from.row][from.col];

    placeTile(tile, to.row, to.col);

    if (merged) {
      mergedSources.push(tile);

      const isListed = mergedCells.some(
        (cell) => cell.row === to.row && cell.col === to.col,
      );

      if (!isListed) {
        mergedCells.push(to);
      }
    } else {
      nextTiles[to.row][to.col] = tile;
    }
  });

  tiles = nextTiles;

  const finish = () => {
    const state = game.getState();

    pendingAnimation = null;
    mergedSources.forEach((tile) => tile.remove());

    mergedCells.forEach(({ row, col }) => {
      tiles[row][col] = createTile(state[row][col], row, col, 'merged');
    });

    if (spawned) {
      const { row, col } = spawned;

      tiles[row][col] = createTile(state[row][col], row, col, 'new');
    }
  };

  pendingAnimation = {
    timer: setTimeout(finish, reduceMotion.matches ? 0 : SLIDE_MS),
    finish,
  };
}

function updateInfo() {
  scoreElement.textContent = game.getScore();

  startMessage.classList.toggle('hidden', game.getStatus() !== 'idle');
  winMessage.classList.toggle('hidden', game.getStatus() !== 'win');
  loseMessage.classList.toggle('hidden', game.getStatus() !== 'lose');
}

document.addEventListener('keydown', (e) => {
  const moveName = KEY_TO_MOVE[e.key];

  if (!moveName || game.getStatus() !== 'playing') {
    return;
  }

  e.preventDefault();
  finishPendingAnimation();
  game[moveName]();

  if (game.getLastMove().changed) {
    animateMove();
  }

  updateInfo();
});

startButton.addEventListener('click', () => {
  finishPendingAnimation();

  if (game.getStatus() === 'idle') {
    startButton.textContent = 'Restart';
    startButton.classList.remove('start');
    startButton.classList.add('restart');
  } else {
    game.restart();
  }

  game.start();
  game.addRandomTile();
  game.addRandomTile();
  renderBoard({ appear: true });
  updateInfo();
});
