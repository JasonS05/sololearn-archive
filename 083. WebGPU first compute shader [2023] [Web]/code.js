let shaderCode = `
@group(0) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(1) fn computeSomething(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    data[i] = data[i] * 2.0;
}
`;

window.onload = function() {
    main().catch(error => console.log("Error message:\n" + error.message + "\n\nStack traceback:\n" + error.stack));
};

async function main() {
    let adapter = await navigator.gpu?.requestAdapter();
    let device = await adapter?.requestDevice();

    if (!device) {
        throw new Error("WebGPU is not supported by this device/operating system/browser combination. Try using Google Chrome on Windows, macOS, or ChromeOS.");
    }

    let module = device.createShaderModule({
        label: "compute module",
        code: shaderCode
    });

    let pipeline = device.createComputePipeline({
        label: "compute pipeline",
        layout: "auto",
        compute: {
            module,
            entryPoint: "computeSomething"
        }
    });

    let input = new Float32Array([1, 3, 5]);

    let workBuffer = device.createBuffer({
        label: "work buffer",
        size: input.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(workBuffer, 0, input);

    let resultBuffer = device.createBuffer({
        label: "result buffer",
        size: input.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });

    let bindGroup = device.createBindGroup({
        label: "bind group for work buffer",
        layout: pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: workBuffer
            }
        }]
    });

    let encoder = device.createCommandEncoder({
        label: "encoder"
    });

    let pass = encoder.beginComputePass({
        label: "compute pass"
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(input.length);
    pass.end();

    encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

    let commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    await resultBuffer.mapAsync(GPUMapMode.READ);
    let result = new Float32Array(resultBuffer.getMappedRange());

    document.write("input: " + input + "<br>");
    document.write("result: " + result);

    resultBuffer.unmap();
}

