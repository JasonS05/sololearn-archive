let shaderCode = `
struct Particle {
    position: vec2f,
    velocity: vec2f,
    oldForce: vec2f,
    potential: f32
}

fn equal(p1: Particle, p2: Particle) -> bool {
    return
        p1.position.x == p2.position.x &&
        p1.position.y == p2.position.y &&
        p1.velocity.x == p2.velocity.x &&
        p1.velocity.y == p2.velocity.y &&
        p1.oldForce.x == p2.oldForce.x &&
        p1.oldForce.y == p2.oldForce.y &&
        p1.potential == p2.potential;
}

struct miscData {
    maximumTimeStep: f32,
    inverseTimeStep: atomic<u32>
}

// values with [[...]] are supplied by JS using textual substitution
const numParticles: u32 = [[numParticles]];
const particleRadius: f32 = [[particleRadius]];
const potentialCutoff: f32 = [[potentialCutoff]];
const timeStepCaution: f32 = [[timeStepCaution]];
const gravity: f32 = [[gravity]];
const gridCellsPerDimension: u32 = [[gridCellsPerDimension]];
const gridCellSize: f32 = [[gridCellSize]];
const gridCellCapacity: u32 = [[gridCellCapacity]];
const numGridCells: u32 = [[numGridCells]];

const pi = 3.1415926;
const particleSize = particleRadius / pow(2, 1/6) * 2; // an adjusted version of particleRadius used in calculations

@group(0) @binding(0) var<storage, read> input_data: array<Particle>;
@group(0) @binding(1) var<storage, read> input_grid: array<Particle>;
@group(0) @binding(2) var<storage, read> input_gridCounters: array<u32>;
@group(0) @binding(3) var<storage, read_write> input_misc: miscData; // read_write for atomic access, no writing is actually done

@group(0) @binding(4) var<storage, read_write> output_data: array<Particle>;
@group(0) @binding(5) var<storage, read_write> output_grid: array<Particle>;
@group(0) @binding(6) var<storage, read_write> output_gridCounters: array<atomic<u32>>;
@group(0) @binding(7) var<storage, read_write> output_misc: miscData;

@compute @workgroup_size(64) fn computeShader(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;

    // in case the number of particles is not a multiple of the workgroup size
    if (index >= numParticles) {
        return;
    }

    let timeStep = input_misc.maximumTimeStep / f32(atomicLoad(&input_misc.inverseTimeStep));

    var particle = input_data[index];
    let result = calculateForceAndPotential(particle, timeStep);

    particle.velocity += (result.force + particle.oldForce) / 2 * timeStep;
    particle.position += particle.velocity * timeStep + result.force * timeStep * timeStep / 2;
    particle.oldForce = result.force;
    particle.potential = result.potential;

    output_data[index] = particle;
    placeParticleInGrid(particle);

    let minimumInverseTimeStep = u32(ceil(timeStepCaution * input_misc.maximumTimeStep * length(particle.velocity) / particleRadius));

    output_misc.maximumTimeStep = input_misc.maximumTimeStep;
    atomicMax(&output_misc.inverseTimeStep, minimumInverseTimeStep);
}

fn placeParticleInGrid(particle: Particle) {
    let gridCellPosition = vec2i(floor((particle.position + 1) / 2 / gridCellSize));
    let gridCellNumberCandidate = gridCellPosition.x + gridCellPosition.y * i32(gridCellsPerDimension);

    if (gridCellNumberCandidate >= 0 && gridCellNumberCandidate < i32(numGridCells)) {
        let gridCellNumber = u32(gridCellNumberCandidate);
        let gridCellOffset = gridCellNumber * gridCellCapacity;
        let gridCellOccupancy = atomicAdd(&output_gridCounters[gridCellNumber], 1);

        if (gridCellOccupancy < gridCellCapacity) {
            output_grid[gridCellOffset + gridCellOccupancy] = particle;
        } else {
            let overflowOffset = numGridCells * gridCellCapacity;
            let overflowOccupancy = atomicAdd(&output_gridCounters[numGridCells], 1);
            output_grid[overflowOffset + overflowOccupancy] = particle;
        }
    } else {
        let n = particleRadius * 2 * potentialCutoff + 1;
        let x = particle.position.x;
        let y = particle.position.y;

        if (x > -n && x < n && y > -n && y < n) {
            let overflowOffset = numGridCells * gridCellCapacity;
            let overflowOccupancy = atomicAdd(&output_gridCounters[numGridCells], 1);
            output_grid[overflowOffset + overflowOccupancy] = particle;
        }
    }
}

struct forceAndPotential {
    force: vec2f,
    potential: f32
}

fn calculateForceAndPotential(particle: Particle, timeStep: f32) -> forceAndPotential {
    let position = particle.position;
    var LJforce = vec2f(0, 0);
    var potential: f32 = 0;

    let gridCellPosition = vec2i(floor((particle.position + 1) / 2 / gridCellSize));

    for (var y = gridCellPosition.y - 1; y < gridCellPosition.y + 2; y++) {
        for (var x = gridCellPosition.x - 1; x < gridCellPosition.x + 2; x++) {
            if (x >= 0 && y >= 0 && x < i32(gridCellsPerDimension) && y < i32(gridCellsPerDimension)) {
                let gridCellNumber = u32(x) + u32(y) * gridCellsPerDimension;
                let gridCellOffset = gridCellNumber * gridCellCapacity;
                let gridCellOccupancy = min(input_gridCounters[gridCellNumber], gridCellCapacity);

                for (var i: u32 = gridCellOffset; i < gridCellOffset + gridCellOccupancy; i++) {
                    let otherParticle = input_grid[i];

                    if (!equal(otherParticle,particle)) {
                        let result = calculateForceAndPotential_helper(particle, otherParticle);

                        LJforce += result.force;
                        potential += result.potential;
                    }
                }
            }
        }
    }

    let gridCellOverflowOffset = numGridCells * gridCellCapacity;
    let gridCellOverflowOccupancy = input_gridCounters[numGridCells];

    for (var i: u32 = gridCellOverflowOffset; i < gridCellOverflowOffset + gridCellOverflowOccupancy; i++) {
        let otherParticle = input_grid[i];

        if (!equal(otherParticle, particle)) {
            let result = calculateForceAndPotential_helper(particle, otherParticle);

            LJforce += result.force;
            potential += result.potential;
        }
    }

    let gravityForce = vec2f(0, -gravity);
    let gravityPotential = gravity * position.y * 2;

    var wallForce = vec2f(0, 0);

    if (position.x > 1) {
        wallForce += vec2f(-position.x + 1, 0);
    }

    if (position.y > 1) {
        wallForce += vec2f(0, -position.y + 1);
    }

    if (position.x < -1) {
        wallForce += vec2f(-position.x - 1, 0);
    }

    if (position.y < -1) {
        wallForce += vec2f(0, -position.y - 1);
    }

    wallForce /= timeStep * timeStep;

    var result: forceAndPotential;
    result.force = LJforce + wallForce + gravityForce;
    result.potential = potential + 0 * gravityPotential;
    return result;
}

fn calculateForceAndPotential_helper(particle1: Particle, particle2: Particle) -> forceAndPotential {
    let relativePosition = particle2.position - particle1.position;
    let distance2 = dot(relativePosition, relativePosition);

    if (distance2 < particleRadius * particleRadius * potentialCutoff * potentialCutoff * 4) {
        let cutoffDistanceRadii = particleRadius * 2 * potentialCutoff / particleSize;
        let potentialAtCutoff = pow(cutoffDistanceRadii, -12) - pow(cutoffDistanceRadii, -6);

        let iparticleSize = 1 / particleSize;
        let iparticleSize2 = iparticleSize * iparticleSize;
        let radii2 = distance2 * iparticleSize2;
        let iradii2 = 1 / radii2;
        let iradii4 = iradii2 * iradii2;
        let iradii6 = iradii4 * iradii2;
        let iradii12 = iradii6 * iradii6;

        var result: forceAndPotential;
        result.force = (iradii6 * 6 - iradii12 * 12) * iradii2 * iparticleSize2 * relativePosition;
        result.potential = iradii12 - iradii6 - potentialAtCutoff;
        return result;
    } else {
        return forceAndPotential(vec2f(0, 0), 0);
    }
}

struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
}

@vertex fn vertexShader(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexShaderOutput {
    let radius = particleRadius;

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
    vsOutput.position = vec4f(input_data[instanceIndex].position + vertexPosition, 0, 1);

    let red = vec4f(1, 0.5, 0, 1);
    let blue = vec4f(0, 0.5, 1, 1);
    let white = vec4f(1, 1, 1, 1);

    let potentialEnergy = input_data[instanceIndex].potential / 2;
    let velocity = input_data[instanceIndex].velocity;
    let kineticEnergy = 0.5 * dot(velocity, velocity);
    var color = 5 * potentialEnergy + 0 * kineticEnergy + 2.5;

    if (color < 0) {
        vsOutput.color = mix(white, blue, -color);
    } else {
        vsOutput.color = mix(white, red, color);
    }

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

let numParticles = 15000; // must not be higher than 4194240 (i.e. 65535 * 64);
let particleRadius = 0.005;
let potentialCutoff = 2.5;
let simWidth = 2; // -1.0 to 1.0, not currently adjustable
let maximumTimeStep = 1;
let timeStepCaution = 100;
let gravity = 0.1;
let initialTemperature = 0.3;

// determined by shader code
let bytesPerParticle = 32;
let miscBufferLength = 8;

let gridCellsPerDimension = Math.floor(simWidth / (particleRadius * 2 * potentialCutoff));
let gridCellSize = 1 / gridCellsPerDimension;
let gridCellCapacity = Math.ceil(2 * (gridCellSize / particleRadius + 1) ** 2);
let numGridCells = gridCellsPerDimension ** 2;
let gridBufferSize = numParticles + numGridCells * gridCellCapacity + 1;

shaderCode = shaderCode.replace("[[numParticles]]", numParticles);
shaderCode = shaderCode.replace("[[particleRadius]]", particleRadius);
shaderCode = shaderCode.replace("[[potentialCutoff]]", potentialCutoff);
shaderCode = shaderCode.replace("[[timeStepCaution]]", timeStepCaution);
shaderCode = shaderCode.replace("[[gravity]]", gravity);
shaderCode = shaderCode.replace("[[gridCellsPerDimension]]", gridCellsPerDimension);
shaderCode = shaderCode.replace("[[gridCellSize]]", gridCellSize);
shaderCode = shaderCode.replace("[[gridCellCapacity]]", gridCellCapacity);
shaderCode = shaderCode.replace("[[numGridCells]]", numGridCells);

let adapter = null;
let errorHasOccured = false;

function reportError(error) {
    errorHasOccured = true;
    console.log("Error message:\n" + error.message + "\n\nStack traceback:\n" + error.stack);
    if (device) device.destroy();
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
    device = await adapter?.requestDevice();

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

    let floatsPerParticle = bytesPerParticle / 4;

    let workBuffer = new Float32Array(numParticles * bytesPerParticle);

    for (let i = 0; i < numParticles; i++) {
        let sqrt = Math.ceil(Math.sqrt(numParticles / 2));
        let x = (i % (sqrt * 2)) / sqrt * 2 - 1 + 1 / sqrt;
        let y = Math.floor(i / (sqrt * 2)) / sqrt * 2 - 1 + 1 / sqrt;

        workBuffer[floatsPerParticle * i + 0] = x / 2 - 0.5;
        workBuffer[floatsPerParticle * i + 1] = y / 2 - 0.5;
        workBuffer[floatsPerParticle * i + 2] = Math.sqrt(initialTemperature) * (Math.random() * 2 - 1);
        workBuffer[floatsPerParticle * i + 3] = Math.sqrt(initialTemperature) * (Math.random() * 2 - 1);
    }

    let grid = new Float32Array(gridBufferSize * bytesPerParticle);
    let gridCounters = new Uint32Array(numGridCells + 1);

    for (let i = 0; i < numParticles; i++) {
        let particle = {};
        particle.x = (workBuffer[floatsPerParticle * i + 0] + 1) / 2;
        particle.y = (workBuffer[floatsPerParticle * i + 1] + 1) / 2;

        let gridX = Math.floor(particle.x / gridCellSize);
        let gridY = Math.floor(particle.y / gridCellSize);
        let gridCellNumber = gridX + gridCellsPerDimension * gridY;

        if (gridCellNumber >= 0 && gridCellNumber < numGridCells) {
            let gridCellOffset = gridCellNumber * gridCellCapacity;
            let numParticlesInCell = gridCounters[gridCellNumber]++;

            if (numParticlesInCell < gridCellCapacity) {
                let gridIndex = gridCellOffset + numParticlesInCell;

                for (let j = 0; j < floatsPerParticle; j++) {
                    grid[floatsPerParticle * gridIndex + j] = workBuffer[floatsPerParticle * i + j];
                }
            } else {
                throw new Error("Attempt to place a particle in a full grid cell");
            }
        } else {
            throw new Error("Attempt to place a particle outside the simulation field");
        }
    }

    let misc = new ArrayBuffer(miscBufferLength);
    let miscF32 = new Float32Array(misc);
    let miscU32 = new Uint32Array(misc);

    miscF32[0] = maximumTimeStep;
    miscU32[1] = 4_000_000_000;

    let workBuffer1 = device.createBuffer({
        label: "work buffer 1",
        size: workBuffer.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    let workBuffer2 = device.createBuffer({
        label: "work buffer 2",
        size: workBuffer.byteLength,
        usage: GPUBufferUsage.STORAGE
    });

    let gridBuffer1 = device.createBuffer({
        label: "grid buffer 1",
        size: grid.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    let gridBuffer2 = device.createBuffer({
        label: "grid buffer 2",
        size: grid.byteLength,
        usage: GPUBufferUsage.STORAGE
    });

    let gridCountersBuffer1 = device.createBuffer({
        label: "grid counters buffer 1",
        size: gridCounters.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    let gridCountersBuffer2 = device.createBuffer({
        label: "grid counters buffer 2",
        size: gridCounters.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    let miscBuffer1 = device.createBuffer({
        label: "misc buffer 1",
        size: misc.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    let miscBuffer2 = device.createBuffer({
        label: "misc buffer 2",
        size: misc.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(workBuffer1, 0, workBuffer);
    device.queue.writeBuffer(gridBuffer1, 0, grid);
    device.queue.writeBuffer(miscBuffer1, 0, misc);

    let computeBindGroup1 = device.createBindGroup({
        label: "compute bind group",
        layout: computePipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: workBuffer1
            }
        }, {
            binding: 1,
            resource: {
                buffer: gridBuffer1
            }
        }, {
            binding: 2,
            resource: {
                buffer: gridCountersBuffer1
            }
        }, {
            binding: 3,
            resource: {
                buffer: miscBuffer1
            }
        }, {
            binding: 4,
            resource: {
                buffer: workBuffer2
            }
        }, {
            binding: 5,
            resource: {
                buffer: gridBuffer2
            }
        }, {
            binding: 6,
            resource: {
                buffer: gridCountersBuffer2
            }
        }, {
            binding: 7,
            resource: {
                buffer: miscBuffer2
            }
        }]
    });

    // some buffers are swapped
    let computeBindGroup2 = device.createBindGroup({
        label: "compute bind group",
        layout: computePipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: workBuffer2
            }
        }, {
            binding: 1,
            resource: {
                buffer: gridBuffer2
            }
        }, {
            binding: 2,
            resource: {
                buffer: gridCountersBuffer2
            }
        }, {
            binding: 3,
            resource: {
                buffer: miscBuffer2
            }
        }, {
            binding: 4,
            resource: {
                buffer: workBuffer1
            }
        }, {
            binding: 5,
            resource: {
                buffer: gridBuffer1
            }
        }, {
            binding: 6,
            resource: {
                buffer: gridCountersBuffer1
            }
        }, {
            binding: 7,
            resource: {
                buffer: miscBuffer1
            }
        }]
    });

    let renderBindGroup = device.createBindGroup({
        label: "render bind group",
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
            clearValue: [0.0, 0.0, 0.0, 1.0],
            loadOp: "clear",
            storeOp: "store"
        }]
    };

    function compute(iterations) {
        if (errorHasOccured) return;

        let encoder = device.createCommandEncoder({label: "compute encoder"});

        let pass = null;

        for (let i = 0; i < iterations; i++) {
            encoder.clearBuffer(gridCountersBuffer2);
            encoder.clearBuffer(miscBuffer2);

            pass = encoder.beginComputePass({label: "compute pass"});
            pass.setPipeline(computePipeline);
            pass.setBindGroup(0, computeBindGroup1);
            pass.dispatchWorkgroups(Math.ceil(numParticles / 64));
            pass.end();

            encoder.clearBuffer(gridCountersBuffer1);
            encoder.clearBuffer(miscBuffer1);

            pass = encoder.beginComputePass({label: "compute pass"});
            pass.setPipeline(computePipeline);
            pass.setBindGroup(0, computeBindGroup2);
            pass.dispatchWorkgroups(Math.ceil(numParticles / 64));
            pass.end();
        }

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
        // increase this number if you have a beefy GPU
        compute(100);
        render();

        if (!errorHasOccured) {
            device.queue.onSubmittedWorkDone().then(mainLoop);
        }
    }

    mainLoop();
}

