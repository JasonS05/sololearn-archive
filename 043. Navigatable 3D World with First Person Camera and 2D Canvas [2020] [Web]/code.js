alert("Tap the top or bottom of the canvas to move forward or backward, and tap the sides of the canvas to turn to the left or right, or just use the arrow keys if you're on desktop or laptop");
alert("This uses only the 2D canvas context and NO external libraries such as p5.js!");
alert("Find your way out of the maze! Despite being pretty small, it is quite hard to navigate due to the first-person view instead of the usual top-down view. BTW, yellow means starting area, and white pillar means win.");
alert("Also, if you're on desktop or laptop, you'll have to click on the canvas for the arrow keys to be responsive.");
alert("The bulk of this code is for rendering the 3D world on a 2D screen. It has to figure out that far away things can be hidden by near things, how 3D objects look on a 2D screen, etc. The code only draws lines and squares. From that it has to create 3D objects. The part that is actually responsible for the controls is quite simple.");

const {PI: π, min, sin, cos, tan, abs, hypot, atan, atan2, sqrt, round} = Math;
const τ = 2 * π;
const FOV = π/2; // Field Of View, in radians, from edge to edge

let canvas, w, h, ctx;

let winMessageHasDisplayed = false;

let camera = {
	pos: {
		x: 1,
		y: 7
	},
	orientation: {
		horizontal: 0
	}
};

