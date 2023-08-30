window.onload = main;

const texSize = 256;
const targetFPS = 20;
const maxIterationsPerFrame = confirm("Disable speed limit? Do this if you want to test your GPU's capabilities, but it may run too fast on some GPUs to see clearly what's happening.")? 1 / 0 : 10;

function main() {
	// get and initialize canvas
	const canvas = document.getElementById("can");
	canvas.width = canvas.height = texSize;
	
	// get webgl context and extension if available
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		console.log("Your device and/or browser does not support WebGL2, but this code requires WebGL2 to work. Either use a device and/or browser with WebGL2 support or bug me to port it to WebGL1.");
		return;
	}

	const ext = gl.getExtension("EXT_color_buffer_float");
	if (!ext) {
		console.log("EXT_color_buffer_float is not supported. This means this code will be forced to use regular textures instead of floating point textures. This code might not function as well or at all with regular textures. To be able to use floating point textures try another browser or device.");
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
	
	// set up textures and corresponding framebuffers
	let oldTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, oldTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, ext? gl.RGBA32F : gl.RGBA, texSize, texSize, 0, gl.RGBA, ext? gl.FLOAT : gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	
	let oldTexFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, oldTexFramebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, oldTex, 0);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
		console.log("incomplete framebuffer 1, or something. Actually, this error shouldn't ever show up. If you see this, please let me know.");
		return;
	}
	
	let newTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, newTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, ext? gl.RGBA32F : gl.RGBA, texSize, texSize, 0, gl.RGBA, ext? gl.FLOAT : gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	
	let newTexFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, newTexFramebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTex, 0);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
		console.log("incomplete framebuffer 2, or something. Actually, this error shouldn't ever show up. If you see this, please let me know.");
		return;
	}
	
	// set up initial texture state
	gl.useProgram(initShader);
	gl.viewport(0, 0, texSize, texSize);
	gl.bindFramebuffer(gl.FRAMEBUFFER, newTexFramebuffer);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	
	let now = Date.now();
	let iterationsPerFrame = 1;
	let scheduledIterations = 0;
	let averageMillisecondsPerFrame = 50;
	let averageIterationsPerSecond = 20;
	
	// main loop
	function loop() {
		gl.finish(); // this forces all GPU operations to finish before proceeding which helps to improve sim speed consistency
		
		let oldNow = now;
		now = Date.now();
		millisecondsElapsed = now - oldNow;
		
		if (millisecondsElapsed != 0) {
			averageIterationsPerSecond = (19 * averageIterationsPerSecond +  (1000 / millisecondsElapsed * iterationsPerFrame)) / 20;
		}
		
		averageMillisecondsPerFrame = Math.min(1000, (19 * averageMillisecondsPerFrame + millisecondsElapsed) / 20);
		let averageFPS = 1000 / averageMillisecondsPerFrame;
		
		iterationsPerFrame *= 1 + clamp((averageFPS - targetFPS) / 10, -1, 1) / 100;
		iterationsPerFrame = clamp(iterationsPerFrame, 1, maxIterationsPerFrame);
		
		document.getElementById("speedMeter").textContent =
			"Iterations per frame: " +
			Math.floor(iterationsPerFrame + 0.05) +
			"." +
			Math.floor((iterationsPerFrame + 0.05) * 10) % 10;
		
		document.getElementById("fpsCounter").textContent =
			"Frames per second: " +
			Math.floor(averageFPS + 0.05) +
			"." +
			Math.floor((averageFPS + 0.05) * 10) % 10;
		
		document.getElementById("throughputMeter").textContent =
			"Iterations per second: " +
			Math.floor(averageIterationsPerSecond);
		
		scheduledIterations += iterationsPerFrame;
		
		for (let i = 0; scheduledIterations > 0; i++, scheduledIterations--) {
			[oldTex, newTex] = [newTex, oldTex];
			[oldTexFramebuffer, newTexFramebuffer] = [newTexFramebuffer, oldTexFramebuffer];
			
			if (i == 0) {
				gl.useProgram(compShader);
				gl.viewport(0, 0, texSize, texSize);
			}

			gl.bindTexture(gl.TEXTURE_2D, oldTex);
			gl.bindFramebuffer(gl.FRAMEBUFFER, newTexFramebuffer);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}
		
		gl.useProgram(displayShader);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.bindTexture(gl.TEXTURE_2D, newTex);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		
		requestAnimationFrame(loop);
	}
	
	loop();
}

function clamp(x, min, max) {
	return Math.max(Math.min(x, max), min);
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

