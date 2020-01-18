import React from 'react';
import './App.css';
const {List} = require('immutable')

let colors = {
  0: "white",
  1: "#b3ffb3",
  2: "#4dff4d",
  3: "#ffff00",
  4: "#ffcc00",
  5: "#ff9933",
  6: "#ff6600",
  7: "#ff3300",
  8: "#ff0000"

}

function Square({touched, mine, value, onClick}) {
  let bClass = touched ? "touched" : "untouched"
  let textColor =  colors[value];
  let text = touched ? value : "";
  let textWeight = value > 3 ? "bold" : "normal"
  return( <button style ={{color: textColor, fontWeight: textWeight}} className={bClass} onClick={onClick} disabled={touched}>{text}</button>)
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    let grid = this.createBoard(props.size, 0.2);
    let safeSpaces = grid.reduce((size, row) => size + row.filter(cell => !cell.mine).length)
    this.state = {size: props.size, grid: this.createBoard(props.size, 0.2), safeSpaces: safeSpaces}
    this.InBounds = this.InBounds.bind(this);
  }

  newCell(mine){
    return {mine: mine, touched: false}
  }

  InBounds(pos, size){
    return pos.every(x => 0 <= x && x < size);
  }

  //Returns the 8 positions as [row, column] surrounding the given position
  getSurroundingNeighbors(row, column, size) {
    
    //Converts an angle into a coordinate pair for indexing
    let angleToVec = (angle) => [row + Math.round(Math.sin(angle)), column + Math.round(Math.cos(angle))]

    //Fill an array with 8 angles pointing at each cell around the given position. [0, Pi/4, 2*Pi/4 .. 7*Pi/4]
    return Array(8)
      .fill(null)
      .map((_, index) => index * Math.PI / 4)
      .map(angleToVec) //Convert each angle into its rounded vector to get the position of each neighbor [[row+1, column], [row+1, column+1], [row, column + 1], ... ]
      .filter(pos => pos.every(x => 0 <= x && x < size)) //Remove out of bounds items
  }

  getMinedNeighbors(grid, r, c){
    let size = grid.length;
    return grid[r][c].minedNeighbors = this.getSurroundingNeighbors(r,c, size)
      .filter(pos => {let [r,c] = pos; return grid[r][c].mine}) //Remove cells that aren't mines
      .length //Return length as the number of mines surrounding a cell
  }

  revealCell(grid, r, c){
    if (grid[r][c].minedNeighbors > 0){
      return List([[r,c]])
    }else{
      return this.revealCellsRecursively(grid, r, c, List())
    }
  }

  revealCellsRecursively(grid, r, c, neighbors){
    if (grid[r][c].minedNeighbors > 0){
      return neighbors.push(List([r,c]));
    }else{
      let cellValid = 0;
      cellValid = ([y,x]) => !grid[y][x].mine && !grid[y][x].touched && !neighbors.includes(List([r,c]));
      let validNeighbors = this.getSurroundingNeighbors(r, c, grid.length)
        .filter(pos => cellValid(pos))
      return validNeighbors.reduce((accumNeighbors, pos) => 
        this.revealCellsRecursively(grid, pos[0], pos[1], accumNeighbors), neighbors.push(List([r,c])))
    }
  }

  createBoard(size, mChance) {
    //Create 2d array indexed as grid[row][column]
    let grid = Array(size).fill(null)
      .map(_ =>
        Array(size).fill(null)
          .map(_ => this.newCell(Math.random() < mChance))
      )

    //Calculate the number of mines surrounding each cell
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        grid[r][c].mineNeighbors = this.getMinedNeighbors(grid, r, c);
      }
    }
    return grid;
  }

  remainingCells(grid){
    return grid.reduce((cells, row) => cells + row.filter(cell => !cell.mine && cell.touched).length)
  }


  handleClick(r, c){
    let grid  = this.state.grid;
    let cell = grid[r][c];

    if (cell.mine){
      alert("Dead");
      debugger;
      let newGrid = this.createBoard(this.state.size, 0.2);
      let safeSpaces = newGrid.reduce((size, row) => size + row.filter(x => !x.mine).length);
      this.setState({grid: newGrid, safeSpaces: safeSpaces});
      return;
    }

    if (cell.touched){
      return;
    }

    let cells = this.revealCell(grid,r,c)
    cells.forEach(element => {
      const [r,c] = element;
      grid[r][c].touched = true;
    });

    if (this.remainingCells(grid) === 0){
      alert("Congratulations!");
    }
    console.log("")
    this.setState({grid:grid})
  }

  render(){
    let grid = this.state.grid;

    return (grid.map((row, rIndex) => 
      <div key={rIndex}>
        {row.map((item, cIndex) => 
          <Square onClick={()=> this.handleClick(rIndex, cIndex)} key={cIndex} mine={item.mine} touched={item.touched} value={item.minedNeighbors}></Square>
        )}
      </div>
    ))
  }
}

function App() {
  return (
    <div id="App">
      <h1>Mine Sweeper</h1>
      <div id="Board">
      <Board size={10}></Board>
      <a href="https://github.com/TCooper1996/MineSweeper/" id="info">github</a>
      </div>
    </div>
  );
}

export default App;
