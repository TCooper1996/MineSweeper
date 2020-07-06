# Minesweeper

A simple implementation of Minesweeper using React.

![Image of minesweeper during runtime](https://github.com/TCooper1996/MineSweeper/blob/master/minesweeper.png)

Attempt to uncover or flag each tile on the board without hitting more than two mines. If you click on a tile with no mine, that tile will then display the number of adjacent tiles containing mines.
If you believe that you have identified a tile containing a mine, you may right click it, which places a flag on it and indicates it may not be safe.
Clicking on a mine causes the expression of the face at the bottom of the board to deterioate. Clicking on a mine also reveals the nearby mines of that tile.
If you click on three tiles that happen to contain mines, the game ends, the remaining tiles are uncovered, and the game resets after a few seconds.
You win after every non mine is uncovered.

## View Live
As of July 6th, 2020, this application is live [here](https://tcooper1996.github.io/MineSweeper/)!

## To run yourself
To run, make sure npm is installed, then install dependencies and run.
```
sudo install npm
npm install
npm start
