// simulation constants
const dt = 0.001; // how far the line moves during each computation. Smaller is more acurate but slower and lots of tiny lines create pixelization
const step = 10; // computations per frame. Bigger number = faster. Can offset the slowness of a small dt value, but setting the step too high can result in low FPS (adding a digit to the step size takes a digit off the max FPS number)
const maxNumOfLines = 10000; // bigger number = slower to fade away. Large values can cause low FPS after a while


// Lorenz attractor constants
const ρ = 28; // rho
const σ = 10; // sigma
const β = 8/3; // beta

let [x, y, z, dx, dy, dz] = [1, 0, 20, 0, 0, 0];

class Line {
	constructor(q1, q2) {
		this.q1 = q1;
		this.q2 = q2;
	}
}

class Quaternion {
	constructor(r, i, j, k) {
		this.r = r;
		this.i = i;
		this.j = j;
		this.k = k;
	}
	normalized() {
		return this.copy().scaledBy(1/this.norm());
	}
	normalize() {
		this.scaleBy(1/this.norm());
	}
	norm() {
		return Math.sqrt(this.r**2 + this.i**2 + this.j**2 + this.k**2);
	}
	scaleBy(scale) {
		this.r *= scale;
		this.i *= scale;
		this.j *= scale;
		this.k *= scale;
	}
	scaledBy(scale) {
		return new Quaternion(
			this.r * scale,
			this.i * scale,
			this.j * scale,
			this.k * scale
		);
	}
	rotated(rotation) {
		return rotation.multipliedBy(this).multipliedBy(rotation.inverted());
	}
	rotate(rotation) {
		let newThis = this.rotated(rotation);
		this.r = newThis.r;
		this.i = newThis.i;
		this.j = newThis.j;
		this.k = newThis.k;
	}
	multipliedBy(other) {
		return new Quaternion(
			this.r * other.r - this.i * other.i - this.j * other.j - this.k * other.k,
			this.r * other.i + this.i * other.r + this.j * other.k - this.k * other.j,
			this.r * other.j - this.i * other.k + this.j * other.r + this.k * other.i,
			this.r * other.k + this.i * other.j - this.j * other.i + this.k * other.r
		);
	}
	inverted() {
		return new Quaternion(
			this.r,
			-this.i,
			-this.j,
			-this.k
		);
	}
	copy() {
		return new Quaternion(this.r, this.i, this.j, this.k);
	}
	translateBy(other) {
		this.i += other.i;
		this.j += other.j;
		this.k += other.k;
	}
	translatedBy(other) {
		let translated = this.copy();
		translated.translateBy(other);
		return translated;
	}
	dotProd(other) {
		return this.r * other.r + this.i * other.i + this.j * other.j + this.k * other.k;
	}
	crossProd(other) {
		return new Quaternion(
			0,
			this.j * other.k - this.k * other.j,
			this.k * other.i - this.i * other.k,
			this.i * other.j - this.j * other.i
		);
	}
}

const camera = {
	position: new Quaternion(0, 0, 0, -100),
	orientation: new Quaternion(1, 0, 0, 0),
	FOV: Math.PI/2,
	minZ: 1,
	maxZ: 200
};

const lines = {
	array: new Array(maxNumOfLines),
	head: 0,
	length: 0,
	orientation: new Quaternion(1, 0, 0, 0),
	position: new Quaternion(0, 0, 0, -30),
	push(line) {
		this.array[this.head] = line;
		this.head++;
		if (this.head >= maxNumOfLines) this.head = 0;
		if (this.length < maxNumOfLines) this.length++;
	},
	render(ctx, width, height) {
		for (let i = 0; i < this.length; i++) {
			let line = this.array[i];
			ctx.strokeStyle = `rgba(255, 255, 255, ${(i-this.head+maxNumOfLines)%maxNumOfLines*(maxNumOfLines**(-1))})`; // using value**(-1) instead of 1/value because slashes in ${} mess up the syntax coloring for the rest of the code on iOS/iPadOS
			ctx.beginPath();
			
			let q1 = _3Dto2D(line.q1.translatedBy(this.position).rotated(this.orientation), camera);
			let q2 = _3Dto2D(line.q2.translatedBy(this.position).rotated(this.orientation), camera);
			
			if ((q1.k > -1) && (q1.k < 1) && (q2.k > -1) && (q2.k < 1)) {
				ctx.moveTo(width*q1.i + width/2, height*q1.j + height/2);
				ctx.lineTo(width*q2.i + width/2, height*q2.j + height/2);
			}
			
			ctx.stroke();
			ctx.closePath();
		}
	}
};

