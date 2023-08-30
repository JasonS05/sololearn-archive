//created by Jason Stone

//my attempt at mandelbrot with canvas using pure javascript. I may add comments later
"use strict";

var time = new Date();
const log2 = Math.log(2);

const plotTheMandelbrot = function() {
	const zoom = parseFloat(document.getElementById("zoom").value);
	const xCenter = parseFloat(document.getElementById("x").value);
	const yCenter = parseFloat(document.getElementById("y").value);
	const maxIter = document.getElementById("maxIter").value;

	for (let i = n; i < imageData.data.length/4; i++) {
		let x = i % canvas.height;
		let y = (i - x) / canvas.height;
		x = (x / canvas.height) * 4 / zoom - 2 / zoom + xCenter;
		y = (y / canvas.height) * 4 / zoom - 2 / zoom - yCenter;

		let cx = x;
		let cy = y;
		let zx = cx;
		let zy = cy;
		let iter = 1;
		
		while (zx * zx + zy * zy < 100) {
			iter++;
			let zxTemp = zx;
			zx = zx * zx - zy * zy + cx;
			zy = 2 * zxTemp * zy + cy;

			if (iter > maxIter) {
				iter = 0;
				break;
			}
		}

		let color = 30 * Math.log(iter + 1 - Math.log(Math.log(Math.sqrt(zx*zx+zy*zy)))/log2);

		let rgba = new Array(4);
		if (iter) {
			rgba[0] = (Math.sin(color/2 - Math.PI/2) + 1) / 2 * 255;
			rgba[1] = (Math.sin(color/3 - Math.PI/2) + 1) / 2 * 255;
			rgba[2] = (Math.sin(color/5 - Math.PI/2) + 1) / 2 * 255;
			rgba[3] = 255;
		} else {
			rgba[0] = 0;
			rgba[1] = 0;
			rgba[2] = 0;
			rgba[3] = 255;
		}

		for (let j = 0; j < 4; j++) {
			imageData.data[4 * i + j] = rgba[j];
		}

		n = i;
		var now = new Date();
		var timeDif = now.getMilliseconds() - time.getMilliseconds();
		if (timeDif > 20 || timeDif < 0) {
			time = new Date();
			break;
		}
	}

	let percentage = n/(imageData.data.length/4) * 100;
	if (n + 1 < imageData.data.length/4) {
		document.getElementById("progress").style.width = `${percentage}%`;
		setTimeout(plotTheMandelbrot, 0);
	}
	else {
		ctx.putImageData(imageData, 0, 0);
		document.getElementById("progress").style.width = "0";
		document.getElementById("container").style.visibility = "hidden";
	}
};

var n;
const main = function() {
	n = 0;
	document.getElementById("container").style.visibility = "visible";
	plotTheMandelbrot();
};

var canvas, ctx, imageData;
window.onload = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	addCanvasEventListener();
	main();
};

const addCanvasEventListener = function() {
	canvas.addEventListener("click", function(event) {
		const x = document.getElementById("x");
		const y = document.getElementById("y");
		const zoom = document.getElementById("zoom");
		const xValue = parseFloat(x.value);
		const yValue = parseFloat(y.value);
		x.value = xValue+((event.pageX-canvas.offsetLeft)/canvas.width*2-1)/zoom.value*2;
		y.value = yValue-((event.pageY-canvas.offsetTop)/canvas.height*2-1)/zoom.value*2;
		zoom.value *= 2;

		if (x.value < -3) {
			x.value = -3;
		}
		else if (x.value > 3) {
			x.value = 3;
		}

		if (y.value < -3) {
			y.value = -3;
		}
		else if (y.value > 3) {
			y.value = 3;
		}

		main();
	});
};

const zoomOut = function() {
	const zoom = document.getElementById("zoom");
	if (zoom.value > 2) {
		zoom.value = parseFloat(zoom.value) / 2;
		main();
	}
	else {
		zoom.value = 1;
		main();
	}
};
