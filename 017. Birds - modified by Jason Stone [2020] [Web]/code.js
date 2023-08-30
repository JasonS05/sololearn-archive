// Created by Rull Deef 🐺

const w = innerWidth, h = innerHeight
let ctx

const {random, sin, cos, PI,
  hypot, asin, sign} = Math


const birdWidth  = 12
const birdHeight = 6
const birdSpeed  = 120
const birdCount  = 30
const minDistance = 48

const birds = []


onload = () => {
  const cvs = document.querySelector('canvas')
  cvs.width = w
  cvs.height = h
  ctx = cvs.getContext('2d')
  
  ctx.strokeStyle = '#9ec5ff'
  ctx.fillStyle = '#271441'
  
  for(let i = 0; i < birdCount; i++)
	birds.push(new Bird)
  
  animate()
}


function animate() {
  ctx.resetTransform()
  ctx.fillRect(0, 0, w, h)
  
  birds.map(bird => bird.update())
  birds.map(bird => bird.render())
  
  requestAnimationFrame(animate)
}


class Bird {
  constructor() {
	this.x = w * random()
	this.y = h * random()
	
	const angle = 2*PI * random()
	this.vx = cos(angle)
	this.vy = sin(angle)
  }
  
  update() {
	birds.map(bird => {
	  if(bird !== this)
		this.interact(bird)
	})
	this.fly(birdSpeed * 1/60)
  }
  
  fly(dv) {
	this.x += this.vx * dv
	this.y += this.vy * dv
	
	if(this.x < -birdWidth)
	  this.x += w + 2*birdWidth
	else if(this.x >= w + birdWidth)
	  this.x -= w + 2*birdWidth
	
	if(this.y < -birdWidth)
	  this.y += h + 2*birdWidth
	else if(this.y >= h + birdWidth)
	  this.y -= h + 2*birdWidth
  }
  
  interact(bird) {
	const dx = bird.x - this.x
	const dy = bird.y - this.y
	const distance = hypot(dx, dy)
	
	if(distance < minDistance) {
	  const sina = this.vy*dx - this.vx*dy
	  const angle = asin(sina/distance)
	  
	  this.rotate(5 * sign(angle) * Math.atan(1/distance - 2/minDistance))
	}
  }
  
  rotate(angle) {
	const cosa = cos(angle)
	const sina = sin(angle)
	const vx = this.vx*cosa - this.vy*sina
	const vy = this.vx*sina + this.vy*cosa
	this.vx = vx
	this.vy = vy
  }
  
  render() {
	ctx.setTransform(this.vx, this.vy,
	  -this.vy, this.vx, this.x, this.y)
	ctx.beginPath()
	ctx.moveTo(0, 0)
	ctx.lineTo(-birdWidth, -birdHeight/2)
	ctx.lineTo(-birdWidth, birdHeight/2)
	ctx.closePath()
	ctx.stroke()
  }
}
