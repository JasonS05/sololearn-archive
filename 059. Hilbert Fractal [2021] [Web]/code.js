const {min, sin, cos, PI: π} = Math;
const τ = 2 * π;

window.onload = () => {
	let canvas = document.getElementById("can");
	let size = min(window.innerWidth, window.innerHeight) - 20;
	canvas.width = canvas.height = size;
	let ctx = canvas.getContext("2d");
	
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, size, size);
	
	render(ctx, size);
}

function render(ctx, size) {
	let fractal = makeHilbert(2, false);
	
	ctx.strokeStyle = "black";
	const t = new Turtle(ctx, size/64, size - size/64, 0);
	for (const char of fractal) {
		switch(char) {
			case "F":
				t.moveForward((size - size/64)/64);
				break;
			case "R":
				t.turn(90);
				break;
			case "L":
				t.turn(-90);
				break;
		}
	}
}

// I was originally planning on making a function that calculated and returned the nth character
// of the hilbert sequence without just calculating the hilbert sequence the usual recursive way
// and then spitting out the desired character. However, it proved too difficult to transform
// something that spits out the whole sequence to something that just spits out the requested
// part of it without calculating the whole thing, so I am just left with this function that
// spits out the whole sequence (actually the sequence is infinite so the amount it spits out is
// the parameter n here).
//
// By hilbert sequence I mean a string containing the characters F, R, and L where F means move
// forward, R means turn right, and L means turn left.
function makeHilbert(n, inverted) {
	if (n < 0) return "";
	
	return "" + 
		makeHilbert(n - 1,  inverted) + "F" + (inverted? "L" : "R") +
		makeHilbert(n - 1, !inverted) + "F" +
		makeHilbert(n - 1, !inverted) + (inverted? "L" : "R") + "F" +
		makeHilbert(n - 1,  inverted) + (inverted? "R" : "L") + "F" +
		makeHilbert(n - 1, !inverted) + "F" + (inverted? "R" : "L") +
		makeHilbert(n - 1,  inverted) + "F" +
		makeHilbert(n - 1,  inverted) + (inverted? "R" : "L") + "F" +
		makeHilbert(n - 1, !inverted) + (inverted? "L" : "R") + "F" + (inverted? "L" : "R") +
		makeHilbert(n - 1, !inverted) + "F" + (inverted? "R" : "L") +
		makeHilbert(n - 1,  inverted) + "F" +
		makeHilbert(n - 1,  inverted) + (inverted? "R" : "L") + "F" +
		makeHilbert(n - 1, !inverted) + "F" + (inverted? "R" : "L") +
		makeHilbert(n - 1,  inverted) + "F" + (inverted? "L" : "R") +
		makeHilbert(n - 1, !inverted) + "F" +
		makeHilbert(n - 1, !inverted) + (inverted? "L" : "R") + "F" +
		makeHilbert(n - 1,  inverted);
}

class Turtle {
	constructor(ctx, x, y, θ) {
		this.ctx = ctx;
		this.x = x;
		this.y = y;
		this.θ = θ;
	}
	moveForward(distance) {
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.x += distance * sin(this.θ);
		this.y -= distance * cos(this.θ);
		this.ctx.lineTo(this.x, this.y);
		this.ctx.stroke();
	}
	turn(degrees) {
		this.θ += τ * degrees/360;
	}
}

