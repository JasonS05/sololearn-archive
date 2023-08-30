// created by Jason Stone

// initialize some variables in the global scope so all functions can access them
var canvas, width, height, ctx, then, gravityEnabled;
var balls = [];

// set up some math constants
const pi = Math.PI;
const tau = pi * 2;
const sin = Math.sin;
const cos = Math.cos;
const atan2 = Math.atan2;
const hypot = Math.hypot;
const cbrt = Math.cbrt;

// configurables
const numberOfBalls = 50;

const minVX = -0.1;
const maxVX = 0.1;

const minVY = -0.1;
const maxVY = 0.1;

const minRad = 5;
const maxRad = 20;

const gravity = 0.0001;

// rotates the point (x, y) around the origin by the specified angle 
function rotate(x, y, angle) {
	return {
		x: x * sin(angle) - y * cos(angle),
		y: x * cos(angle) + y * sin(angle)
	};
}

// class that all the balls belong to
class Ball {
	constructor(x, y, vx, vy, mass, radius, color) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.mass = mass;
		this.radius = radius;
		this.color = color;
	}
	move(dt) {
		// adjust the x and y according to the velocity
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		
		// add gravity
		if (gravityEnabled) this.vy += gravity * dt;
		
		// wall collision checking
		if (this.x - this.radius < 0) {
			if (this.vx < 0) {
				this.vx *= -1;
			}
			this.x = this.radius;
		}
		if (this.y - this.radius < 0) {
			if (this.vy < 0) {
				this.vy *= -1;
			}
			this.y = this.radius;
		}
		if (this.x + this.radius > width) {
			if (this.vx > 0) {
				this.vx *= -1;
			}
			this.x = width - this.radius;
		}
		if (this.y + this.radius > height) {
			if (this.vy > 0) {
				this.vy *= -1;
			}
			this.y = height - this.radius;
		}
	}
	show() {
		ctx.fillStyle = this.color;
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, 0, tau);
		ctx.fill();
		ctx.closePath();
	}
	collide(otherBall) {
		// create a temporary variable for use when I don't know what to name a variable
		var temp;
		
		// get the angle of the collision
		var angle = atan2(this.x - otherBall.x, this.y - otherBall.y);
		
		// prevent balls from getting stuck to each other by shoving them
		// out of each other without moving their combined center of mass
		var overlap = this.radius + otherBall.radius - hypot(this.x - otherBall.x, this.y - otherBall.y);
		var totalMass = this.mass + otherBall.mass;
		
		this.x += overlap * sin(angle) * otherBall.mass / totalMass;
		this.y += overlap * cos(angle) * otherBall.mass / totalMass;
		
		otherBall.x -= overlap * sin(angle) * this.mass / totalMass;
		otherBall.y -= overlap * cos(angle) * this.mass / totalMass;
		
		// set up the variables for the equation while rotating the collision to make it along the x-axis.
		// variable names come from the wikipedia page on elastic collisions
		temp = rotate(this.vx, this.vy, -angle);
		var u1 = temp.x;
		var thisVY = temp.y;
		
		temp = rotate(otherBall.vx, otherBall.vy, -angle);
		var u2 = temp.x;
		var otherVY = temp.y;
		
		var m1 = this.mass;
		var m2 = otherBall.mass;
		
		// do the math
		var v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2);
		var v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2);
		
		// give each ball its new velocity
		var thisNewSpeed = rotate(v1, thisVY, angle);
		var otherNewSpeed = rotate(v2, otherVY, angle);
		
		// I don't know why the speed here is reversed. All I know is that it doesn't work without it reversed
		this.vx = -thisNewSpeed.x;
		this.vy = -thisNewSpeed.y;
		
		otherBall.vx = -otherNewSpeed.x;
		otherBall.vy = -otherNewSpeed.y;
	}
}

// the script to be run once the HTML has finished loading so that the canvas is present when this runs
window.onload = function() {
	// set up the canvas and its drawing context
	canvas = document.querySelector("#canvas");
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;
	ctx = canvas.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
	
	// create the balls
	for (let i = 0; i < numberOfBalls; i++) {
		let x = Math.random() * width;
		let y = Math.random() * height;
		let vx = Math.random() * (maxVX - minVX) + minVX;
		let vy = Math.random() * (maxVY - minVY) + minVY;
		let radius = Math.random() * (maxRad - minRad) + minRad;
		let mass = radius * radius * radius;
		let color = `rgb(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55})`;
		balls.push(new Ball(x, y, vx, vy, mass, radius, color));
	}
	
	// gravity checkbox handling
	document.querySelector("#gravity").onclick = function() {
		if (this.checked) gravityEnabled = true;
		else gravityEnabled = false;
	}
	
	// initalize the variable for keeping track of time
	then = new Date().getTime();
	// call the main function
	main()
}

function main() {
	// find time passed since main was last called
	var now = new Date().getTime();
	var dt = now - then;
	then = now;
	
	// clear the canvas
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
	
	// move and show each ball
	for (let ball of balls) {
		ball.move(dt);
		ball.show();
	}
	
	// collide each ball with every ball its in contact with
	for (let i = 0; i < balls.length; i++) {
		for (let j = i + 1; j < balls.length; j++) {
			let dist = hypot(balls[i].x - balls[j].x, balls[i].y - balls[j].y);
		 	if (balls[i].radius + balls[j].radius > dist) {
		 		balls[i].collide(balls[j]);
		 	}
		}
	}
	
	// use setTimeout to call main and to give time for the display to render
	setTimeout(main, 0);
}
