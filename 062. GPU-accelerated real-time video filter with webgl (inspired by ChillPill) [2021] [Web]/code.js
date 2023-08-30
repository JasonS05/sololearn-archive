window.onload = main;

function main() {
	let canvas = document.getElementById("can");
	let video = document.getElementById("vid");
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	
	let gl = canvas.getContext("webgl");
	
	let vertices = [
		-1,  1,
		 1,  1,
		 1, -1,
		-1, -1
	];
	
	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	let vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vshader, document.getElementById("vshader").text);
	gl.compileShader(vshader);
	
	let fshader = gl.createShader(gl.FRAGMENT_SHADER );
	gl.shaderSource(fshader, document.getElementById("fshader").text);
	gl.compileShader(fshader);
	
	let program = gl.createProgram();
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	gl.useProgram(program);
	
	let texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
	
	// these three lines are needed because the video doesn't have power-of-two dimensions
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	let unfSamp = gl.getUniformLocation(program, "unfSampler");
	gl.uniform1i(unfSamp, 0);
	
	let vertexAttribute = gl.getAttribLocation(program, "coordinates");
	gl.enableVertexAttribArray(vertexAttribute);
	gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
	
	function draw() {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		requestAnimationFrame(draw);
	}
	
	draw();
}
