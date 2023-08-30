alert("Find the yellow cube to win!");
alert("This is an exact replica of a real life hedge maze! Look up Traquair maze for info on the maze.")

const map = `11111111111111111111111111111111111111111
10000000000000100000000100000000100010001
10111111111110101111110001111110101010101
10100000000010101000011111000000101000101
10101111111010101010000001011110101111101
10101000001010101011111101000000100001001
10101011011010101000000101001101111101001
10101010001010101111110101111000100001001
10101000000010101000000100000000001111101
10101010001010101011111111010000100000001
10101011011110101000000001011101111111111
10101000000000101111111100000100000000001
10101111111111101001000111111111111111101
10100000000000001011110001000000000000001
10111111111111111010000101011111111111111
10000000010000001000011101000000000000001
11111111010111101111000101111111111111101
10000001010100000001110101000000000000001
10111101010001111100010101110111111111111
10000101011011000100010100010000000000001
11110101001010010102010111011111111111101
10000101101010110100010001010000000000001
10111101001010010111111101010111111111111
10000101011010110001000101010000000000001
11110101010010000101010101011111111111101
10000101010111111101010101000001000000001
10111101010000000001010101111101011111111
10000001011111111101010100000001010000001
11111001010000001001010111111001000011101
10000011011011101011010000001101111110001
10111010001000001001011111101000100000111
10000000000011101101000000000000000111101
10111010001110000101111111111000100100001
10001011011000110101000100001101111101101
11101010000010100101010101101000000001001
10001011111110101101010101001111111111011
10101000000000001001010101100001000001001
10111111111111111011010101001101010111101
10000000000000000010000000000100010000001
11111111111111111110011111111111111111111`.split("\n").map(a => a.split(""));

window.onload = function() {
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
	
	const minimap = document.getElementById("minimap");
	const minimapSize = Math.min(window.innerHeight, window.innerWidth)/5;
	minimap.style.top = minimapSize/4 + "px";
	minimap.style.left = minimapSize/4 + "px";
	minimap.height = minimapSize;
	minimap.width = minimapSize;
	const ctx = minimap.getContext("2d");
	
	const canvas = document.getElementById("can");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const gl = canvas.getContext("webgl");
	if (!gl) throw new Error("Your browser does not support WebGL. This code cannot function without WebGL.");
	
	const vertexShaderCode = document.getElementById("shader-vs").innerHTML;
	const fragmentShaderCode = document.getElementById("shader-fs").innerHTML;
	const shaderProgram = createShaderProgram(gl, vertexShaderCode, fragmentShaderCode);
	
	let [vertices, indices] = generateMap(map);
	createBuffers(gl);
	supplyBufferData(gl, vertices, indices, gl.STATIC_DRAW);
	supplyAttributeData(gl, shaderProgram, "coordinates", 4, 8, 0);
	supplyAttributeData(gl, shaderProgram, "vertexColor", 4, 8, 4);
	
	const camera = {
		position: [19.5, 0, -41, 0],
		rotation: {
			x: 0,
			y: 0
		},
		FOV: Math.PI/2,
		minDist: 0.0001,
		maxDist: 100
	};
	
	function animate() {
		const positionChange = [
			(Math.sin(camera.rotation.x) * positionJoystick.y + Math.cos(camera.rotation.x) * positionJoystick.x)/20,
			(Math.sin(camera.rotation.x) * positionJoystick.x - Math.cos(camera.rotation.x) * positionJoystick.y)/20
		];
		
		const newPosition = resolveCollision([camera.position[0], camera.position[2]], [...positionChange]);
		
		camera.position[0] = newPosition[0];
		camera.position[2] = newPosition[1];
		
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
		
		drawMinimap(minimap, ctx, camera);
		
		window.requestAnimationFrame(animate);
	}
	
	window.requestAnimationFrame(animate);
};
// beginning of minimap code
function drawMinimap(minimap, ctx, camera) {
	const squareWidth = minimap.width / map[0].length;
	const squareHeight = minimap.height / map.length;
	
	ctx.fillStyle = "#7f7f7f";
	ctx.fillRect(0, 0, minimap.width, minimap.height);
	
	ctx.fillStyle = "#b30000";
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			if (+map[y][x]) {
				if (map[y][x] === "1")
					ctx.fillRect(x * squareWidth, y * squareHeight, squareWidth, squareHeight);
				else if (map[y][x] === "2") {
					ctx.fillStyle = "#ffff00";
					ctx.fillRect(x * squareWidth, y * squareHeight, squareWidth, squareHeight);
					ctx.fillStyle = "#b30000";
				} else throw new Error(`unrecognized map value '${map[y][x]}' at map[${y}][${x}]`);
			}
		}
	}
	
	ctx.fillStyle = "#00ffff";
	ctx.fillRect(
		camera.position[0]/map[0].length * minimap.width + squareWidth/4, 
		-camera.position[2]/map.length * minimap.height + squareWidth/4, 
		squareWidth/2, 
		squareWidth/2
	);
	
	ctx.fillStyle = "#00ff007f";
	ctx.beginPath();
	ctx.moveTo(
		camera.position[0]/map[0].length * minimap.width + squareWidth/2,
		-camera.position[2]/map.length * minimap.height + squareWidth/2
	);
	ctx.lineTo(
		camera.position[0]/map[0].length * minimap.width + 10 * squareWidth * Math.sin(-camera.rotation.x + Math.PI/6) + squareWidth/2,
		-camera.position[2]/map.length * minimap.height + 10 * squareWidth * -Math.cos(-camera.rotation.x + Math.PI/6) + squareWidth/2
	);
	ctx.lineTo(
		camera.position[0]/map[0].length * minimap.width + 10 * squareWidth * Math.sin(-camera.rotation.x - Math.PI/6) + squareWidth/2,
		-camera.position[2]/map.length * minimap.height + 10 * squareWidth * -Math.cos(-camera.rotation.x - Math.PI/6) + squareWidth/2
	);
	ctx.lineTo(
		camera.position[0]/map[0].length * minimap.width + squareWidth/2,
		-camera.position[2]/map.length * minimap.height + squareWidth/2
	);
	ctx.fill();
	ctx.closePath();
}
// end of minimap code
function resolveCollision(position, positionChange) {
	let newPosition = [...position];
	
	newPosition[0] += positionChange[0];
	if (collides(newPosition))
		if (positionChange[0] > 0)
			newPosition[0] = Math.floor(newPosition[0]) + 0.499;
		else
			newPosition[0] = Math.ceil(newPosition[0]) - 0.499;
	
	newPosition[1] += positionChange[1];
	if (collides(newPosition))
		if (positionChange[1] > 0)
			newPosition[1] = Math.floor(newPosition[1]) + 0.499;
		else
			newPosition[1] = Math.ceil(newPosition[1]) - 0.499;
	
	return newPosition;
}

