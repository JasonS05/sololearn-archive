// created by Jason Stone

// set up some variables
var canvas, ctx;
var maxIter = 100;
var pointsPerPixel = 100;

// intial script to be run once the page loads
window.onload = function() {
	// get the canvas and associated drawing context
	canvas = document.querySelector("#canvas");
	ctx = canvas.getContext("2d");
	
	// call the main function while giving time for the page to display
	setTimeout(main, 1000);
}

// the main part of the program
function main() {
	// set up some canvas variables
	var width = canvas.width;
	var height = canvas.height;
	
	// imageData is an object containing the data array that represents the pixels of an image
	var imageData = ctx.createImageData(width, height);
	
	// a 2D array I'll be using for working with pixels
	var pixelArray = new Array(width);
	for (let i = 0; i < pixelArray.length; i++) {
		pixelArray[i] = new Array(height).fill(0);
	}
	
	// for each pixel
	for (let x = 0; x < (Math.sqrt(pointsPerPixel) * width); x++) {
		for (let y = 0; y < (Math.sqrt(pointsPerPixel) * height); y++) {
			// set up the mandelbrot variables
			let cX = x / width / Math.sqrt(pointsPerPixel) * 4 - 2;
			let cY = y / height / Math.sqrt(pointsPerPixel) * 4 - 2;
			let zX = cX;
			let zY = cY;
			let counter = 0;
			
			// the data of every location a point hits as it gets iterated on with the mandelbrot formula z[n+1]=z[n]**2+c for some complex numbers z and c
			let pixelData = [];
			
			// the main mandelbrot iterator. ++counter increments counter while checking if its still below maxIter
			while (zX * zX + zY * zY < 4 && ++counter < maxIter) {
				// push a new location on the canvas into the pixelData array for each iteration
				pixelData.push({
					x: Math.floor((zY + 2) / 4 * height),
					y: Math.floor((zX + 2) / 4 * width)
				});
				
				// do the math
				[zX, zY] = [zX * zX - zY * zY + cX, 2 * zX * zY + cY];
			}
			
			// if counter didn't reach maxIter
			if (counter < maxIter) {
				// increment a location in pixelArray for each location present in pixelData
				for (let data of pixelData) {
					pixelArray[data.x][data.y]++;
				}
			}
		}
	}
	
	// find the maximum value in pixelArray
	var max = 0;
	
	for (let column of pixelArray) {
		for (let element of column) {
			if (element > max) max = element;
		}
	}
	
	// convert pixelArray pixel values into a grayscale image in imageData
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			let pixelNum = 4 * (y * width + x);
			imageData.data[pixelNum + 0] = pixelArray[x][y] / max * 255;
			imageData.data[pixelNum + 1] = pixelArray[x][y] / max * 255;
			imageData.data[pixelNum + 2] = pixelArray[x][y] / max * 255;
			imageData.data[pixelNum + 3] = 255;
		}
	}
	
	// put the imageData on the canvas
	ctx.putImageData(imageData, 0, 0);
}
