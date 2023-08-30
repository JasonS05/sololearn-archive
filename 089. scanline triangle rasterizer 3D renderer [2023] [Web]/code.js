//alert("This took me FOREVER to make and debug. The quaternions melted my brain about three times more than usual due to using arrays instead of objects and putting the real component at the end instead of the beginning. And the whole entire time it turned out the Z buffer wasn't even working. No wonder I was having mysterious rendering issues!");
//alert("Check out my profile to see this but in webgl. Look for a code titled \"webgl4 - Rotating Cube\".");
//alert("Also make sure to check out the youtube channel Bisqwit! It's an awesome coding channel. It's where I got the idea for a scanline rasterizer from. He even went as far as to add texture support to his scanline rasterizer but I decided I put enough work in where I am now.");
//alert("Also the cube is kinda pixelized because all computation are done on the CPU so it can't handle too many pixels.");

let then = Date.now();
let frameComputationTimes = new Array(10);
let framesComputed = 0;

let fpsDisplay, size, ctx;
const pixels = 200;

let zBuffer = new Array(pixels);
for (let i = 0; i < zBuffer.length; i++) {
	zBuffer[i] = new Array(pixels);
	for (let j = 0; j < zBuffer[i].length; j++) {
		zBuffer[i][j] = NaN;
	}
}

// the list of all vertices, each vertex being an array of data for use by the vertex shader
const verticesList = [
	[ 0.5,  0.5, -0.5, 1, 0, 0],
	[-0.5,  0.5, -0.5, 0, 1, 0],
	[ 0.5, -0.5, -0.5, 1, 0, 1],
	[-0.5, -0.5, -0.5, 0, 0, 1],
	[ 0.5,  0.5,  0.5, 1, 1, 0],
	[-0.5,  0.5,  0.5, 0, 1, 1],
	[ 0.5, -0.5,  0.5, 1, 1, 1],
	[-0.5, -0.5,  0.5, 0, 0, 0]
];

// the vertices of each triangle. So [0, 1, 2] means a triangle with the 0th, 1st, and 2nd vertices defined in verticesList
const trianglesVertexList = [
	[0, 1, 3],
	[0, 3, 2],
	[0, 4, 5],
	[0, 5, 1],
	[0, 4, 6],
	[0, 2, 6],
	[7, 3, 2],
	[7, 6, 2],
	[7, 5, 1],
	[7, 3, 1],
	[7, 6, 4],
	[7, 5, 4]
];

const vertexShaderUniforms = {
	rotation: [0, 0, 0, 1],
	cameraPosition: [3, -3, -3, 0],
	cameraRotation:
		normalized([Math.sin(Math.PI/9), Math.sin(Math.PI/9), 0, Math.cos(Math.PI/8)]),
	FOV: Math.PI/5,
	minDist: 3.5,
	maxDist: 7
};

const fragmentShaderUniforms = {};

window.onload = function() {
	fpsDisplay = document.getElementById("fps");
	const canvas = document.getElementById("can");
	ctx = canvas.getContext("2d");
	setCanvasSize(canvas);
	window.addEventListener("resize", () => setTimeout(() => setCanvasSize(canvas), 400));
	
	main();
};

function setCanvasSize(canvas) {
	size = Math.min(window.innerWidth, window.innerHeight);
	canvas.width = canvas.height = size;
	canvas.style.marginLeft = (window.innerWidth - size)/2 + "px";
	canvas.style.marginTop = (window.innerHeight - size)/2 + "px";
	
	const pixelSize = size/pixels;
	ctx.scale(pixelSize, pixelSize);
	size /= pixelSize;
}

function main() {
	clearCanvas("#777777");
	resetZBuffer();
	renderScene();
	handleFPS();
	rotateCube();
	
	window.requestAnimationFrame(main);
}

function clearCanvas(color){
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, size, size);
}

function resetZBuffer() {
	zBuffer = new Array(pixels);
	for (let i = 0; i < zBuffer.length; i++) {
		zBuffer[i] = new Array(pixels).fill(NaN);
	}
}

function handleFPS() {
	const now = Date.now();
	const timeForThisFrame = now - then;
	then = now;
	
	frameComputationTimes[framesComputed % frameComputationTimes.length] = timeForThisFrame;
	framesComputed++;
	
	let timeForNFrames = 0;
	for (let i = 0; i < frameComputationTimes.length && i < framesComputed; i++) {
		timeForNFrames += frameComputationTimes[i];
	}
	
	fps = 1000 / timeForNFrames * Math.min(frameComputationTimes.length, framesComputed);
	fpsDisplay.textContent = `FPS: ${fps.toFixed(3)}`;
}

function rotateCube() {
	const angle = Math.PI/200;
	const sin = Math.sin(angle/2);
	const rotation = normalized([sin * 1, sin * 1, sin * 1, Math.cos(angle/2)]);
	vertexShaderUniforms.rotation = quatMult(rotation, vertexShaderUniforms.rotation);
}

function normalized(quat) {
	const normal = Math.sqrt(quat[0] ** 2 + quat[1] ** 2 + quat[2] ** 2 + quat[3] ** 2);
	return quat.map(a => a/normal);
}

/*********************************\
BEGIN SCANLINE RASTERIZER FUNCTIONS
\*********************************/

function renderScene() {
	for (let i = 0; i < trianglesVertexList.length; i++) {
		renderTriangle(trianglesVertexList[i].map(a => verticesList[a]));
	}
}

