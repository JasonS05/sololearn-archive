window.onload = main;

const texSize = 512;

function main() {
	// get and initialize canvas
	const canvas = document.getElementById("can");
	canvas.width = canvas.height = texSize;
	
	// get webgl context and extension if available
	const gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("You do not have WebGL support. Try using a device and/or browser with WebGL support.")
		return;
	}

	const ext = gl.getExtension("OES_texture_float") && gl.getExtension("WEBGL_color_buffer_float");
	if (!ext) {
		console.log("OES_texture_float and/or WEBGL_color_buffer_float is not supported. This means this code will be forced to use regular textures instead of floating point textures. This code might not function as well or at all with regular textures. To be able to use floating point textures try another browser or device.");
	}
	
	// set up the geometry
	const vertices = [
		-1,  1,
		 1,  1,
		 1, -1,
		-1, -1
	];
	
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	// set up shaders
	const vertexShaderCode = document.getElementById("vertexShader").text;
	const initFragShaderCode = document.getElementById("initFragShader").text;
	const compFragShaderCode = document.getElementById("compFragShader").text;
	const displayFragShaderCode = document.getElementById("displayFragShader").text;
	
	const initShader = makeProgram(gl, vertexShaderCode, initFragShaderCode, "Init");
	const compShader = makeProgram(gl, vertexShaderCode, compFragShaderCode, "Computation");
	const displayShader = makeProgram(gl, vertexShaderCode, displayFragShaderCode, "Display");
	
	setUpUniformsAndVertexAttributes(gl, initShader);
	setUpUniformsAndVertexAttributes(gl, compShader);
	setUpUniformsAndVertexAttributes(gl, displayShader);
	
	gl.useProgram(compShader);
	let timeStepUniform = gl.getUniformLocation(compShader, "timeStep");
	
	gl.useProgram(displayShader);
	let drawPhaseUniform = gl.getUniformLocation(displayShader, "drawPhase");
	gl.uniform1i(drawPhaseUniform, confirm("Show wavefunction phase with color?")? 1 : 0);
	
	// set up textures and corresponding framebuffers
	let oldTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, oldTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, ext? gl.FLOAT : gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	
	let oldTexFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, oldTexFramebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, oldTex, 0);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
		console.log("incomplete framebuffer 1, or something. Actually, this error shouldn't ever show up. If you see this, please let me know.");
		return;
	}
	
	let newTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, newTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, ext? gl.FLOAT : gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	
	let newTexFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, newTexFramebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTex, 0);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
		console.log("incomplete framebuffer 2, or something. Actually, this error shouldn't ever show up. If you see this, please let me know.");
		return;
	}
	
	// set up miscellaneous things
	gl.viewport(0, 0, texSize, texSize);
	
	// set up initial texture state
	gl.useProgram(initShader);
	gl.bindFramebuffer(gl.FRAMEBUFFER, newTexFramebuffer);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	
	// main loop
	let timeStep = 0;
	function loop() {
		for (let i = 0; i < 10; i++) {
			[oldTex, newTex] = [newTex, oldTex];
			[oldTexFramebuffer, newTexFramebuffer] = [newTexFramebuffer, oldTexFramebuffer];
			
			gl.useProgram(compShader);
			gl.uniform1i(timeStepUniform, timeStep++);
			gl.bindTexture(gl.TEXTURE_2D, oldTex);
			gl.bindFramebuffer(gl.FRAMEBUFFER, newTexFramebuffer);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
			
			gl.useProgram(displayShader);
			gl.bindTexture(gl.TEXTURE_2D, newTex);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}
		
		requestAnimationFrame(loop);
	}
	
	loop();
}

function makeProgram(gl, vShaderCode, fShaderCode, shaderName) {
	const vShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vShader, vShaderCode);
	gl.compileShader(vShader);
	
	if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
		console.log(shaderName + " Vertex Shader: \n" + gl.getShaderInfoLog(vShader) + "\n");
	}
	
	const fShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fShader, fShaderCode);
	gl.compileShader(fShader);
	
	if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
		console.log(shaderName + " Fragment Shader: \n" + gl.getShaderInfoLog(fShader) + "\n");
	}
	
	const program = gl.createProgram();
	gl.attachShader(program, vShader);
	gl.attachShader(program, fShader);
	gl.linkProgram(program);
	
	return program;
}

function setUpUniformsAndVertexAttributes(gl, shader) {
	// I have no idea why this line of code is necessary but it needs to be here for the uniform
	// assignments to work. I have not been able to find anything online that indicates that this
	// should be necessary, nor has the spec mentioned this as a requirement in any of the documents
	// that I read. But it doesn't work if I remove this line, so I'm keeping it.
	gl.useProgram(shader);
	
	let samplerUniform = gl.getUniformLocation(shader, "sampler");
	gl.uniform1i(samplerUniform, 0);
	
	let texSizeUniform = gl.getUniformLocation(shader, "texSize");
	gl.uniform1f(texSizeUniform, texSize);

	let vertexAttribute = gl.getAttribLocation(shader, "coordinates");
	gl.enableVertexAttribArray(vertexAttribute);
	gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
}

