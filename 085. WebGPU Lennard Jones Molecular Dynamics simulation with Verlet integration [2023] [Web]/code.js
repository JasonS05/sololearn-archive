let shaderCode = `
struct Particle {
	position: vec2f,
	velocity: vec2f
}

const pi = 3.1415926;
const particleRadius = 0.0118;

@group(0) @binding(0) var<storage, read> readonly_data: array<Particle>;
@group(0) @binding(1) var<storage, read_write> writeonly_data: array<Particle>;
@group(0) @binding(2) var<uniform> numParticles: u32;

@compute @workgroup_size(64) fn computeShader(@builtin(global_invocation_id) id: vec3<u32>) {
	let index = id.x;

	// in case the number of particles is not a multiple of the workgroup size
	if (index >= numParticles) {
		return;
	}

	let acceleration = calculateAcceleration(readonly_data[index].position, index);
	let velocity = readonly_data[index].velocity + acceleration;
	writeonly_data[index].position = readonly_data[index].position + velocity;
	writeonly_data[index].velocity = velocity;
}

fn calculateAcceleration(position: vec2f, index: u32) -> vec2f {
	var acceleration = vec2f(0, 0);

	for (var i: u32 = 0; i < numParticles; i++) {
		if (i != index) {
			let relativePosition = readonly_data[i].position - position;
			let iparticleRadius = 1 / particleRadius;
            let iparticleRadius2 = iparticleRadius * iparticleRadius;
            let radii2 = dot(relativePosition, relativePosition) * iparticleRadius2;
            let iradii2 = 1 / radii2;
            let iradii4 = iradii2 * iradii2;
            let iradii8 = iradii4 * iradii4;
            let iradii16 = iradii8 * iradii8;
            let iradii14 = iradii16 * radii2;

            acceleration += relativePosition * (iradii8 - iradii14) * 0.0000001 * iparticleRadius2;
		}
	}

	if (position.x > 1) {
		acceleration += vec2f(-position.x + 1, 0);
	}

	if (position.y > 1) {
		acceleration += vec2f(0, -position.y + 1);
	}

	if (position.x < -1) {
		acceleration += vec2f(-position.x - 1, 0);
	}

	if (position.y < -1) {
		acceleration += vec2f(0, -position.y - 1);
	}

	return acceleration;
}

struct VertexShaderOutput {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}

@vertex fn vertexShader(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexShaderOutput {
	let radius = 0.002;

	var vertexPosition: vec2f;

	// Some black magic to contruct ever more accurate circles with increasing vertex indices. It
	// works by making a central triangle, tacking three onto it to make a hexagon, tacking six
	// more on to make a dodecagon, tacking twelve more on to make a 24-gon, and so on.
	if (vertexIndex < 3) {
		vertexPosition = radius * vec2f(sin(2 * f32(vertexIndex)/3 * pi), cos(2 * f32(vertexIndex)/3 * pi));
	} else {
		var vertexAngleSizeInverse = exp2(floor(log2(floor((floor(f32(vertexIndex) / 3) - 1) / 3 + 1))));
		var v = 6 + f32(vertexIndex) - vertexAngleSizeInverse * 9;
		var vertexAngle = (v - floor(v/3)) / vertexAngleSizeInverse / 6 * 2 * pi;
		vertexPosition = radius * vec2f(sin(vertexAngle), cos(vertexAngle));
	}

	var vsOutput: VertexShaderOutput;
	vsOutput.position = vec4f(readonly_data[instanceIndex].position + vertexPosition, 0, 1);
	vsOutput.color = vec4f(1, 1, 1, 1);
	return vsOutput;
}

@fragment fn fragmentShader(fsInput: VertexShaderOutput) -> @location(0) vec4f {
	return fsInput.color;
}
`;


// 0 -> 3 sides
// 1 -> 6 sides
// 2 -> 12 sides
// 3 -> 24 sides
// 4 -> 48 sides
// 5 -> 96 sides
// etc.
let circleResolution = 3;
let numParticles = 30000; // must not be higher than 4194240 (i.e. 65535 * 64);

let errorHasOccured = false;
function reportError(error) {
	errorHasOccured = true;
	console.log("Error message:\n" + error.message + "\n\nStack traceback:\n" + error.stack)
}

window.onload = function () {
	main().catch(error => reportError(error));
};

