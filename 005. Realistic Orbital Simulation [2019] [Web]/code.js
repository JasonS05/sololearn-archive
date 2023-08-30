// created by Jason Stone

var canvas, canvas2, width, height, ctx, ctx2, bodies;
var then = new Date().getTime();
const pi = Math.PI;
const tau = 2 * pi;
const sin = Math.sin;
const cos = Math.cos;
const atan2 = Math.atan2;
const hypot = Math.hypot;
const cbrt = Math.cbrt;
const gravityStrength = 1/500;

var loops = 0;

window.onload = function() {
	canvas = document.querySelector("#canvas");
	canvas2 = document.querySelector("#canvas2");
	width = canvas2.width = canvas.width = window.innerWidth / 2 - 4;
	height = canvas2.height = canvas.height = window.innerHeight - 100;
	ctx = canvas.getContext("2d");
	ctx2 = canvas2.getContext("2d");
	
	document.querySelector("#button1").onclick = function() {
		bodies = [
			new Body(width/2, height/2, 0, -0.0005, 1000, "#ff0"), // sun
			new Body(width/2 + 100, height/2, 0, 0.141, 10, "#00f"), // earth
			new Body(width/2 + 110, height/2, 0, 0.09, 1, "#aaa"), // moon
			new Body(width/2 - 150, height/2, 0, -0.115, 10, "#f00")  // mars
		];
	}
	
	document.querySelector("#button2").onclick = function() {
		bodies = [
			new Body(width/2, height/2, 0, -0.00154, 1000, "#ff0"), // sun
			new Body(width/2 + 102, height/2	, 0, 0.14, 10, "#00f"), // earth
			new Body(width/2 + 51, height/2 - 88.3, 0.121, 0.07, 1, "#aaa"), // lagrange point 4 orbiter
			new Body(width/2 + 51, height/2 + 88.3, -0.121, 0.07, 1, "#aaa")  // lagrange point 5 orbiter
		];
	}
	
	ctx.fillStyle = "#000";
	ctx2.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
	ctx2.fillRect(0, 0, width, height);
	main();
}

function main() {
	var now = new Date().getTime();
	var dt = now - then;
	then = now;
	
	ctx.fillStyle = "#00000001";
	ctx2.fillStyle = "#00000001";
	ctx.fillRect(0, 0, width, height);
	ctx2.fillRect(0, 0, width, height);
	
	if (bodies) {
		for (let body of bodies) {
			body.move(dt);
		}
		
		for (let body of bodies) {
			body.show();
			body.show2();
		}
	}
	
	setTimeout(main, 0);
}

class Body {
	constructor(x, y, vx, vy, mass, color) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.mass = mass;
		this.color = color;
	}
	show() {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, cbrt(this.mass), 0, tau);
		ctx.fill();
		ctx.closePath();
	}
	show2() {
		var x = this.x - bodies[0].x;
		var y = this.y - bodies[0].y;
		var rotation = atan2(bodies[1].x - bodies[0].x, bodies[1].y - bodies[0].y);
		var dist = hypot(x, y);
		var angle = atan2(x, y) - rotation;
		var newX = dist * sin(angle) + width/2;
		var newY = dist * cos(angle) + height/2;
		
		ctx2.fillStyle = this.color;
		ctx2.beginPath();
		ctx2.arc(newX, newY, cbrt(this.mass), 0, tau);
		ctx2.fill();
		ctx2.closePath();
	}
	move(dt) {
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		for (let body of bodies) {
			if (body != this) {
				var dist = hypot(this.x - body.x, this.y - body.y);
				var angle = atan2(this.x - body.x, this.y - body.y);
				var acceleration = gravityStrength * body.mass / (dist ** 2);
				this.vx -= acceleration * sin(angle) * dt;
				this.vy -= acceleration * cos(angle) * dt;
			}
		}
	}
}
