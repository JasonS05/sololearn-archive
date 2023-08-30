// this was done with the help of tutorialspoint
// https://www.tutorialspoint.com/webgl/index.htm

window.onload = main;

const vertices = [
	-0.5, -0.5,  1, 0, 0, 1,
	 0.5, -0.5,  0, 1, 0, 1,
	 0.5,  0.5,  0, 0, 1, 1,
	-0.5,  0.5,  0, 0, 0, 1,
];

const indices = [0, 1, 2, 0, 2, 3]

const vertexShaderCode = `
attribute vec2 coordinates;
attribute vec4 vertexColor;
varying vec4 fragmentColor;

void main(void) {
	fragmentColor = vertexColor;
	gl_Position = vec4(coordinates, 0, 1);
}`;

const fragmentShaderCode = `
precision mediump float;

varying vec4 fragmentColor;

void main(void) {
	gl_FragColor = fragmentColor;
}`;

function main() {
	const canvas = document.getElementById("canvas");
	canvas.width = 200;
	canvas.height = 200;
	const gl = canvas.getContext("webgl");
	
	supplyBufferData(gl, vertices, indices);
	shaderProgram = createShaderProgram(gl, vertexShaderCode, fragmentShaderCode);
	supplyAttributeData(gl, "coordinates", 2, 6, 0);
	supplyAttributeData(gl, "vertexColor", 4, 6, 2);
	
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	fill(gl, 0.5, 0.5, 0.5, 1)
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function supplyBufferData(gl, vertices, indices) {
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

function createShaderProgram(gl, vertexShaderCode, fragmentShaderCode) {
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	
	gl.shaderSource(vertexShader, vertexShaderCode);
	gl.shaderSource(fragmentShader, fragmentShaderCode);
	
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.log("Vertex Shader: \n" + gl.getShaderInfoLog(fragmentShader) + "\n");	   
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader: \n" + gl.getShaderInfoLog(fragmentShader) + "\n");
	}
	
	let shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log(gl.getProgramInfoLog(shaderProgram));
	}
	
	if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
		console.log(gl.getProgramInfoLog(shaderProgram));
	}
	
	gl.useProgram(shaderProgram);
	
	return shaderProgram
}

function fill(gl, r, g, b, a) {
	gl.clearColor(r, g, b, a);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function supplyAttributeData(gl, attributeName, componentsForThisAttribute, componentsPerVertex, offset) {
	let attribute = gl.getAttribLocation(shaderProgram, attributeName);
	gl.vertexAttribPointer(attribute, componentsForThisAttribute, gl.FLOAT, false, componentsPerVertex * Float32Array.BYTES_PER_ELEMENT, offset * Float32Array.BYTES_PER_ELEMENT);
	gl.enableVertexAttribArray(attribute);
}