window.onload = function() {
	const canvas = document.getElementById("can");
	
	canvas.addEventListener("touchstart", touchstartEventListener);
	canvas.addEventListener("touchmove", touchmoveEventListener);
	canvas.addEventListener("mousedown", mousedownEventListener);
	canvas.addEventListener("mouseup", mouseupEventListener);
	canvas.addEventListener("mousemove", mousemoveEventListener);
	
	let [width, height] = [canvas.width, canvas.height];
	const ctx = canvas.getContext("2d");
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
	
	main(ctx, width, height, {x: x, y: y, z: z});
};

function main(ctx, width, height, prevPoint) {
	let i = step;
	while (i --> 0) { // I found the --> operator on stackoverflow. It's really just "(i--) > 0", but the arrow "i --> 0" perfectly represents what it actually does.
		dx = dt * (σ * (y - x));
		dy = dt * (x * (ρ - z) - y);
		dz = dt * (x * y - β * z);
		
		x += dx;
		y += dy;
		z += dz;
		
		lines.push(new Line(new Quaternion(0, prevPoint.x, prevPoint.y, prevPoint.z), new Quaternion(0, x, y, z)));
		
		prevPoint = {x: x, y: y, z: z};
	}
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
	lines.render(ctx, width, height);
	
	window.requestAnimationFrame(() => main(ctx, width, height, prevPoint));
}

function _3Dto2D(quaternion, camera) {
	quaternion = quaternion.copy();
	quaternion.translateBy(camera.position.inverted());
	quaternion.rotate(camera.orientation.inverted());
	let oldK = quaternion.k;
	quaternion.scaleBy(1/Math.tan(camera.FOV/2)/quaternion.k);
	quaternion.k = (oldK - camera.minZ) / camera.maxZ * 2 - 1;
	return quaternion;
}

let [
	touchstartEventListener,
	touchmoveEventListener,
	mousedownEventListener,
	mouseupEventListener,
	mousemoveEventListener
] = (function(){
	let [x, y] = [0, 0];
	let mouseIsDown = false;
	
	return [
		function(event) {
			event.preventDefault();
			x = event.changedTouches[0].pageX;
			y = event.changedTouches[0].pageY;
		},
		function(event) {
			let dx = event.changedTouches[0].pageX - x;
			let dy = event.changedTouches[0].pageY - y;
			x = event.changedTouches[0].pageX;
			y = event.changedTouches[0].pageY;
			
			let θ = Math.sqrt(dx**2 + dy**2) / 1000;
			let rotation = new Quaternion(0, dy, -dx, 0);
			rotation.scaleBy(Math.sin(θ/2));
			rotation.r = Math.cos(θ/2);
			rotation.normalize();
			lines.orientation = rotation.multipliedBy(lines.orientation);
		},
		function(event) {
			mouseIsDown = true;
			event.preventDefault();
			x = event.pageX;
			y = event.pageY;
		},
		function() {
			mouseIsDown = false;
		},
		function(event) {
			if (mouseIsDown) {
				let dx = event.pageX - x || 0;
				let dy = event.pageY - y || 0;
				x = event.pageX;
				y = event.pageY;
			
				let θ = Math.sqrt(dx**2 + dy**2) / 1000;
				let rotation = new Quaternion(0, dy, -dx, 0);
				rotation.scaleBy(Math.sin(θ/2));
				rotation.r = Math.cos(θ/2);
				rotation.normalize();
				lines.orientation = rotation.multipliedBy(lines.orientation);
			}
		}
	];
})();