const world = [
	[0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
	[1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
	[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
	[1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
	[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
	[1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
];

window.onload = function() {
	let size = min(window.innerWidth, window.innerHeight) - 20;
	canvas = document.querySelector("#canvas");
	canvas.width = canvas.height = w = h = size;
	let canvasLeftMargin = (window.innerWidth - canvas.width)/2 - 10;
	canvas.style.marginLeft = `${canvasLeftMargin}px`;
	ctx = canvas.getContext("2d");
	
	let handleRight = function() {
		camera.orientation.horizontal += π/8;
		camera.orientation.horizontal %= τ;
		if (camera.orientation.horizontal < 0) camera.orientation.horizontal += τ;
	};
	
	let handleLeft = function() {
		camera.orientation.horizontal -= π/8;
		camera.orientation.horizontal %= τ;
		if (camera.orientation.horizontal < 0) camera.orientation.horizontal += τ;
	};
	
	let handleDown = function() {
		let cx = camera.pos.x - cos(camera.orientation.horizontal)/3;
		let cy = camera.pos.y - sin(camera.orientation.horizontal)/3;
		
		if (!(world[round(cx)] && world[round(cx)][round(cy)])) {
			camera.pos.x = cx;
			camera.pos.y = cy;
		}
	};
	
	let handleUp = function() {
		let cx = camera.pos.x + cos(camera.orientation.horizontal)/3;
		let cy = camera.pos.y + sin(camera.orientation.horizontal)/3;
		
		if (!(world[round(cx)] && world[round(cx)][round(cy)])) {
			camera.pos.x = cx;
			camera.pos.y = cy;
		}
	};
	
	canvas.onclick = function(event) {
		let x = event.clientX - w/2 - canvasLeftMargin;
		let y = event.clientY - h/2;
		let angle = atan2(y, x);
		
		if (angle < π/4 && angle > -π/4) {
			handleRight();
		}
		else if (angle > 3*π/4 || angle < -3*π/4) {
			handleLeft();
		}
		else if (y > 0) {
			handleDown();
		}
		else {
			handleUp();
		}
		
		main();
	};
	
	document.onkeydown = function(event) {
		event = event || window.event;
		
		if (event.keyCode == 37) {
			handleLeft();
		}
		else if (event.keyCode == 38) {
			handleUp();
		}
		else if (event.keyCode == 39) {
			handleRight();
		}
		else if (event.keyCode == 40) {
			handleDown();
		}
		
		main();
	};
	
	main();
};

function main() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, w, h);
	
	if (camera.pos.x >= 16 && !winMessageHasDisplayed) {
		alert("Congratulations! You've reached the white pillar and won!");
		winMessageHasDisplayed = true;
	}
	
	for (let i = 0; i < w; i++) {
		let ray = new Line(camera.pos.x, camera.pos.y, (camera.orientation.horizontal + atan((i - w/2) / (w/2) * FOV)) % τ);
		
		let rayIntersections = [];
		
		for (let x = 0; x < world.length; x++) {
			for (let y = 0; y < world[x].length; y++) {
				let wall = world[x][y] ? [] : undefined;
				
				if (wall) {
					wall[0] = new Line(x + 1/2, y, π/2);
					wall[1] = new Line(x, y + 1/2, 0);
					wall[2] = new Line(x - 1/2, y, π/2);
					wall[3] = new Line(x, y - 1/2, 0);
					
					for (let line of wall) {
						let intersection = ray.getIntersection(line);
						
						if (intersection && hypot(intersection.x - line.x, intersection.y - line.y) <= 1/2 && intersection.rotatedAround(ray, ray.θ).x > 0) {
							rayIntersections.push({dist: hypot(intersection.x - ray.x, intersection.y - ray.y), type: world[x][y]});
						}
					}
				}
			}
		}
		
		rayIntersections.sort((a, b) => a.dist - b.dist);
		
		let intersection = rayIntersections[0] || {dist: 1000000, type: 1};
		let illumination = 4/intersection.dist + 2;
		intersection.dist /= sqrt(1 + (2 * FOV * i/w - FOV) ** 2); // if you're on the web version of SL, ignore the error here. It just doesn't recognize the "**" exponentiation operator.
		let top = h/2 - 1/intersection.dist * h/FOV;
		let bottom = h/2 + 1/intersection.dist * h/FOV;
		
		ctx.fillStyle = "#0af";
		ctx.fillRect(i, 0, 1, top);
		
		ctx.fillStyle = color(intersection.type, illumination);
		ctx.fillRect(i, top, 1, bottom - top);
		
		ctx.fillStyle = "#070";
		ctx.fillRect(i, bottom, 1, h - bottom);
	}
}

function color(type, illumination) {
	switch (type) {
		case 1:
			return `rgb(${illumination * 32}, ${illumination * 0}, ${illumination * 0})`;
		case 2:
			return `rgb(${illumination * 32}, ${illumination * 32}, ${illumination * 0})`;
		case 3:
			return "#fff";
	}
}

class Line {
	constructor(x, y, θ) {
		this.x = x;
		this.y = y;
		this.θ = θ;
	}
	getIntersection(otherLine) {
		let thisSlope = tan(this.θ);
		let otherLineSlope = tan(otherLine.θ);
		
		let thisIsVertical = abs(this.θ % τ - π/2) < 0.001;
		let otherLineIsVertical = abs(otherLine.θ % τ - π/2) < 0.001;
		
		let x, y;
		
		if (!thisIsVertical && !otherLineIsVertical) {
			x = (thisSlope * this.x - otherLineSlope * otherLine.x - this.y + otherLine.y) / (thisSlope - otherLineSlope);
			y = (thisSlope * this.x - otherLineSlope * otherLine.x - this.y + otherLine.y) / (thisSlope - otherLineSlope) * thisSlope + this.y - thisSlope * this.x;
		}
		else if (thisIsVertical && otherLineIsVertical) {
			return undefined;
		}
		else if (thisIsVertical) {
			x = this.x;
			y = otherLineSlope * this.x - otherLineSlope * otherLine.x + otherLine.y;
		}
		else { // otherLineIsVertical == true
			x = otherLine.x;
			y = thisSlope * otherLine.x - thisSlope * this.x + this.y;
		}
		
		return {
			x: x,
			y: y,
			rotatedAround(otherPoint, θ) {
				let x = this.x - otherPoint.x;
				let y = this.y - otherPoint.y;
				
				return {
					x: cos(θ) * x + sin(θ) * y,
					y: cos(θ) * y - sin(θ) * x,
					rotatedAround: this.rotatedAround
				};
			}
		};
	}
}

