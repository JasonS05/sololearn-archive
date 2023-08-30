// Created by marjel101 modified by Jason Stone

"use strict";
let creator;
let fpsdisp;
let w, h;
let circles = [];

class Circle {
  constructor(x, y, angle, alpha) {
	this.pos = createVector(x, y);
	this.radius = 10;
	this.angle = angle;
	this.alpha = alpha;
  }
  show() {
	noFill();
	stroke(255, this.alpha);
	circle(this.pos.x, this.pos.y, this.radius)
  }
  update() {
	push();
	  rotate(this.angle);
	  this.angle += 180+sqrt(5)*180;
	  this.show();
	pop();
  }
}
function setup() {
  if (windowWidth > displayWidth) {
	w = displayWidth;
	h = displayHeight*0.8;
  } else {
	w = windowWidth;
	h = windowHeight;
  }
  createCanvas(w, h);
  background(20);
  angleMode(DEGREES);
  fpsdisp = createSpan().id("fps");
  creator = createSpan().id("creator"); 
  creator.html("created by marjel101");
}

let angle = 0;
let y = 1;
let alpha = 255;

function draw() {
  fpsdisp.html("fps: "+floor(frameRate()));
  background(20);
  circles.push(new Circle(0, y, angle, alpha));
  //angle += 1; // set this value to -1 or 1 if your fps can't handle the wobbling
  y += 10/sqrt(circles.length);
  //alpha -= 1;
  push();
	translate(width/2, height/2);
	for (let i=0; i<circles.length; i++) {
	  circles[i].update();
	  if (circles[i].alpha <= 0) circles.splice(i,1);
	}
  pop();
}

