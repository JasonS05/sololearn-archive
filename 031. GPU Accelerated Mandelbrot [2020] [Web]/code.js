//created by Jason Stone

window.onload = main;

const vertices = [
	 1,  1,
	-1,  1,
	 1, -1,
	-1, -1
];

const indices = [0, 1, 2, 3, 1, 2];

let gl, shaderProgram;
function plotTheMandelbrot() {
	const zoom = parseFloat(document.getElementById("zoom").value);
	const xCenter = parseFloat(document.getElementById("x").value);
	const yCenter = parseFloat(document.getElementById("y").value);
	const maxIter = document.getElementById("maxIter").value;
	
	gl.uniform2f(gl.getUniformLocation(shaderProgram, "upperRightCorner"), xCenter + 2 / zoom, yCenter + 2 / zoom);
	gl.uniform2f(gl.getUniformLocation(shaderProgram, "lowerLeftCorner"), xCenter - 2 / zoom, yCenter - 2 / zoom);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "maxIter"), maxIter);
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	fill(gl, 0.5, 0.5, 0.5, 1);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function main() {
	const canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || console.log("No WebGL support");
	addCanvasEventListener(canvas);
	alert("Click/tap on the Mandelbrot to zoom in!")
	
	supplyBufferData(gl, vertices, indices);
	shaderProgram = createShaderProgram(gl, document.getElementById("shader-vs").innerHTML, document.getElementById("shader-fs").innerHTML);
	supplyAttributeData(gl, shaderProgram, "coordinates", 2, 2, 0);
	
	plotTheMandelbrot();
};

const addCanvasEventListener = function(canvas) {
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

		plotTheMandelbrot();
	});
};

function zoomOut() {
	const zoom = document.getElementById("zoom");
	if (zoom.value > 2) {
		zoom.value = parseFloat(zoom.value) / 2;
		plotTheMandelbrot();
	}
	else {
		zoom.value = 1;
		plotTheMandelbrot();
	}
};
