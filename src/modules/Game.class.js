'use strict';

/**
 * 2048 game logic: board state, moves, score and status.
 */
class Game {
  /**
   * Creates a new game instance.
   *
   * @param {number[][]} initialState
   * The initial state of the board.
   * @default
   * [[0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0]]
   *
   * If passed, the board will be initialized with the provided
   * initial state.
   */
  constructor(initialState) {
    if (initialState) {
      this.field = initialState;
    } else {
      this.field = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
    }
    this.score = 0;
    this.status = 'idle';
  }

  moveLeft() {
    this.move('left');
  }

  moveRight() {
    this.move('right');
  }

  moveUp() {
    this.move('up');
  }

  moveDown() {
    this.move('down');
  }

  /**
   * Slides all tiles in one direction and records where each tile went,
   * so the view can animate the move.
   *
   * @param {'left'|'right'|'up'|'down'} direction
   */
  move(direction) {
    const oldState = JSON.stringify(this.field);

    this.lastMove = {
      moves: [], spawned: null, changed: false,
    };
    this.lastSpawned = null;

    this.getLines(direction).forEach((line) => this.slideLine(line));

    this.lastMove.changed = oldState !== JSON.stringify(this.field);
    this.updateStatusAfterMove(oldState);
    this.lastMove.spawned = this.lastSpawned;
  }

  /**
   * @returns {{
   *   moves: { from: object, to: object, merged: boolean }[],
   *   spawned: { row: number, col: number } | null,
   *   changed: boolean
   * }}
   */
  getLastMove() {
    return this.lastMove || {
      moves: [], spawned: null, changed: false,
    };
  }

  /**
   * Returns the 4 lines of cell coordinates for a direction, each ordered
   * from the edge the tiles slide towards.
   */
  getLines(direction) {
    const lines = [];

    for (let i = 0; i < 4; i++) {
      const line = [];

      for (let j = 0; j < 4; j++) {
        switch (direction) {
          case 'left':
            line.push([i, j]);
            break;
          case 'right':
            line.push([i, 3 - j]);
            break;
          case 'up':
            line.push([j, i]);
            break;
          default:
            line.push([3 - j, i]);
        }
      }

      lines.push(line);
    }

    return lines;
  }

  slideLine(line) {
    const tiles = line
      .map(([row, col]) => ({
        row, col, value: this.field[row][col],
      }))
      .filter((tile) => tile.value !== 0);
    const result = [];

    tiles.forEach((tile) => {
      const last = result[result.length - 1];

      if (last && !last.merged && last.value === tile.value) {
        last.value *= 2;
        last.merged = true;
        last.sources.push(tile);
        this.score += last.value;
      } else {
        result.push({
          value: tile.value, merged: false, sources: [tile],
        });
      }
    });

    line.forEach(([row, col], index) => {
      const cell = result[index];

      this.field[row][col] = cell ? cell.value : 0;

      if (cell) {
        cell.sources.forEach((source) => {
          this.lastMove.moves.push({
            from: {
              row: source.row, col: source.col,
            },
            to: {
              row, col,
            },
            merged: cell.merged,
          });
        });
      }
    });
  }

  /**
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * @returns {number[][]}
   */
  getState() {
    return this.field;
  }

  /**
   * Returns the current game status.
   *
   * @returns {string} One of: 'idle', 'playing', 'win', 'lose'
   *
   * `idle` - the game has not started yet (the initial state);
   * `playing` - the game is in progress;
   * `win` - the game is won;
   * `lose` - the game is lost
   */
  getStatus() {
    return this.status;
  }

  /**
   * Starts the game.
   */
  start() {
    this.status = 'playing';
  }

  /**
   * Resets the game.
   */
  restart() {
    this.field = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    this.score = 0;
    this.status = 'idle';
  }

  hasChanged(oldField, newField) {
    return oldField !== newField;
  }

  addRandomTile() {
    const emptyCells = [];

    this.field.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 0) {
          emptyCells.push({
            row: rowIndex, col: colIndex,
          });
        }
      });
    });

    if (emptyCells.length > 0) {
      const randomCell
        = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.1 ? 4 : 2;

      this.field[randomCell.row][randomCell.col] = value;

      this.lastSpawned = {
        row: randomCell.row, col: randomCell.col,
      };
    }
  }

  hasWin() {
    return this.field.some((row) => row.includes(2048));
  }

  hasEmptyCells() {
    return this.field.some((row) => row.includes(0));
  }

  canMerge() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = this.field[row][col];

        if (col < 3 && current === this.field[row][col + 1]) {
          return true;
        }

        if (row < 3 && current === this.field[row + 1][col]) {
          return true;
        }
      }
    }

    return false;
  }

  hasLose() {
    return !this.hasEmptyCells() && !this.canMerge();
  }

  updateStatusAfterMove(oldState) {
    const newState = JSON.stringify(this.field);

    if (!this.hasChanged(oldState, newState)) {
      return;
    }

    if (this.hasWin()) {
      this.status = 'win';

      return;
    }

    this.addRandomTile();

    if (this.hasLose()) {
      this.status = 'lose';
    }
  }
}
module.exports = Game;
