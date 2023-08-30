const goldenRatio = (1 + Math.sqrt(5)) / 2;
const {PI: pi, sin, cos, min, sqrt} = Math;
const tau = 2 * pi;

// configurables
const numOfDots = 1000;
const radius = 2;
const backgroundColor = "#000";
const dotColor = "#fff";

window.onload = function() {
	var canvas = document.querySelector("#canvas");
	var width = canvas.width;
	var height = canvas.height;
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = dotColor;
	
	var angle, dist, x, y;
	for (var i = 0; i < numOfDots; i++) {
		angle = i * goldenRatio * tau;
		dist = sqrt(i) / sqrt(numOfDots) * min(width, height) / 2.1;
		x = sin(angle) * dist + width/2;
		y = cos(angle) * dist + height/2;
		
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, tau);
		ctx.fill();
		ctx.closePath();
	}
}
