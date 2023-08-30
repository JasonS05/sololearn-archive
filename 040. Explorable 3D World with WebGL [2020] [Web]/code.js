// this was done with the help of tutorialspoint
// https://www.tutorialspoint.com/webgl/index.htm

alert("Credit to sololearn user Mike Perkowski for the joysticks");
alert("If you're on desktop use WASD to move and the arrow keys to look around");

const squareSize = 0.5;
const size = 200;

const vertices = [];
const indices = [];

let camera = {
	position: [0, 0, 0, 0],
	rotation: {
		x: 0,
		y: 0
	},
	FOV: Math.PI/4,
	minDist: 2,
	maxDist: 100
};

window.onload = function() {
	fpsDisplay = document.getElementById("fps");
	const canvas = document.getElementById("can");
	setCanvasSize(canvas);
	window.addEventListener("resize", () => setTimeout(() => setCanvasSize(canvas), 400));
	
	main(canvas);
};

function setCanvasSize(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function main(canvas) {
	const positionJoystick = new Joystick({
		bottom: "20px",
		top: "auto",
		left: "20px",
		right: "auto",
		limitX: 1,
		limitY: 1
	});
	const rotationJoystick = new Joystick({
		bottom: "20px",
		top: "auto",
		left: "auto",
		right: "20px",
		limitX: 1,
		limitY: 1
	});

	window.onkeydown = function(event) {
		switch (event.keyCode) {
			case 87: positionJoystick.y = -1; break;
			case 65: positionJoystick.x = -1; break;
			case 83: positionJoystick.y = 1; break;
			case 68: positionJoystick.x = 1; break;
			case 38: rotationJoystick.y = -0.5; break;
			case 37: rotationJoystick.x = -0.5; break;
			case 40: rotationJoystick.y = 0.5; break;
			case 39: rotationJoystick.x = 0.5; break;
		}
	};
	
	window.onkeyup = function(event) {
		switch (event.keyCode) {
			case 87: positionJoystick.y = 0; break;
			case 65: positionJoystick.x = 0; break;
			case 83: positionJoystick.y = 0; break;
			case 68: positionJoystick.x = 0; break;
			case 38: rotationJoystick.y = 0; break;
			case 37: rotationJoystick.x = 0; break;
			case 40: rotationJoystick.y = 0; break;
			case 39: rotationJoystick.x = 0; break;
		}
	};
	
	let worldX = 0;
	let worldZ = 0;
	generateWorld(worldX - squareSize * size / 2, worldZ - squareSize * size / 2);
	
	const gl = canvas.getContext("webgl");
	if (!gl) throw new Error("Your browser does not support WebGL. This code cannot function without WebGL.");
	
	const vertexShaderCode = document.getElementById("shader-vs").innerHTML;
	const fragmentShaderCode = document.getElementById("shader-fs").innerHTML;
	
	const shaderProgram = createShaderProgram(gl, vertexShaderCode, fragmentShaderCode);
	createBuffers(gl)
	supplyBufferData(gl, vertices, indices, gl.DYNAMIC_DRAW);
	supplyAttributeData(gl, shaderProgram, "coordinates", 4, 8, 0);
	supplyAttributeData(gl, shaderProgram, "vertexColor", 4, 8, 4);
	
	function animate(time) {
		camera.position[0] += (Math.cos(camera.rotation.x) * positionJoystick.x + Math.sin(camera.rotation.x) * positionJoystick.y)/10;
		camera.position[2] -= (Math.cos(camera.rotation.x) * positionJoystick.y - Math.sin(camera.rotation.x) * positionJoystick.x)/10;
		
		document.getElementById("coords").innerHTML = `x: ${camera.position[0].toFixed(3)}<br/>z: ${camera.position[2].toFixed(3)}`;
		
		if (Math.abs(camera.position[0] - worldX) > 5 || Math.abs(camera.position[2] - worldZ) > 5) {
			worldX = Math.round(camera.position[0]/5)*5;
			worldZ = Math.round(camera.position[2]/5)*5;
			
			generateWorld(worldX - squareSize * size / 2, worldZ - squareSize * size / 2);
			
			supplyBufferData(gl, vertices, indices, gl.DYNAMIC_DRAW);
		}
		
		camera.rotation.x -= rotationJoystick.x/30;
		camera.rotation.y -= rotationJoystick.y/30;
		camera.rotation.y = Math.max(Math.min(Math.PI/2 - 0.001, camera.rotation.y), -Math.PI/2 + 0.001);
		
		gl.uniform1f(gl.getUniformLocation(shaderProgram, "aspectRatio"), canvas.width / canvas.height);
		gl.uniform4f(gl.getUniformLocation(shaderProgram, "cameraPosition"), ...camera.position);
		gl.uniform4f(gl.getUniformLocation(shaderProgram, "cameraRotation"), ...quatMult(
			Rotation(1, 0, 0, camera.rotation.y),
			Rotation(0, 1, 0, camera.rotation.x)
		));
		gl.uniform1f(gl.getUniformLocation(shaderProgram, "FOV"), camera.FOV);
		gl.uniform1f(gl.getUniformLocation(shaderProgram, "minDist"), camera.minDist);
		gl.uniform1f(gl.getUniformLocation(shaderProgram, "maxDist"), camera.maxDist);
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.viewport(0, 0, canvas.width, canvas.height);
		
		fill(gl, 0.5, 0.5, 0.5, 1);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		
		window.requestAnimationFrame(animate);
	}
	
	window.requestAnimationFrame(animate);
}

function generateWorld(xPos, zPos) {
	vertices.length = 0;
	indices.length = 0;
	
	for (let x = 0; x < size; x++) {
		for (let z = 0; z < size; z++) {
			perlinData = perlin((x * squareSize + xPos)/10, (z * squareSize + zPos)/10, 3);
			let vertex = [
				x * squareSize + xPos,
				perlinData - 5,
				z * squareSize + zPos,
				0,
				(perlinData + 1.5)/3,
				(perlinData + 1.5)/3,
				(perlinData + 1.5)/3,
				1
			];
			
			for (let i = 0; i < vertex.length; i++) {
				vertices[vertex.length*(x * size + z)+i] = vertex[i];
			}
			
			if (x < size-1 && z < size-1) {
				let squareIndices = [
					(x+0) * size + (z+0),
					(x+0) * size + (z+1),
					(x+1) * size + (z+0),
					(x+1) * size + (z+1),
					(x+0) * size + (z+1),
					(x+1) * size + (z+0)
				];
				
				for (let i = 0; i < squareIndices.length; i++) {
					indices[squareIndices.length * (x * (size-1) + z) + i] = squareIndices[i];
				}
			}
		}
	}
}

function Rotation(x, y, z, θ) {
	const length = Math.sqrt(x*x + y*y + z*z);
	const halfAngle = θ/2;
	const n = Math.sin(halfAngle) / length;
	return [n * x, n * y, n * z, Math.cos(halfAngle)];
}

function quatMult(a, b) {
	return [
		a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1],
		a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
		a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3],
		a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2]
	];
}

