// this was done with the help of tutorialspoint
// https://www.tutorialspoint.com/webgl/index.htm

window.onload = main;

const vertices = [ // x y z w   red green blue alpha
	 0.5,  0.5, -0.5, 0.0,   1, 0, 0, 1,
	-0.5,  0.5, -0.5, 0.0,   0, 1, 0, 1,
	 0.5, -0.5, -0.5, 0.0,   1, 0, 1, 1,
	-0.5, -0.5, -0.5, 0.0,   0, 0, 1, 1,
	 0.5,  0.5,  0.5, 0.0,   1, 1, 0, 1,
	-0.5,  0.5,  0.5, 0.0,   0, 1, 1, 1,
	 0.5, -0.5,  0.5, 0.0,   1, 1, 1, 1,
	-0.5, -0.5,  0.5, 0.0,   0, 0, 0, 1
];

const indices = [
	0, 1, 3,
	0, 3, 2,
	0, 4, 5,
	0, 5, 1,
	0, 4, 6,
	0, 2, 6,
	7, 3, 2,
	7, 6, 2,
	7, 5, 1,
	7, 3, 1,
	7, 6, 4,
	7, 5, 4
];


function main() {
	const canvas = document.getElementById("canvas");
	canvas.width = 200;
	canvas.height = 200;
	const gl = canvas.getContext("webgl");
	
	const vertexShaderCode = document.getElementById("shader-vs").innerHTML;
	const fragmentShaderCode = document.getElementById("shader-fs").innerHTML;
	
	supplyBufferData(gl, vertices, indices);
	const shaderProgram = createShaderProgram(gl, vertexShaderCode, fragmentShaderCode);
	supplyAttributeData(gl, shaderProgram, "coordinates", 4, 8, 0);
	supplyAttributeData(gl, shaderProgram, "vertexColor", 4, 8, 4);
	
	function animate(time) {
		gl.uniform4f(gl.getUniformLocation(shaderProgram, "rotation"), ...Rotation(1, 1, 1, -time/1000));
		gl.uniform4f(gl.getUniformLocation(shaderProgram, "cameraPosition"), 0, 2, -2, 0);
		gl.uniform4f(gl.getUniformLocation(shaderProgram, "cameraRotation"), ...Rotation(1, 0, 0, -Math.PI/4));
		gl.uniform1f(gl.getUniformLocation(shaderProgram, "FOV"), Math.PI/4);
		gl.uniform1f(gl.getUniformLocation(shaderProgram, "minDist"), 0.1);
		gl.uniform1f(gl.getUniformLocation(shaderProgram, "maxDist"), 5);
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.viewport(0, 0, canvas.width, canvas.height);
		
		fill(gl, 0.5, 0.5, 0.5, 1);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		
		window.requestAnimationFrame(animate);
	};
	
	window.requestAnimationFrame(animate);
}

function Rotation(x, y, z, θ) {
	const length = Math.sqrt(x*x + y*y + z*z);
	const halfAngle = θ/2;
	const n = Math.sin(halfAngle) / length;
	return [n * x, n * y, n * z, Math.cos(halfAngle)];
}
