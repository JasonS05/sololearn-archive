let canvas;
let ctx;
let width;
let height;
let currentFrame;

window.onload = function() {
	canvas = document.getElementById("can");
	ctx = canvas.getContext("2d")
	width = canvas.width;
	height = canvas.height;
	
	currentFrame = new Frame(width, height);
	
	for (x = 0; x < width; x++) {
		for (y = 0; y < height; y++) {
			currentFrame.arr[x][y] = new Pixel(0.5, 0, 0);
		}
	}
	
	main();
}

function main() {
	display();
	
	currentFrame = computeNextFrame(currentFrame);
	
	window.requestAnimationFrame(main);
}

function computeNextFrame(frame) {
	let nextFrame = new Frame(frame.width, frame.height);
	
	// pyramid of doom
	for (let x = 0; x < nextFrame.width; x++) {
		for (let y = 0; y < nextFrame.height; y++) {
			let pixel = new Pixel(0, 0, 0);
		
			for (let dx = -4; dx <= 4; dx++) {
				for (let dy = -4; dy <= 4; dy++) {
					// please let the gods of variable naming have mercy on me for I have run out of decent variable names
					let _x = x + dx;
					let _y = y + dy;
					
					let xSpeedMultiplier = -1;
					let ySpeedMultiplier = -1;
					
					if (_x < 0)
						_x *= -1;
					else if (_x >= frame.width)
						_x = 2 * frame.width - _x - 1;
					else
						xSpeedMultiplier = 1;
						
					if (_y < 0)
						_y *= -1;
					else if (_y >= frame.height)
						_y = 2 * frame.height - _y - 1;
					else
						ySpeedMultiplier = 1;
					
					
					let pixel2 = frame.arr[_x][_y];
					let oldDensity = pixel.density;
					let densityChange = pixel2.density * gaussian(dx + xSpeedMultiplier * pixel2.xSpeed, dy + ySpeedMultiplier * pixel2.ySpeed, 1);
					let newDensity = oldDensity + densityChange;
					
					pixel.density = newDensity;
					pixel.xSpeed = (pixel.xSpeed * oldDensity - dx * densityChange) / newDensity || 0;
					pixel.ySpeed = (pixel.ySpeed * oldDensity - dy * densityChange) / newDensity || 0;
				}
			}
			
			nextFrame.arr[x][y] = pixel;
			
			if (x >= 50 && x < 150 && y >= 0 && y < 10) {
				nextFrame.arr[x][y].xSpeed = 1;
			}
		}
	}
	
	return nextFrame;
}

function gaussian(x, y, width) {
	let hypot = Math.hypot(x, y);
	return Math.E ** -(hypot * hypot / width) / Math.PI / width;
}

function display() {
	let imageData = ctx.createImageData(width, height);
	
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			let color = currentFrame.arr[x][y].getColor();
			
			imageData.data[4 * (x + width * y) + 0] = 255 * color[0];
			imageData.data[4 * (x + width * y) + 1] = 255 * color[1];
			imageData.data[4 * (x + width * y) + 2] = 255 * color[2];
			imageData.data[4 * (x + width * y) + 3] = 255;
		}
	}
	
	ctx.putImageData(imageData, 0, 0);
}

// from stackoverflow
function hsv2rgb([h, s, v]) {
	let f = function(n) {
		let k = (n + h/60) % 6;
		
		return v - v*s*Math.max(Math.min(k, 4 - k, 1), 0);
	}
	
	return [f(5), f(3), f(1)];
}

class Pixel {
	constructor(density, xSpeed, ySpeed) {
		this.density = density;
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
	}
	getColor() {
		//return hsv2rgb([180 * Math.atan2(this.xSpeed, this.ySpeed) / Math.PI, Math.hypot(this.xSpeed, this.ySpeed), this.density * 3])
		
		let r = 0;
		let g = 0;
		let b = 0;
		let speed = Math.hypot(this.xSpeed, this.ySpeed);
		let pressure = (this.density - 0.5) / 0.5;
		
		if (pressure < 0) {
			b = -pressure;
		} else {
			r = pressure;
		}
		
		r += speed;
		g += speed;
		b += speed;
		
		return [r, g, b];
	}
}

class Frame {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.arr = new Array(width);
		
		for (let x = 0; x < width; x++) {
			this.arr[x] = new Array(height);
			
			for (let y = 0; y < height; y++) {
				this.arr[x][y] = new Pixel(0.5, 0, 0);
			}
		}
	}
}