function renderTriangle(triangle) {
	let [
		{coords: [x0, y0, z0], data: data0},
		{coords: [x1, y1, z1], data: data1},
		{coords: [x2, y2, z2], data: data2}
	] = triangle
		.map(vertexShader)
		.sort((a, b) => a.coords[1] - b.coords[1]);
	
	[x0, y0, z0, x1, y1, z1, x2, y2, z2] = [x0, y0, z0, x1, y1, z1, x2, y2, z2]
		.map(a => (a * size + size)/2);
	
	if (y0 === y1) {
		for (let y = Math.max(0, y0); y < Math.min(y2, size - 1); y++) {
			const progress = (y0 - y)/(y0 - y2);
			
			let minX = Math.round(progress * x2 + (1 - progress) * x0);
			let maxX = Math.round(progress * x2 + (1 - progress) * x1);
			
			if (minX > maxX) [minX, maxX] = [maxX, minX];
			
			renderLine(minX, maxX, y, data0, data1, data2, x0, y0, z0, x1, y1, z1, x2, y2, z2);
		}
	} else if (y1 == y2) {
		for (let y = Math.max(0, y0); y < Math.min(y2, size - 1); y++) {
			const progress = (y0 - y)/(y0 - y2);
			
			let minX = Math.round(progress * x1 + (1 - progress) * x0);
			let maxX = Math.round(progress * x2 + (1 - progress) * x0);
			
			if (minX > maxX) [minX, maxX] = [maxX, minX];
			
			renderLine(minX, maxX, y, data0, data1, data2, x0, y0, z0, x1, y1, z1, x2, y2, z2);
		}
	} else {
		for (let y = Math.max(0, y0); y < Math.min(y2, size - 1); y++) {
			const progress = (y0 - y)/(y0 - y2);
			const progressBeforeY1 = (y0 - y)/(y0 - y1);
			const progressAfterY1 = (y1 - y)/(y1 - y2);
			
			let minX = Math.round(progress * x2 + (1 - progress) * x0);
			let maxX;
			if (y < y1) {
				maxX = Math.round(progressBeforeY1 * x1 + (1 - progressBeforeY1) * x0);
			}
			else {
				maxX = Math.round(progressAfterY1 * x2 + (1 - progressAfterY1) * x1);
			}
			
			if (minX > maxX) [minX, maxX] = [maxX, minX];
			
			renderLine(minX, maxX, y, data0, data1, data2, x0, y0, z0, x1, y1, z1, x2, y2, z2);
		}
	}
}

function renderLine(minX, maxX, y, data0, data1, data2, x0, y0, z0, x1, y1, z1, x2, y2, z2) {
	minX = Math.max(0, minX);
	maxX = Math.min(maxX, size - 1);
	for (let x = minX; x < maxX; x++) {
		const [b0, b1, b2] = barycentricCoords(x, y, x0, y0, x1, y1, x2, y2);
		
		const z = z0 * b0 + z1 * b1 + z2 * b2;
		if (z > zBuffer[Math.round(x)][Math.round(y)]) continue;
		zBuffer[Math.round(x)][Math.round(y)] = z;
		
		const data = interpolate(data0, data1, data2, b0, b1, b2);
		ctx.fillStyle = `rgba(${fragmentShader(data)})`;
		ctx.fillRect(x, y, 2, 2);
	}
}

function interpolate(data0, data1, data2, b0, b1, b2) {
	const data = new Array(data0.length);
	for (let i = 0; i < data.length; i++) {
		data[i] = data0[i] * b0 + data1[i] * b1 + data2[i] * b2;
	}
	return data;
}

function barycentricCoords(px, py, tx0, ty0, tx1, ty1, tx2, ty2) {
	const totalArea = Math.abs((tx1-tx0) * (ty2-ty0) - (tx2-tx0) * (ty1-ty0))/2;
	const b0 = Math.abs((tx1-px) * (ty2-py) - (tx2-px) * (ty1-py))/2 / totalArea;
	const b1 = Math.abs((px-tx0) * (ty2-ty0) - (tx2-tx0) * (py-ty0))/2 / totalArea;
	
	return [b0, b1, 1 - b0 - b1];
}

/*******************************\
END SCANLINE RASTERIZER FUNCTIONS
\*******************************/

/*****************\
BEGIN VERTEX SHADER
\*****************/

function quatMult(a, b) {
	return [
		a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1],
		a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
		a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3],
		a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2]
	];
}

function quatInv(quat) {
	return [-quat[0], -quat[1], -quat[2], quat[3]];
}

function quatRotate(rotation, vertex) {
	return quatMult(quatMult(rotation, vertex), quatInv(rotation));
}

function perspective(vertex) {
	vertex[0] -= vertexShaderUniforms.cameraPosition[0];
	vertex[1] -= vertexShaderUniforms.cameraPosition[1];
	vertex[2] -= vertexShaderUniforms.cameraPosition[2];
	vertex[3] -= vertexShaderUniforms.cameraPosition[3];
	vertex = quatRotate(vertexShaderUniforms.cameraRotation, vertex);
	vertex[0] /= vertex[2] * Math.tan(vertexShaderUniforms.FOV / 2);
	vertex[1] /= vertex[2] * Math.tan(vertexShaderUniforms.FOV / 2);
	vertex[2] -= (vertexShaderUniforms.maxDist + vertexShaderUniforms.minDist) / 2;
	vertex[2] /= (vertexShaderUniforms.maxDist - vertexShaderUniforms.minDist) / 2;
	vertex[3] = 1;
	return vertex;
}

function vertexShader(vertex) {
	return {
		coords: perspective(quatRotate(vertexShaderUniforms.rotation, [vertex[0], -vertex[1], vertex[2], 0])),
		data: [vertex[3]*255, vertex[4]*255, vertex[5]*255]
	};
}

/***************\
END VERTEX SHADER
\***************/

function fragmentShader(data) {
	return [data[0], data[1], data[2], 1];
}
