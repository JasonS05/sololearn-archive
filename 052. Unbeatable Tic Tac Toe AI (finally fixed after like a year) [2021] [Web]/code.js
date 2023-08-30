// declare a few variables
var canvas, width, height, ctx;

// create the board class so I can create new boards as needed for the minimax algorithm
class Board {
	// if there's no input it creates a blank board, otherwise it assumes the input is an object of the class board and copies that board's board to the new object's board
	constructor(input) {
		if (!input) this.board = [["", "", ""], ["", "", ""], ["", "", ""]];
		else {
			this.board = [[], [], []];
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					this.board[x][y] = input.board[x][y];
				}
			}
		}
	}
	// puts down an X
	makePlayerMove(x, y) {
		if (this.board[x][y] != "") throw new Error("cannot place an X at position " + x + " " + y)
		else this.board[x][y] = "X";
	}
	// puts down an O
	makeOpponentMove(x, y) {
		if (this.board[x][y] != "") throw new Error("cannot place an O at position " + x + " " + y)
		else this.board[x][y] = "O";
	}
	// gets the winner, returning either "player" (you), "opponent" (AI), or "" (no winner)
	winner() {
		if (
			(this.board[0][0] == "X" && this.board[1][0] == "X" && this.board[2][0] == "X") ||
			(this.board[0][1] == "X" && this.board[1][1] == "X" && this.board[2][1] == "X") ||
			(this.board[0][2] == "X" && this.board[1][2] == "X" && this.board[2][2] == "X") ||
			(this.board[0][0] == "X" && this.board[0][1] == "X" && this.board[0][2] == "X") ||
			(this.board[1][0] == "X" && this.board[1][1] == "X" && this.board[1][2] == "X") ||
			(this.board[2][0] == "X" && this.board[2][1] == "X" && this.board[2][2] == "X") ||
			(this.board[0][0] == "X" && this.board[1][1] == "X" && this.board[2][2] == "X") ||
			(this.board[0][2] == "X" && this.board[1][1] == "X" && this.board[2][0] == "X")
		) {
			return "player";
		} else if (
			(this.board[0][0] == "O" && this.board[1][0] == "O" && this.board[2][0] == "O") ||
			(this.board[0][1] == "O" && this.board[1][1] == "O" && this.board[2][1] == "O") ||
			(this.board[0][2] == "O" && this.board[1][2] == "O" && this.board[2][2] == "O") ||
			(this.board[0][0] == "O" && this.board[0][1] == "O" && this.board[0][2] == "O") ||
			(this.board[1][0] == "O" && this.board[1][1] == "O" && this.board[1][2] == "O") ||
			(this.board[2][0] == "O" && this.board[2][1] == "O" && this.board[2][2] == "O") ||
			(this.board[0][0] == "O" && this.board[1][1] == "O" && this.board[2][2] == "O") ||
			(this.board[0][2] == "O" && this.board[1][1] == "O" && this.board[2][0] == "O")
		) {
			return "opponent";
		} else if (this.isFull()) {
			return "tie";
		} else return "";
	}
	isFull() {
		var isFull = true;
		
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if (this.board[x][y] == "") isFull = false;
			}
		}
		
		return isFull;
	}
}

// create the main board
var mainBoard = new Board();

// for when the window loads
window.onload = function() {
	// get the canvas, its width and height, and the drawing context
	canvas = document.querySelector("#canvas");
	width = canvas.width;
	height = canvas.height;
	ctx = canvas.getContext("2d");
	
	// create the tic tac toe lines
	ctx.strokeStyle = "#000";
	ctx.beginPath();
	
	ctx.moveTo(width / 3, 0);
	ctx.lineTo(width / 3, height);
	
	ctx.moveTo(2 * width / 3, 0);
	ctx.lineTo(2 * width / 3, height);
	
	ctx.moveTo(0, height / 3);
	ctx.lineTo(width, height / 3);
	
	ctx.moveTo(0, 2 * height / 3);
	ctx.lineTo(width, 2 * height / 3);
	
	ctx.stroke();
	ctx.closePath();
	
	// create the script to be run when you click/tap on the canvas
	canvas.onclick = function(event) {
		// get the x & y of where you clicked/tapped
		var x = event.pageX - this.offsetLeft;
		var y = event.pageY - this.offsetTop;
		x = Math.floor(x / width * 3);
		y = Math.floor(y / width * 3);
		
		// if there's a valid x & y
		if (x >= 0 && x <= 2 && y >= 0 && y <= 2) {
			// if the spot is empty
			if (mainBoard.board[x][y] == "") {
				// put down an X
				putX(x, y);
				
				// initialize boardFull to true
				var boardFull = true;
				
				// for position on board
				for (let x = 0; x < 3; x++) {
					for (let y = 0; y < 3; y++) {
						// if that position is unfilled set boardFull to false
						if (mainBoard.board[x][y] == "") boardFull = false;
					}
				}
				
				// if the board is not full make the AI move
				if (!boardFull) AImove()
				// if the board is full and you won make an alert that you won and delete canvas.onclick
				else if (mainBoard.winner == "player") {
					alert("You won!")
					canvas.onclick = () => {};
				}
				// otherwise alert that it's a tie and delete canvas.onclick
				else {
					alert("It's a tie!");
					canvas.onclick = () => {};
				}
			}
		}
	}
	
	if (!confirm("Do you want to go first?")) AImove();
}