async function main() {
	console.clear(); // for easier development on Chrome

	let canvas = document.getElementById("can");
	canvas.width = 512;
	canvas.height = 512;

	let adapter = await navigator.gpu?.requestAdapter({powerPreference: "high-performance"});
	let device = await adapter?.requestDevice();

	if (!device) {
		throw new Error("WebGPU is not supported by this device/operating system/browser combination. Try using Google Chrome on Windows, macOS, or ChromeOS. You may also try hitting \"run\" again in case this error is spurious.");
	}

	device.addEventListener("uncapturederror", event => reportError(event.error));

	let context = canvas.getContext("webgpu");

	context.configure({
		device,
		format: navigator.gpu.getPreferredCanvasFormat()
	});

	let computeModule = device.createShaderModule({
		label: "compute module",
		code: shaderCode
	});

	let renderModule = device.createShaderModule({
		label: "render module",
		code: shaderCode
	});

	let computePipeline = device.createComputePipeline({
		label: "compute pipeline",
		layout: "auto",
		compute: {
			module: computeModule,
			entryPoint: "computeShader"
		}
	});

	let renderPipeline = device.createRenderPipeline({
		label: "render pipeline",
		layout: "auto",
		vertex: {
			module: renderModule,
			entryPoint: "vertexShader"
		},
		fragment: {
			module: renderModule,
			entryPoint: "fragmentShader",
			targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
		}
	});

	let input = new ArrayBuffer(numParticles * 16); // each particle is 16 bytes (2x vec2f)
	let inputF32 = new Float32Array(input);

	for (let i = 0; i < numParticles; i++) {
		let sqrt = Math.ceil(Math.sqrt(numParticles));
		let x = (i % sqrt) / sqrt * 2 - 1 + 1 / sqrt;
		let y = Math.floor(i / sqrt) / sqrt * 2 - 1 + 1 / sqrt;

		// 4 floats per particle
		inputF32[4 * i + 0] = x;
		inputF32[4 * i + 1] = y;
		inputF32[4 * i + 2] = 0.000001 * (Math.random() * 2 - 1);
		inputF32[4 * i + 3] = 0.000001 * (Math.random() * 2 - 1);
	}

	let uniforms = new Uint32Array([numParticles]);

	let workBuffer1 = device.createBuffer({
		label: "work buffer 1",
		size: input.byteLength,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});

	let workBuffer2 = device.createBuffer({
		label: "work buffer 2",
		size: input.byteLength,
		usage: GPUBufferUsage.STORAGE
	});

	let uniformBuffer = device.createBuffer({
		label: "uniform buffer",
		size: uniforms.byteLength,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	device.queue.writeBuffer(workBuffer1, 0, input);
	device.queue.writeBuffer(uniformBuffer, 0, uniforms);

	let computeBindGroup1 = device.createBindGroup({
		label: "compute bind group for work buffer",
		layout: computePipeline.getBindGroupLayout(0),
		entries: [{
			binding: 0,
			resource: {
				buffer: workBuffer1
			}
		}, {
			binding: 1,
			resource: {
				buffer: workBuffer2
			}
		}, {
			binding: 2,
			resource: {
				buffer: uniformBuffer
			}
		}]
	});

	// the two workbuffers are swapped
	let computeBindGroup2 = device.createBindGroup({
		label: "compute bind group for work buffer",
		layout: computePipeline.getBindGroupLayout(0),
		entries: [{
			binding: 0,
			resource: {
				buffer: workBuffer2
			}
		}, {
			binding: 1,
			resource: {
				buffer: workBuffer1
			}
		}, {
			binding: 2,
			resource: {
				buffer: uniformBuffer
			}
		}]
	});

	let renderBindGroup = device.createBindGroup({
		label: "render bind group for work buffer",
		layout: renderPipeline.getBindGroupLayout(0),
		entries: [{
			binding: 0,
			resource: {
				buffer: workBuffer1
			}
		}]
	});

	let renderPassDescriptor = {
		label: "render pass",
		colorAttachments: [{
			view: undefined, // assigned at render time
			clearValue: [0.1, 0.1, 0.1, 1.0],
			loadOp: "clear",
			storeOp: "store"
		}]
	};

	function compute() {
		if (errorHasOccured) return;

		let encoder = device.createCommandEncoder({
			label: "compute encoder"
		});

		let pass = encoder.beginComputePass({
			label: "compute pass"
		});

		pass.setPipeline(computePipeline);
		pass.setBindGroup(0, computeBindGroup1);
		pass.dispatchWorkgroups(Math.ceil(numParticles / 64));
		pass.setBindGroup(0, computeBindGroup2);
		pass.dispatchWorkgroups(Math.ceil(numParticles / 64));
		pass.end();

		let commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);
	}


	function render() {
		if (errorHasOccured) return;

		encoder = device.createCommandEncoder({
			label: "render encoder"
		});

		renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

		pass = encoder.beginRenderPass(renderPassDescriptor);

		pass.setPipeline(renderPipeline);
		pass.setBindGroup(0, renderBindGroup);
		pass.draw(Math.pow(2, circleResolution) * 9 - 6, numParticles); // the vertex shader takes care of constructing the circle when given ever higher vertex indices
		pass.end();

		commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);
	}

	let observer = new ResizeObserver(entries => {
		for (let entry of entries) {
			let canvas = entry.target;
			let contentBoxSize = entry.contentBoxSize[0];
			let width = contentBoxSize.inlineSize;
			let height = contentBoxSize.blockSize;
            // 2x multiplier for antialiasing
			canvas.width = canvas.height = 2 * Math.min(width, height, device.limits.maxTextureDimension2D);

			render();
		}
	});

	observer.observe(canvas);

	async function mainLoop() {
		await device.queue.onSubmittedWorkDone();

        // increase number of loops if you have beefy GPU
		for (let i = 0; i < 1; i++) {
			compute();
		}

		render();

		if (!errorHasOccured) window.requestAnimationFrame(mainLoop);
	}

	mainLoop();
}