function collides([x, y]) {
	if (+(map[Math.round(-y)] && map[Math.round(-y)][Math.round(x)])) return true;
	else return false;
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

function generateMap(map) {
	let vertices = [];
	let indices = [];
	let walls = 0;
	
	for (let z = 0; z < map.length; z++) {
		for (let x = 0; x < map[z].length; x++) {
			if (+map[z][x]) {
				for (let vertex = 0; vertex < 8; vertex++) {
					vertices.push(...[ // x, y, z, 0
						 x + (vertex >> 0) % 2 - 1/2,
						 0 + (vertex >> 2) % 2 - 1/2,
						-z + (vertex >> 1) % 2 - 1/2,
						 0
					]);
					
					// add the appropriate RGBA
					if (map[z][x] === "1") {
						vertices.push(...[
							// why does my code always end up with so many indentation levels?!? help me fix this
							0.7,
							0,
							0,
							1
						]);
					} else if (map[z][x] === "2") {
						vertices.push(...[
							1,
							1,
							0,
							1
						]);
					} else throw new Error(`unrecognized map value '${map[y][x]}' at map[${y}][${x}]`);
				}
				
				indices.push(...[
					walls * 8 + 0,
					walls * 8 + 1,
					walls * 8 + 4,
					walls * 8 + 1,
					walls * 8 + 4,
					walls * 8 + 5,
					walls * 8 + 1,
					walls * 8 + 3,
					walls * 8 + 5,
					walls * 8 + 3,
					walls * 8 + 5,
					walls * 8 + 7,
					walls * 8 + 3,
					walls * 8 + 2,
					walls * 8 + 7,
					walls * 8 + 2,
					walls * 8 + 7,
					walls * 8 + 6,
					walls * 8 + 2,
					walls * 8 + 0,
					walls * 8 + 6,
					walls * 8 + 0,
					walls * 8 + 6,
					walls * 8 + 4
				]);
				
				walls++;
			} // end if
		} // end for
	} // end for
	
	return [vertices, indices];
}

