window.onload = main;

let texSize = 512;

function main(){
	let canvas = document.createElement("canvas");
	canvas.width = canvas.height = Math.min(window.innerWidth, window.innerHeight);
	canvas.style.paddingLeft = (window.innerWidth - canvas.width)/2 + "px";
	document.body.appendChild(canvas);
	
	let gl = canvas.getContext("webgl2");
	let ext = gl.getExtension("EXT_color_buffer_float");
	if (!ext) console.log("EXT_color_buffer_float not supported. Try another browser or device.");
	
	let vertices = [
		-1,  1,
		 1,  1,
		 1, -1,
		-1, -1
	];
	
	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
	
	let vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vshader, document.getElementById("vshader").text);
	gl.compileShader(vshader);
	
	if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader: \n" + gl.getShaderInfoLog(vshader) + "\n");
	}
	
	let fshader = gl.createShader(gl.FRAGMENT_SHADER );
	gl.shaderSource(fshader, document.getElementById("fshader").text);
	gl.compileShader(fshader);
	
	if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader: \n" + gl.getShaderInfoLog(fshader) + "\n");
	}
	
	let program = gl.createProgram();
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	gl.useProgram(program);
	
	let texture1 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, texSize, texSize, 0, gl.RGBA, gl.FLOAT, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	
	let frameBuffer1 = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
		console.log("incomplete framebuffer, or something");
		return;
	}
	
	let texture2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, texSize, texSize, 0, gl.RGBA, gl.FLOAT, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	
	let frameBuffer2 = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2, 0);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
		console.log("incomplete framebuffer, or something");
		return;
	}
	
	let samplerUniform = gl.getUniformLocation(program, "sampler");
	gl.uniform1i(samplerUniform, 0);
	
	let texSizeUniform = gl.getUniformLocation(program, "texSize");
	gl.uniform1f(texSizeUniform, texSize);
	
	let vertexAttribute = gl.getAttribLocation(program, "coordinates");
	gl.enableVertexAttribArray(vertexAttribute);
	gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
	
	function draw() {
		//for (let i = 0; i < 3; i++) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2);
		gl.bindTexture(gl.TEXTURE_2D, texture1);
		gl.viewport(0, 0, texSize, texSize);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.viewport(0, 0, texSize, texSize);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		//}
		
		requestAnimationFrame(draw);
	}
	
	draw();
}
