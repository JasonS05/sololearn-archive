// created by Jason Stone

var canvas, ctx;

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
		const cameraDist = 5;
		const cameraZoom = 4;
		const pointSize = 1/20;
		
		var x = this.i / (this.k + cameraDist) * cameraZoom;
		var y = this.j / (this.k + cameraDist) * cameraZoom;
		x = canvas.width / 2 * x + canvas.width / 2;
		y = canvas.height/ 2 * y + canvas.height/ 2;
		var dist = Math.sqrt(this.i ** 2 + this.j ** 2 + (this.k + cameraDist) ** 2);
		var size = 2 * Math.asin((pointSize) / (2 * dist)) / Math.PI * canvas.width;
		
		ctx.beginPath();
		ctx.arc(x, y, size, -Math.PI, Math.PI);
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fill();
		ctx.closePath();
	}
}

const Rotation = function(angle, x, y, z) {
	const scaleFactor = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
	const c = Math.sin(angle / 2) / (scaleFactor || 1);
	return new Quaternion(Math.cos(angle / 2), c * x, c * y, c * z);
}

window.onload = function() {
	canvas = document.getElementById("canvas");
	var width, height;
	
	if (window.innerWidth < window.innerHeight / 2) {
		width = window.innerWidth;
		height = window.innerWidth;
	} else {
		width = window.innerHeight / 2;
		height = window.innerHeight / 2;
	}
	
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
	canvas.width = width * 5;
	canvas.height = height * 5;
	
	const canvPos = (window.innerWidth - canvas.style.width.slice(0, -2)) / 2;
	canvas.style.marginLeft = `${canvPos}px`;
	
	ctx = canvas.getContext("2d");
	main();
}

const main = function() {
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	var points = [];
	for (let i = 0; i < 200; i++) {
		let px, py, pz;
		do {
			px = Math.random() * 2 - 1;
			py = Math.random() * 2 - 1;
			pz = Math.random() * 2 - 1;
		}
		while (px ** 2 + py ** 2 + pz ** 2 > 1);
		
		let scaleFactor = Math.sqrt(px ** 2 + py ** 2 + pz ** 2);
		px = px / scaleFactor;
		py = py / scaleFactor;
		pz = pz / scaleFactor;
		
		points.push(new Point(px, py, pz));
	}
	
	for (let point of points) {
		point.show();
	}
	
	var x, y;
	
	document.getElementById("canvas").addEventListener("touchstart", function(event) {
		event.preventDefault();
		x = event.changedTouches[0].pageX;
		y = event.changedTouches[0].pageY;
	})
	
	document.getElementById("canvas").addEventListener("touchmove", function(event){
		var dx = event.changedTouches[0].pageX - x;
		var dy = event.changedTouches[0].pageY - y;
		x = event.changedTouches[0].pageX;
		y = event.changedTouches[0].pageY;
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (let point of points) {
			point.rotate(new Rotation(Math.sqrt(dx ** 2 + dy ** 2) / 100, dy, - dx, 0));
			point.show();
		}
	})
}