function putX(x, y) {
	// draw the X
	ctx.beginPath();
	
	ctx.moveTo(x * width / 3 + width / 12, y * height / 3 + height / 12);
	ctx.lineTo(x * width / 3 + 3 * width / 12, y * height / 3 + 3 * height / 12);
	
	ctx.moveTo(x * width / 3 + 3 * width / 12, y * height / 3 + height / 12);
	ctx.lineTo(x * width / 3 + width / 12, y * height / 3 + 3 * height / 12);
	
	ctx.stroke();
	ctx.closePath();
	
	// put down the X on the board in the program
	mainBoard.makePlayerMove(x, y);
}

function putO(x, y) {
	// draw the O
	ctx.beginPath();
	
	ctx.arc(x * width / 3 + width / 6, y * height / 3 + height / 6, width / 12, 0, 2 * Math.PI);
	
	ctx.stroke();
	ctx.closePath();
	
	// put down the O on the board in the program
	mainBoard.makeOpponentMove(x, y);
}

function AImove() {
	// if you won alert that you won and remove canvas.onclick
	if (mainBoard.winner() == "player") {
		alert("You won!");
		canvas.onclick = () => {};
	}
	// if you aren't in a winning state
	else {
		// get the best move. If this function returns null give an invalid move that doesn't return an error
		var move = getBestMove() || {x: 0, y: -1};
		
		// put down the AI move
		putO(move.x, move.y);
		
		// if the AI won alert you that it won and delete canvas.onclick
		if (mainBoard.winner() == "opponent") {
			alert("You lost!");
			canvas.onclick = () => {};
		}
		else if (mainBoard.winner() == "tie") {
			alert("It's a tie!");
			canvas.onclick = () => {};
		}
	}
}

// the minimax function
function minimax(board, player) {
	// if you won return a bad score since this is trying to get the computer to win
	if (board.winner() == "player") return -1;
	// if the AI won return a good score
	else if (board.winner() == "opponent") return 1;
	// if tie return neutral score
	else if (board.winner() == "tie") return 0;
	
	// initiate moveScores to an empty array
	let moveScores = [];
	
	// for each position on the board that is empty
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (board.board[x][y] == "") {
				// create a new board with the same state as the board passed to the function
				let newBoard = new Board(board);
				
				// if the player value passed to the function is "player" then put an X down and call minimax and add the return value to the array moveScores
				if (player == "player") {
					newBoard.makePlayerMove(x, y);
					moveScores.push(minimax(newBoard, "opponent"));
				}
				// if the player value passed to the function isn't "player" (which means opponent/AI) put an O down and call minimax and add the return value to the array moveScores
				else {
					newBoard.makeOpponentMove(x, y);
					moveScores.push(minimax(newBoard, "player"));
				}
			}
		}
	}
	
	// if this is player's turn return the minimum of the moveScores
	if (player == "player") {
		return Math.min(...moveScores);
	}
	// else return the maximum of the moveScores
	else {
		return Math.max(...moveScores);
	}
}

function getBestMove() {
	// initiate the score array
	var score = [];
	// for every empty position in the board get what happens when you put an O at that spot and return the resulting score
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (mainBoard.board[x][y] == "") {
				let newBoard = new Board(mainBoard);
				newBoard.makeOpponentMove(x, y);
				score.push([x, y, minimax(newBoard, "player")]);
			}
		}
	}
	
	// initiate the moves array and initiate bestScore to -1
	var moves = [];
	var bestScore = -1;
	
	// get the max score in score and put it in bestScore
	for (let i = 0; i < score.length; i++) {
		bestScore = Math.max(bestScore, score[i][2]);
	}
	
	// for each move in score that has a score equal to bestScore add it to the array moves
	for (let i = 0; i < score.length; i++) {
		if (score[i][2] == bestScore) {
			moves.push({x: score[i][0], y: score[i][1]});
		}
	}
	
	// return a random element of the array moves
	return moves[Math.floor(Math.random() * moves.length)];
}
