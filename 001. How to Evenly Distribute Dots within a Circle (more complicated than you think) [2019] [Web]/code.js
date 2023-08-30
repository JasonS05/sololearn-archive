// created by Jason Stone

"use strict";

//only executes the code after the page has finished loading
window.onload = function() {
	// defining math constants and functions
	const pi = Math.PI;
	const tau = 2 * pi;
	const sqrt = Math.sqrt;
	const sin = Math.sin;
	const cos = Math.cos;
	const rand = Math.random;

	//defining width, height, and radius
	const W = window.innerWidth;
	const H = window.innerHeight/2;
	const R = H/2;

	//defining canvas, its size, and its drawing context
	const canvas = document.getElementById("myCanvas");
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext("2d");

	//define circle drawing function with x and y position and radius as parameters
	const drawCircle = function(x, y, r, alpha) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, tau);
		//if alpha is provided draw a black circle with the given alpha
		if (alpha) {
			ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
		}
		//if alpha is not provided draw red circle
		else {
			ctx.fillStyle = "red";
		}
		ctx.fill();
		ctx.closePath();
	}

	//make the central circle
	drawCircle(W/2, H/2, R, 1)

	//define a function to create random points in a circle shape with flat distribution (same amount of points at every place within the circle)
	const makeRandomPoint = function() {
		//the square root evens out the distribution
		let distFromCenter = sqrt(rand());
		let angle = tau * rand();
		let x = distFromCenter * sin(angle);
		let y = distFromCenter * cos(angle);
		drawCircle(W/2 + R * x, H/2 + R * y, 2);
	}

	//define the main function that produces the animation
	const animation = function() {
		// no need for {...} because its just a single statement
		for (let i = 0; i < 25; i++) makeRandomPoint();
		//make the points fade with time
		drawCircle(W/2, H/2, R, 0.1)
	}

	//executes the function "animation" twenty times a second (every 50 milliseconds)
	setInterval(animation, 50);
}
