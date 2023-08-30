let shaderCode = `
@vertex fn vs(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
    let position = array(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5)
    );

    return vec4f(position[vertexIndex], 0.0, 1.0);
}

@fragment fn fs() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}
`;

window.onload = function() {
    main().catch(error => console.log("Error message:\n" + error.message + "\n\nStack traceback:\n" + error.stack));
};

async function main() {
    let canvas = document.getElementById("can");
    canvas.width = 512;
    canvas.height = 512;

    let gpu = navigator.gpu;
    let adapter = await gpu?.requestAdapter();
    let device = await adapter?.requestDevice();

    if (!device) {
        throw new Error("WebGPU is not supported by this device/operating system/browser combination. Try using Google Chrome on Windows, macOS, or ChromeOS.");
    }

    let queue = device.queue;
    let context = canvas.getContext("webgpu");
    let presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format: presentationFormat
    });

    let module = device.createShaderModule({
        label: "hardcoded red triangle shaders",
        code: shaderCode
    });

    let pipeline = device.createRenderPipeline({
        label: "hardcoded red triangle pipeline",
        layout: "auto",
        vertex: {
            module,
            entryPoint: "vs"
        },
        fragment: {
            module,
            entryPoint: "fs",
            targets: [{format: presentationFormat}]
        }
    });

    let renderPassDescriptor = {
        label: "canvas renderPass",
        colorAttachments: [{
            view: undefined, // to be assigned later
            clearValue: [0.3, 0.3, 0.3, 1.0],
            loadOp: "clear",
            storeOp: "store"
        }]
    };

    function render() {
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

        let encoder = device.createCommandEncoder({label: "encoder"});

        let pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.draw(3);
        pass.end();

        let commandBuffer = encoder.finish();
        queue.submit([commandBuffer]);
    }

    render();
}

