/*

This simulation actually isn't on a flat grid/plane, but actually on what's known as a torus. Basically, the top wraps around to the bottom and the left to the right, so if there is a glider (a certain pattern that perpetually moves itself along) and it hits the top it'll re-appear at the bottom and same for the sides.

Also, for those of you wondering, this took me two or three hours to make and get working. The only thing left is to optimize so it isn't so slow. And yes, I consider this slow. A good algorithm will get faster as there is less activity, but mine always takes the same amount of time regardless of activity.

UPDATE: Now the algorithm is more efficient and ignores inactive cells.

UPDATE: Turns out proxies are rediculously slow. I removed the proxy and now it goes at least 100x faster. I got to multiply the resolution by 5 (now 250 x 250 instead of 50 x 50) which multiplied the number of cells by 25 and it still runs at a much higher FPS than it did when it used proxies.

*/

let canvas, width, height, ctx, cells;
let pixelsPerCell = 2;
let targetFPS = 60;

window.onload = function() {
	canvas = document.querySelector("#canvas");
	width = Math.floor(canvas.width / pixelsPerCell);
	height = Math.floor(canvas.height / pixelsPerCell);
	ctx = canvas.getContext("2d");
	
	cells = new Array(width);
	for (let x = 0; x < width; ++x) {
		cells[x] = new Array(height);
		for (let y = 0; y < height; ++y) {
			if (x > (width / 3) && x < (2 * width / 3) && y > (height / 3) && y < (2 * height / 3)) {
				cells[x][y] = new Cell(((Math.random() > 1/2)? true : false), true);
			}
			else {
				cells[x][y] = new Cell(true, true);
			}
		}
	}
	
	main();
};

function main() {
	let lastCalled = new Date().getTime();
	
	draw();
	calculateNextGen();
	
	setTimeout(main, 1000/targetFPS + lastCalled - new Date().getTime());
}

function draw() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = "#0f0";
	for (let x = 0; x < width; ++x) {
		for (let y = 0; y < height; ++y) {
			if (cells[x][y].isAlive) {
				ctx.fillRect(x * pixelsPerCell, y * pixelsPerCell, pixelsPerCell, pixelsPerCell);
			}
		}
	}
}

function calculateNextGen() {
	let newCells = new Array(width);
	let neighbors;
	for (let x = 0; x < width; ++x) {
		newCells[x] = new Array(height);
		for (let y = 0; y < height; ++y) {
			if (cells[x][y].isActive) {
				neighbors = 0;
				
				// implicitly converts bool to int with {true: 1, false: 0}
				neighbors += cells.get(x - 1).get(y - 1).isAlive;
				neighbors += cells.get(x - 1).get(y + 0).isAlive;
				neighbors += cells.get(x - 1).get(y + 1).isAlive;
				neighbors += cells.get(x + 0).get(y - 1).isAlive;
				neighbors += cells.get(x + 0).get(y + 1).isAlive;
				neighbors += cells.get(x + 1).get(y - 1).isAlive;
				neighbors += cells.get(x + 1).get(y + 0).isAlive;
				neighbors += cells.get(x + 1).get(y + 1).isAlive;
				
				if (neighbors === 3) {
					newCells[x][y] = new Cell(true, true);
				}
				else if (neighbors === 2) {
					newCells[x][y] = new Cell(cells[x][y].isAlive, true);
				}
				else {
					newCells[x][y] = new Cell(false, true);
				}
				
				if (newCells[x][y].isAlive === cells[x][y].isAlive) {
					newCells[x][y].isActive = false;
				}
			}
			else {
				newCells[x][y] = new Cell(cells[x][y].isAlive, false);
			}
		}
	}
	
	for (let x = 0; x < width; ++x) {
		for (let y = 0; y < height; ++y) {
			cells[x][y].isAlive = newCells[x][y].isAlive;
			cells[x][y].isActive = newCells[x][y].isActive;
		}
	}
	
	for (let x = 0; x < width; ++x) {
		for (let y = 0; y < height; ++y) {
			if (cells[x][y].isActive) {
				// set cells next to active cells to active because they could change in the next generation
				newCells.get(x - 1).get(y - 1).isActive = true;
				newCells.get(x - 1).get(y + 0).isActive = true;
				newCells.get(x - 1).get(y + 1).isActive = true;
				newCells.get(x + 0).get(y - 1).isActive = true;
				newCells.get(x + 0).get(y + 1).isActive = true;
				newCells.get(x + 1).get(y - 1).isActive = true;
				newCells.get(x + 1).get(y + 0).isActive = true;
				newCells.get(x + 1).get(y + 1).isActive = true;
			}
		}
	}
	
	cells = newCells;
}

Array.prototype.get = function(index) {
	if (index < 0) {
		return this[this.length - 1];
	}
	else if (index >= this.length) {
		return this[0];
	}
	else {
		return this[index];
	}
};

class Cell {
	constructor(isAlive, isActive) {
		this.isAlive = isAlive;
		this.isActive = isActive;
	}
}
