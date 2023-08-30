const pi = Math.PI;
const tau = 2 * pi;
const xref = 125;
const yref = 55;

var ctx, canvas;
var crankPos = 0;
var time = Date.now();

function getCircleIntersection(x1, y1, r1, x2, y2, r2, plusOrMinus) {
	var r = r2 / r1;
	var d = Math.hypot(x2 - x1, y2 - y1) / r1;
	var tempX = (1 - r * r + d * d) / (2 * d);
	var tempY = plusOrMinus * Math.sqrt(1 - tempX * tempX);
	var angle = Math.atan2(x2 - x1, y2 - y1);
	var xOut = (tempX * Math.sin(angle) - tempY * Math.cos(angle)) * r1 + x1;
	var yOut = (tempX * Math.cos(angle) + tempY * Math.sin(angle)) * r1 + y1;
	return [xOut, yOut];
}

function getAmountOfTimeSinceThisWasLastCalled() {
	var time2 = Date.now();
	var timeDiff = time2 - time;
	time = time2;
	return timeDiff;
}

window.onload = function() {
	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");
	ctx.scale(2, 2);
	main();
}

function main() {
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	crankPos += getAmountOfTimeSinceThisWasLastCalled() / (2**(-document.getElementsByTagName("input")[0].value/300) * 3000);
	crankPos %= tau;
	
	var sin = Math.sin(crankPos);
	var cos = Math.cos(crankPos);
	ctx.strokeStyle = "#000"
	
	//crank inner circle
	ctx.beginPath();
	ctx.arc(xref, yref, 10, 0, tau);
	ctx.stroke();
	ctx.closePath();
	
	//crank
	ctx.beginPath();
	ctx.arc(xref, yref, 50, crankPos, crankPos + pi);
	ctx.arc(xref - 45 * cos, yref - 45 * sin, 5, crankPos + pi, crankPos + 3 * pi / 2);
	ctx.lineTo(xref - 15 * cos + 5 * sin, yref - 5 * cos - 15 * sin);
	ctx.lineTo(xref - 15 * cos + 35 * sin, yref - 35 * cos - 15 * sin);
	ctx.arc(xref + 35 * sin, yref - 35 * cos, 15, crankPos + pi, crankPos);
	ctx.lineTo(xref + 15 * cos + 5 * sin, yref - 5 * cos + 15 * sin);
	ctx.lineTo(xref + 45 * cos + 5 * sin, yref - 5 * cos + 45 * sin);
	ctx.arc(xref + 45 * cos, yref + 45 * sin, 5, crankPos + 3 * pi / 2, crankPos);
	ctx.stroke();
	ctx.closePath();
	
	var rodIntersection = getCircleIntersection(35 * sin, -35 * cos, 95, 50, 100, 60, 1)
	
	//piston
	ctx.beginPath();
	ctx.rect(xref - 12 + rodIntersection[0] - Math.sqrt(80 * 80 - (100 - rodIntersection[1]) ** 2), yref + 80, 24, 40);
	ctx.stroke();
	ctx.closePath();
	
	//rod connected to the piston
	var pistonRodAngle = - Math.atan2(12 + Math.sqrt(80 * 80 - (100 - rodIntersection[1]) ** 2), rodIntersection[1] - 100);
	ctx.beginPath();
	ctx.arc(xref + rodIntersection[0] - Math.sqrt(80 * 80 - (100 - rodIntersection[1]) ** 2), yref + 100, 5, pistonRodAngle + pi - 1, pistonRodAngle + 1);
	ctx.arc(xref + rodIntersection[0], yref + rodIntersection[1], 10, pistonRodAngle - 1, pistonRodAngle + pi + 1);
	ctx.arc(xref + rodIntersection[0] - Math.sqrt(80 * 80 - (100 - rodIntersection[1]) ** 2), yref + 100, 5, pistonRodAngle + pi - 1, pistonRodAngle + pi - 1);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	
	//that other rod
	var otherRodAngle = - Math.atan2(rodIntersection[0] - 50, rodIntersection[1] - 100);
	ctx.beginPath();
	ctx.arc(xref + 50, yref + 100, 10, otherRodAngle + pi - 1, otherRodAngle + 1);
	ctx.arc(xref + rodIntersection[0], yref + rodIntersection[1], 10, otherRodAngle - 1, otherRodAngle + pi + 1);
	ctx.arc(xref + 50, yref + 100, 10, otherRodAngle + pi - 1, otherRodAngle + pi - 1);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	
	//rod connected to the crank
	var crankRodAngle = - Math.atan2(rodIntersection[0] - 35 * sin, rodIntersection[1] + 35 * cos);
	ctx.beginPath();
	ctx.arc(xref + 35 * sin, yref - 35 * cos, 10, crankRodAngle + pi - 1, crankRodAngle + 1);
	ctx.arc(xref + rodIntersection[0], yref + rodIntersection[1], 10, crankRodAngle - 1, crankRodAngle + pi + 1);
	ctx.arc(xref + 35 * sin, yref - 35 * cos, 10, crankRodAngle + pi - 1, crankRodAngle + pi - 1);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	
	//crank and rod-connected-to-crank cttachment circle
	ctx.beginPath();
	ctx.arc(xref + 35 * sin, yref - 35 * cos, 5, 0, tau);
	ctx.stroke();
	ctx.closePath();
	
	//that other rod attachment circle
	ctx.beginPath();
	ctx.arc(xref + 50, yref + 100, 5, 0, tau);
	ctx.stroke();
	ctx.closePath();
	
	//attachment circle where all the rods meet
	ctx.beginPath();
	ctx.arc(xref + rodIntersection[0], yref + rodIntersection[1], 5, 0, tau);
	ctx.stroke();
	ctx.closePath();
	
	//piston housing
	ctx.beginPath();
	ctx.moveTo(xref - 104, yref + 80);
	ctx.lineTo(xref - 50, yref + 80);
	ctx.lineTo(xref - 50, yref + 75);
	ctx.lineTo(xref - 109, yref + 75);
	ctx.lineTo(xref - 109, yref + 125);
	ctx.lineTo(xref - 50, yref + 125);
	ctx.lineTo(xref - 50, yref + 120);
	ctx.lineTo(xref - 104, yref + 120);
	ctx.lineTo(xref - 104, yref + 80);
	ctx.stroke();
	ctx.closePath();
	
	//gasses
	if (crankPos < 2) {
		ctx.fillStyle = "#777";
	} else if (crankPos < 3.2) {
		ctx.fillStyle = "#07f";
	} else if (crankPos < 4.5) {
		ctx.fillStyle = "#00f";
	} else {
		ctx.fillStyle = "#f70";
	}
	ctx.fillRect(xref - 104, yref + 80, 92 + rodIntersection[0] - Math.sqrt(80 * 80 - (100 - rodIntersection[1]) ** 2), 40);
	
	setTimeout(main, 0);
}
