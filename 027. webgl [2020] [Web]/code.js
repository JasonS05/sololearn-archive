// this was done with the help of tutorialspoint
// https://www.tutorialspoint.com/webgl/index.htm

window.onload = main;

const vertices = [
	 0.5,  0.5,
	 0.5, -0.5,
	-0.5, -0.5
];

const indices = [0, 1, 2];

const vertexShaderCode = `
attribute vec2 coordinates;

void main(void) {
	gl_Position = vec4(coordinates, 0, 1);
}`;

const fragmentShaderCode = `
void main(void) {
	gl_FragColor = vec4(0, 0.8, 0, 1);
}`;

function main() {
	const canvas = document.getElementById("canvas");
	canvas.width = 200;
	canvas.height = 200;
	const gl = canvas.getContext("webgl");
	
	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	let indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	
	gl.shaderSource(vertexShader, vertexShaderCode);
	gl.shaderSource(fragmentShader, fragmentShaderCode);
	
	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		console.log("Vertex Shader: " + gl.getShaderInfoLog(fragmentShader));	   
	}
	gl.compileShader(fragmentShader);
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		console.log("Fragment Shader: " + gl.getShaderInfoLog(fragmentShader));
	}
	
	let shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	gl.useProgram(shaderProgram);
	
	let coordinatesVar = gl.getAttribLocation(shaderProgram, "coordinates");
	gl.vertexAttribPointer(coordinatesVar, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(coordinatesVar);
	
	gl.clearColor(0.5, 0.5, 0.5, 1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
