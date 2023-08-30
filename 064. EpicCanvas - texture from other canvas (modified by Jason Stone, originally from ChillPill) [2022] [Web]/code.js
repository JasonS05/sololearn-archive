// Created by ChillPill

//this is simple code for testing custom texture
 
const setupLighting = (ec) => {
   //ambient light
   ec.ambientColor=[0.0,0.0,0.0]
   //directional light
   ec.directionalColor=[1,1,1]
   ec.directionalVector=[0,0,1]
}

const setupTexture = (ec) => {
	const canvas = document.querySelector("#texture")
	const w = 512
	canvas.width = canvas.height = w
	const ctx = canvas.getContext("2d")
	//xor texture
	const imgData = ctx.getImageData(0,0,w,w)
	for(let i=0;i<w*4*w;i+=4){
		const x = parseInt((i%(w*4))/4)
		const y = parseInt(i/(w*4))
		const c = (x*256/w)^(y*256/w)
		imgData.data[i] = c
		imgData.data[i+1] = c
		imgData.data[i+2] = c
		imgData.data[i+3] = 255
	}
	ctx.putImageData(imgData,0,0)
	ctx.font = "50px cursive"
	ctx.fillStyle = "white"
	ctx.fillText("EpicCanvas", w/2+10,w/2-10)
	ctx.strokeStyle = "black"
	ctx.strokeText("EpicCanvas", w/2+10,w/2-10)
	ctx.translate(w/2,w/2);
	ctx.rotate(Math.PI);
	ctx.translate(-w/2,-w/2);
	ctx.fillText("by ChillPill", w/2+10,w/2-10)
	ctx.strokeText("by ChillPill", w/2+10,w/2-10)
	//simply load texture as URL in the EpicCanvas
	const textureURL= canvas.toDataURL()
	return ec.loadTexture(textureURL)
}

const setupWorld = (ec) => {
	mat4.translate(
		ec.matrices.projectionMatrix,
		ec.matrices.projectionMatrix,
		[0,0,-3]
	)
}

const getProgram = (ec) => {
	const program = ec.initShaderProgram(vsTextureLight,fsTextureLight)
	const programInfo = getProgramInfo(ec.gl,program)
	return programInfo
}

function main(){
	const ec=new EpicCanvas(700,700,"body")
	const backgroundTexture = setupTexture(ec)
	let cubeTexture = backgroundTexture
	setupLighting(ec)
	setupWorld(ec)
	const program = getProgram(ec)
	const cube = Cube(ec,500)
	rotateY(cube, Math.PI/4)
	
	const background = Cube(ec,500)
	scale(background, 6.928,6.928,1)
	translateZ(background,-10)
	ec.reloadBufferData(background)
	ec.clearColor=[0.3,0.3,0.3,1]
	const fps = document.querySelector("#fps")
	let prevTime=0
	let frames = 0
	function draw(time){
		fps.innerText = (parseInt(1000/(time-prevTime)))+"fps"
		prevTime = time
		ec.clearScreen()
		ec.setTexture(backgroundTexture)
		drawShape(ec,program,background)
		ec.setTexture(cubeTexture)
		drawShape(ec, program, cube)
		rotateY(cube, 0.01)
		ec.reloadBufferData(cube)
		if (frames > 0) {
			const textureURL = ec.canvas.toDataURL()
			cubeTexture = ec.loadTexture(textureURL)
		}
		frames++
		setTimeout(()=>draw(new Date().getTime()), 20)
	}
	requestAnimationFrame(draw)
}

onload=main






