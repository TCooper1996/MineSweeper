import React from 'react';
import './App.css';
import happy from './imgs/smile.svg'
import meh from './imgs/meh.svg'
import sad from './imgs/frown.svg'
import flag from './imgs/flag.svg'
const { List } = require('immutable')

let livesImg = [
    [sad, "You have one life; be careful"],
    [meh, "You have two lives"],
    [happy, "You have three lives"],
]

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

function Square({ touched, flagged, mine, value, onClick, onContextMenu }) {
    let textColor = colors[value];
    let text = touched ? value : "";
    let textWeight = value > 3 ? "bold" : "normal"

    if (flagged){
        return <img className="tile tileImg" src={flag} alt="This tile has been flagged as a mine" onContextMenu={onContextMenu}/>
    }else{
        let classes = ""
        if (touched){
            classes = mine ? "mine" : "touched"
        }else{
            classes = "untouched"
        }
        return <button className={`tile tileBtn ${classes}`} onContextMenu={onContextMenu} style={{ color: textColor, fontWeight: textWeight }} onClick={onClick} disabled={touched}>{text}</button>
    }
}


class Board extends React.Component {
    constructor(props) {
        super(props);
        let grid = this.createBoard(props.size, 0.2);
        let safeSpaces = grid.reduce((size, row) => size + row.filter(cell => !cell.mine).length)
        this.state = {flash: false, lives: 2,  size: props.size, grid: this.createBoard(props.size, 0.2), safeSpaces: safeSpaces }
        this.resetBoard = this.resetBoard.bind(this);
    }

    onGameEnd(){
        let grid = this.state.grid;
        grid
        .map(row => row.map(cell => {cell.touched = true; return cell}));
        this.setState({grid:grid})
        setTimeout(this.resetBoard, 3000);

    }

    newCell(mine) {
        return { mine: mine, touched: false, flagged: false }
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

    //Returns the number of neighbors containing a mine
    getMinedNeighbors(grid, r, c) {
        let size = grid.length;
        return grid[r][c].minedNeighbors = this.getSurroundingNeighbors(r, c, size)
            .filter(pos => { let [r, c] = pos; return grid[r][c].mine }) //Remove cells that aren't mines
            .length //Return length as the number of mines surrounding a cell
    }

    revealCell(grid, r, c) {
        if (grid[r][c].minedNeighbors > 0) {
            return List([[r, c]])
        } else {
            return this.revealCellsRecursively(grid, r, c, List())
        }
    }

    revealCellsRecursively(grid, r, c, neighbors) {
        if (grid[r][c].minedNeighbors > 0) {
            return neighbors.push(List([r, c]));
        } else {
            let cellValid = 0;
            cellValid = ([y, x]) => !grid[y][x].mine && !grid[y][x].touched && !neighbors.includes(List([r, c]));
            let validNeighbors = this.getSurroundingNeighbors(r, c, grid.length)
                .filter(pos => cellValid(pos))
            return validNeighbors.reduce((accumNeighbors, pos) =>
                this.revealCellsRecursively(grid, pos[0], pos[1], accumNeighbors), neighbors.push(List([r, c])))
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
                grid[r][c].minedNeighbors = this.getMinedNeighbors(grid, r, c);
            }
        }
        return grid;
    }

    remainingCells(grid) {
        return grid.reduce((cells, row) => cells + row.filter(cell => !cell.mine && cell.touched).length)
    }

    handleRightClick(r, c, e){
        e.preventDefault();
        let grid = this.state.grid;
        grid[r][c].flagged = !grid[r][c].flagged;
        this.setState({grid:grid})
        console.log("right click");
    }


    handleClick(r, c) {
        let grid = this.state.grid;
        let cell = grid[r][c];

        if (cell.mine) {
            if (this.state.lives === 0){
                this.onGameEnd();
                return;
            }else{
                this.setState(function(prevState, _){
                    return {lives: prevState.lives - 1}
                })
            }
        }

        if (cell.touched) {
            return;
        }

        //Create a list of all cells that need to be revealed and update the grid.
        let cells = this.revealCell(grid, r, c)
        cells.forEach(element => {
            const [r, c] = element;
            grid[r][c].touched = true;
        });

        if (this.remainingCells(grid) === 0) {
            alert("Congratulations!");
        }
        this.setState({ grid: grid, flash: cell.mine})
    }

    resetBoard(){
        let newGrid = this.createBoard(this.state.size, 0.2);
        let safeSpaces = newGrid.reduce((size, row) => size + row.filter(x => !x.mine).length);
        this.setState({ grid: newGrid, safeSpaces: safeSpaces, flash: false, lives:2});
    }

    render() {
        let grid = this.state.grid;
        let statusIcon = livesImg[this.state.lives][0];
        let statusText = livesImg[this.state.lives][1];
        let flash = this.state.flash;

        return(
            <div>{
                grid.map((row, rIndex) =>{
                return ( 
                    <div key={rIndex}>
                        {row.map((item, cIndex) =>
                            <Square flagged={grid[rIndex][cIndex].flagged} onContextMenu={(e) => this.handleRightClick(rIndex, cIndex, e)} onClick={() => this.handleClick(rIndex, cIndex)} key={cIndex} mine={item.mine} touched={item.touched} value={item.minedNeighbors}></Square>
                        )}
                    </div>)}
                )}
                <img id={flash ? 'statusFlashing': 'statusStatic'} onAnimationEnd={() => this.setState({flash:false})} src={statusIcon} alt={statusText}/>
            </div>
        )
                
    }
}

function App() {
    return (
        <div id="App">
            <h1>Mine Sweeper</h1>
            <a href="https://github.com/TCooper1996/MineSweeper/" id="info">github</a>
            <div id="Board">
                <Board size={10}></Board>
            </div>
        </div>
    );
}

export default App;
