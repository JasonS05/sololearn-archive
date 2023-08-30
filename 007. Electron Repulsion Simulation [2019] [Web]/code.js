// created by Jason Stone */

//helps catch more errors
"use strict";

var W, H, canvas, ctx;

//create the array containing all particles
var electrons = []; 

alert("Make sure to use landscape mode. You can comment this out if you don't want it showing up every time you refresh the simulation.");

window.onload = function() {
	//set up canvas and a couple constants
	W = window.innerWidth;
	H = window.innerHeight/2;
	canvas = document.getElementById("myCanvas");
	canvas.width = W;
	canvas.height = H;
	ctx = canvas.getContext("2d");
	
	//setup canvas
	resetCanvas(false)
	
	//creates the electrons with random positions in a rectangle within the circle
	for (let i=0; i<500; i++) {
		electrons.push(new Electron(H/2*Math.random()-H/4+W/2, H/2*Math.random()+H/4));
	}
	
	//begin animation
	window.requestAnimationFrame(animate);
}

//resets canvas to all white with a black circle in the middle
const resetCanvas = function(lowRgbaAlpha) {
	//draw the central black circle
	ctx.beginPath();
	ctx.arc(W/2, H/2, H/2, 0, 2 * Math.PI);
	if (lowRgbaAlpha) {
	//creates trail by taking multiple frames to remove it
		ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
	}
	else {
		ctx.fillStyle = "rgb(0, 0, 0)";
	}
	ctx.fill();
	ctx.closePath();
}

//electron class
class Electron {
	constructor (x, y) {
		//x & y position
		this.x = x;
		this.y = y;
	}

	//get force between self and another electron
	getForce(electron) {
		var dist = Math.hypot(this.x - electron.x, this.y - electron.y);
		var force = 1/(dist ** 2);
		var angle = Math.atan2(this.x - electron.x, this.y - electron.y);
		return [Math.sin(angle) * force, Math.cos(angle) * force];
	}

	//move the particle an amount corresponding to the force from all other electrons
	move() {
		var xforce = 0;
		var yforce = 0;
		for (let electron of electrons) {
			//if statement prevents the electron from interacting with itself causing an error
			if (this.x != electron.x || this.y != electron.y) {
				let force = this.getForce(electron);
				xforce += 100 * force[0];
				yforce += 100 * force[1];
			}
		}
		this.x += xforce;
		this.y += yforce;

		//moves the electron back into the black circle if it is not already
		if (Math.hypot(this.x - W/2, this.y - H/2) > H/2 - 2) {
			//fancy stuff to move it back to the correct position
			let angle = Math.atan2(this.x - W/2, this.y - H/2);
			this.x = (H/2 - 2) * Math.sin(angle) + W/2;
			this.y = (H/2 - 2) * Math.cos(angle) + H/2;
		}
	}

	//draws the electron on the canvas
	draw(r, g, b) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
		ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
		ctx.fill();
		ctx.closePath();
	}
}

function animate() {
	//resets canvas with trails enabled
	resetCanvas(true)
	//updates every electron
	for (let electron of electrons) {
		electron.move();
		electron.draw(0, 127, 255);
	}
	//recursively call itself
	window.requestAnimationFrame(animate);
}
