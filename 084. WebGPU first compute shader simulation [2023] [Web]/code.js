let shaderCode = `
struct Particle {
    position: vec2f
}

// these both bind to the same buffer, but for some reason use the first binding in the vertex shader makes problems
@group(0) @binding(0) var<storage, read_write> data: array<Particle>;
@group(0) @binding(1) var<storage, read> readonly_data: array<Particle>;

@compute @workgroup_size(1) fn computeShader(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    data[i].position = data[i].position * 1.1;
}

struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
}

@vertex fn vertexShader(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexShaderOutput {
    let vertexPositions = array(
        vec2f( 0.00,  0.05),
        vec2f(-0.05, -0.05),
        vec2f( 0.05, -0.05)
    );

    var vsOutput: VertexShaderOutput;
    vsOutput.position = vec4f(readonly_data[instanceIndex].position + vertexPositions[vertexIndex], 0, 1);
    vsOutput.color = vec4f(1, 0, 0, 1);
    return vsOutput;
}

@fragment fn fragmentShader(fsInput: VertexShaderOutput) -> @location(0) vec4f {
    return fsInput.color;
}
`;

window.onload = function () {
    main().catch(error => console.log("Error message:\n" + error.message + "\n\nStack traceback:\n" + error.stack));
};

async function main() {
    console.clear(); // for easier development on Chrome

    let canvas = document.getElementById("can");
    canvas.width = 512;
    canvas.height = 512;

    let adapter = await navigator.gpu?.requestAdapter();
    let device = await adapter?.requestDevice();

    if (!device) {
        throw new Error("WebGPU is not supported by this device/operating system/browser combination. Try using Google Chrome on Windows, macOS, or ChromeOS. You may also try hitting \"run\" again in case this error is spurious.");
    }

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
            targets: [{format: navigator.gpu.getPreferredCanvasFormat()}]
        }
    });

    let input = new Float32Array([0.0, 0.05, -0.05, -0.05, 0.05, -0.05]);

    let workBuffer = device.createBuffer({
        label: "work buffer",
        size: input.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(workBuffer, 0, input);

    let computeBindGroup = device.createBindGroup({
        label: "compute bind group for work buffer",
        layout: computePipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: workBuffer
            }
        }]
    });

    let renderBindGroup = device.createBindGroup({
        label: "render bind group for work buffer",
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [{
            binding: 1,
            resource: {
                buffer: workBuffer
            }
        }]
    });

    let renderPassDescriptor = {
        label: "render pass",
        colorAttachments: [{
            view: undefined, // assigned at render time
            clearValue: [0.3, 0.3, 0.3, 1.0],
            loadOp: "clear",
            storeOp: "store"
        }]
    };

    function compute() {
        let encoder = device.createCommandEncoder({
            label: "compute encoder"
        });

        let pass = encoder.beginComputePass({
            label: "compute pass"
        });

        pass.setPipeline(computePipeline);
        pass.setBindGroup(0, computeBindGroup);
        pass.dispatchWorkgroups(input.length / 2);
        pass.end();

        let commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }


    function render() {
        encoder = device.createCommandEncoder({
            label: "render encoder"
        });

        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

        pass = encoder.beginRenderPass(renderPassDescriptor);

        pass.setPipeline(renderPipeline);
        pass.setBindGroup(0, renderBindGroup);
        pass.draw(3, 3);
        pass.end();

        commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }

    render();

    for (let i = 0; i < 30; i++) {
        await sleep(50);
        compute();
        render();
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