function hash(n) {
	return Math.sin(n) * 1000;
}

function dotGridGradient(ix, iy, x, y) {
	let dx = x - ix;
	let dy = y - iy;
	
	let angle = hash(hash(12345 + ix) / hash(67890 + iy)) % (Math.PI*2);
	
	let gradient = [
		Math.sin(angle),
		Math.cos(angle)
	];
	
	let gradientNormal = Math.hypot(gradient[0], gradient[1]);
	return (dx*gradient[0]/gradientNormal + dy*gradient[1]/gradientNormal);
}

function perlin(x, y, n) {
	if (n <= 0) return 0;
	
	let x0 = Math.floor(x);
	let x1 = x0 + 1;
	let y0 = Math.floor(y);
	let y1 = y0 + 1;
	
	let sx = smooth(x - x0);
	let sy = smooth(y - y0);
	
	let n0 = dotGridGradient(x0, y0, x, y);
	let n1 = dotGridGradient(x1, y0, x, y);
	let ix0 = Math.cos(Math.PI/2*sx) * n0 + Math.sin(Math.PI/2*sx) * n1;
	
	n0 = dotGridGradient(x0, y1, x, y);
	n1 = dotGridGradient(x1, y1, x, y);
	let ix1 = Math.cos(Math.PI/2*sx) * n0 + Math.sin(Math.PI/2*sx) * n1;
	
	return Math.cos(Math.PI/2*sy) * ix0 + Math.sin(Math.PI/2*sy) * ix1 + perlin(n*x, n*y, n - 1)/n;
}

function smooth(n) {
	return (1 + Math.cos((1 - n) * Math.PI))/2;
}

