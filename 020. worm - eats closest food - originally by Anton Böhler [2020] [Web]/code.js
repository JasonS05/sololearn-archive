// Created by Anton Böhler. Orginal code here: https://code.sololearn.com/W2N0rVmwjxin/?ref=app


var can;
var c;

var worm;

var touch;

var foods;

window.onload = function(){
	can = document.getElementById("can");
	can.width = window.innerWidth;
	can.height = window.innerHeight;
	c = can.getContext("2d");

	touch = new Touch();

	can.addEventListener("touchstart", function(e){
		/*
		try{
			e.preventDefault();
		}catch(Exception){
			
		}
		*/
		touch.start(e);
	});

	can.addEventListener("touchmove", function(e){
		touch.move(e);
	});

	can.addEventListener("touchend", function(e){
		touch.end(e);
	});
	
	worm = new Worm(can.width/2, can.height/2);
	//console.log(worm);
	foods = [];
	for(var i=0;i<10;i++){
		foods.push(new Food(Math.random() * can.width, Math.random() * can.height, 5));
	}

	loop();
}


function loop(){
	c.fillStyle = "#815F4B";
	c.fillRect(0, 0, can.width, can.height);

	for(var i=0;i<foods.length;i++){
		if(worm.touchesFood(foods[i])){
			worm.extendBy(foods[i].color);
			foods[i] = new Food(Math.random() * can.width, Math.random() * can.height, 5);
		}
		foods[i].render(c);
	}
	
	worm.control(touch);
	worm.update();
	worm.render(c);
	
	if(touch.down){
		touch.render(c);
	}
	
	requestAnimationFrame(loop);
}


function Touch(){
	this.down = false;
	this.startPosition = [0, 0];
	this.currentPosition = [0, 0];
	this.angle = 0;
	this.dist = 0;
	
	this.start = function(e){
		this.down = true;
		this.startPosition = [e.touches[0].clientX, e.touches[0].clientY];
		this.currentPosition = this.startPosition;
	}

	this.move = function(e){
		this.angle = Math.atan2(e.touches[0].clientX - this.startPosition[0], e.touches[0].clientY - this.startPosition[1]);
		this.dist = Math.min(Math.hypot(e.touches[0].clientX - this.startPosition[0], e.touches[0].clientY - this.startPosition[1]), 40);
		this.currentPosition = [Math.sin(this.angle) * this.dist + this.startPosition[0], Math.cos(this.angle) * this.dist + this.startPosition[1]];
	}

	this.end = function(e){
		this.down = false;
		this.startPosition = [0, 0];
		this.currentPosition = [0, 0];
		this.angle = 0;
		this.dist = 0;
	}

	this.render = function(c){
		for(var i=0;i<40;i++){
			c.strokeStyle = "rgba(0, 100, 255," + (i/60) + ")";
			c.beginPath();
			c.arc(this.startPosition[0], this.startPosition[1], i, 0, 2*Math.PI);
			c.stroke();
		}
		
		
		for(var i=0;i<20;i++){
			c.strokeStyle = "rgba(255, 100, 0," + (i/60) + ")";
			c.beginPath();
			c.arc(this.currentPosition[0], this.currentPosition[1], i, 0, 2*Math.PI);
			c.stroke();
		}
	}
}


function Worm(x, y){
	this.bodyParts = [];
	this.bodyRadius = 10;
	for(var i=0;i<4;i++){
		this.bodyParts.push(new WormBodyPart(can.width/2 - i * this.bodyRadius, can.height/2, this.bodyRadius));
	}
	
	this.render = function(c){
		for(var i=this.bodyParts.length-1;i>=0;i--){
			this.bodyParts[i].render(c);
		}
	}

	this.control = function(touch){
		this.bodyParts[0].angle = this.findClosestFood();
		this.bodyParts[0].dist = 2;
	}
	
	this.findClosestFood = function() {
		let x = this.bodyParts[0].x;
		let y = this.bodyParts[0].y;
		
		let closestFoodX = foods[0].x;
		let closestFoodY = foods[0].y;
		let closestFoodDist = Math.hypot(closestFoodX - x, closestFoodY - y);
		
		for (let i = 0; i < foods.length; i++) {
			for (let j = -1; j <= 1; j++) {
				for (let k = -1; k <= 1; k++) {
					if (closestFoodDist > Math.hypot(foods[i].x + j * can.width - x, foods[i].y + k * can.height - y)) {
						closestFoodX = foods[i].x + j * can.width;
						closestFoodY = foods[i].y + k * can.height;
						closestFoodDist = Math.hypot(closestFoodX - x, closestFoodY - y);
					}
				}
			}
		}
		
		return Math.atan2(closestFoodX - x, closestFoodY - y);
	}

	this.update = function(){
		for(var i=1;i<this.bodyParts.length;i++){
			this.bodyParts[i].follow(this.bodyParts[i-1]);
		}
		this.bodyParts[0].update(true);
		for(var i=1;i<this.bodyParts.length;i++){
			this.bodyParts[i].update(false);
		}
	}

	this.touchesFood = function(food){
		return Math.hypot(this.bodyParts[0].x - food.x, this.bodyParts[0].y - food.y) < this.bodyParts[0].r + food.r;
	}

	this.extendBy = function(color){
		this.bodyParts.push(new WormBodyPart(this.bodyParts[this.bodyParts.length-1].x, this.bodyParts[this.bodyParts.length-1].y, this.bodyRadius));
		this.bodyParts[this.bodyParts.length-1].color = color;
	}
}


function WormBodyPart(x, y, r){
	this.x = x;
	this.y = y;
	this.r = r;
	this.dist = 0;
	this.angle = 0;

	this.color = "hsl(" + parseInt(Math.random() * 360) + ", 50%, 50%)";

	this.render = function(c){
		c.fillStyle = this.color;
		c.beginPath();
		c.arc(this.x, this.y, this.r, 0, 2*Math.PI);
		c.fill();
	}

	this.update = function(allowed){
		if(this.dist*8 >= this.r || allowed){
			this.x += Math.sin(this.angle) * this.dist;
			this.y += Math.cos(this.angle) * this.dist;
		}
		if(this.x < 0){
			this.x += can.width;
		}
		if(this.x > can.width){
			this.x -= can.width;
		}
		if(this.y < 0){
			this.y += can.height;
		}
		if(this.y > can.height){
			this.y -= can.height;
		}
	}

	this.follow = function(bodyPart){
		var smallestDist = can.width;
		var smallestDistAngle = 0;
		for(var i=-1;i<=1;i++){
			for(var j=-1;j<=1;j++){
				var dist = Math.hypot(bodyPart.x - this.x + i*can.width, bodyPart.y - this.y + j*can.height);
				if(smallestDist > dist){
					smallestDist = dist;
					smallestDistAngle = Math.atan2(bodyPart.x - this.x + i*can.width, bodyPart.y - this.y + j*can.height);
				}
			}
		}
		this.dist = smallestDist/8;
		this.angle = smallestDistAngle;
	}
}



function Food(x, y, r){
	this.x = x;
	this.y = y;
	this.r = r;
	
	this.color = "hsl(" + parseInt(Math.random() * 360) + ", 50%, 50%)";

	this.render = function(c){
		c.fillStyle = this.color;
		c.beginPath();
		c.arc(this.x, this.y, this.r, 0, 2*Math.PI);
		c.fill();
	}
}
