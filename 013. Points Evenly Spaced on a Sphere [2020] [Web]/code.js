// created by Jason Stone

// globals
var canvas, ctx, width, height;

// constants
const {PI: pi, random, sqrt, asin, sin, cos} = Math;
const tau = 2 * pi;
const goldenRatio = (1 + sqrt(5)) / 2;

// configurables
const numOfPoints = 500;
const pointSize = 1;
const backgroundColor = "#000";
const dotColor = "#fff";
const dotOutlineColor = "#000";

window.onload = function() {
	canvas = document.querySelector("#canvas");
	width = canvas.width;
	height = canvas.height;
	ctx = canvas.getContext("2d");
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, width, height);
	
	var points = [];
	var angle1, angle2, px, py, pz;
	for (var i = 0; i < numOfPoints; i++) {
		angle1 = i * goldenRatio * tau;
		angle2 = asin(i / numOfPoints * 2 - 1) + pi / 2;
		px = sin(angle1) * sin(angle2);
		py = cos(angle1) * sin(angle2);
		pz = cos(angle2);
		
		points.push(new Point(px, py, pz));
	}
	
	for (var point of points) {
		point.show();
	}
	
	var x, y;
	
	canvas.addEventListener("touchstart", function(event) {
		event.preventDefault();
		x = event.changedTouches[0].pageX;
		y = event.changedTouches[0].pageY;
	})
	
	canvas.addEventListener("touchmove", function(event) {
		var dx = event.changedTouches[0].pageX - x;
		var dy = event.changedTouches[0].pageY - y;
		x = event.changedTouches[0].pageX;
		y = event.changedTouches[0].pageY;
		
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, width, height);
		
		points.sort((point1, point2) => point1.k < point2.k)
		for (var point of points) {
			point.rotate(new Rotation(sqrt(dx ** 2 + dy ** 2) / 100, dy, -dx, 0));
			point.show();
		}
	})
	
	var mouseIsDown = false;
	
	document.addEventListener("mousedown", function(event) {
		mouseIsDown = true;
		event.preventDefault();
		var canvRect = canvas.getBoundingClientRect();
		x = event.pageX - canvRect.left;
		y = event.pageY - canvRect.top;
	})
	
	document.addEventListener("mouseup", function() {
		mouseIsDown = false;
	})
	
	canvas.addEventListener("mousemove", function(event) {
		if (mouseIsDown) {
			var canvRect = canvas.getBoundingClientRect();
			var dx = event.pageX - canvRect.left - x || 0;
			var dy = event.pageY - canvRect.top - y || 0;
			x = event.pageX - canvRect.left;
			y = event.pageY - canvRect.top;
			
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, width, height);
			
			points.sort((point1, point2) => point1.k < point2.k)
			for (var point of points) {
				point.rotate(Rotation(sqrt(dx ** 2 + dy ** 2) / 100, dy, -dx, 0));
				point.show();
			}
		}
	})
}

class Quaternion {
	constructor(r, i, j, k) {
		this.r = r;
		this.i = i;
		this.k = k;
		this.j = j;
	}
	static mult(q1, q2) {
		var r = q1.r * q2.r - q1.i * q2.i - q1.j * q2.j - q1.k * q2.k;
		var i = q1.r * q2.i + q1.i * q2.r + q1.j * q2.k - q1.k * q2.j;
		var j = q1.r * q2.j - q1.i * q2.k + q1.j * q2.r + q1.k * q2.i;
		var k = q1.r * q2.k + q1.i * q2.j - q1.j * q2.i + q1.k * q2.r;
		return new Quaternion(r, i, j, k);
	}
	static inv(q) {
		return new Quaternion(q.r, -q.i, -q.j, -q.k);
	}
}

class Point {
	constructor(xPos, yPos, zPos) {
		this.r = 0;
		this.i = xPos;
		this.j = yPos;
		this.k = zPos;
	}
	rotate(rotation) {
		var q = Quaternion.mult(Quaternion.mult(rotation, this), Quaternion.inv(rotation));
		this.i = q.i;
		this.j = q.j;
		this.k = q.k;
	}
	show() {
		var x = this.i / (this.k + 5) * 4;
		var y = this.j / (this.k + 5) * 4;
		x = width / 2 * x + width / 2;
		y = height/ 2 * y + height/ 2;
		var dist = sqrt(this.i ** 2 + this.j ** 2 + (this.k + 5) ** 2);
		var size = 2 * asin((pointSize/20) / (2 * dist)) / pi * width;
		
		ctx.beginPath();
		ctx.arc(x, y, size + 1, 0, 2 * tau);
		ctx.fillStyle = dotOutlineColor;
		ctx.fill();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.arc(x, y, size, 0, 2 * tau);
		ctx.fillStyle = dotColor;
		ctx.fill();
		ctx.closePath();
	}
}

function Rotation(angle, x, y, z) {
	const scaleFactor = sqrt(x ** 2 + y ** 2 + z ** 2);
	const c = sin(angle / 2) / scaleFactor;
	if (c) return new Quaternion(cos(angle / 2), c * x, c * y, c * z);
	else return new Quaternion(1, 0, 0, 0);
}
