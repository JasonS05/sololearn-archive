// created by Jason Stone

const pi = Math.PI;
const tau = 2 * pi;
const xref = 100;
const yref = 300;

var canvas, ctx;
var crankPos = 0;

window.onload = function() {
	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");
	
	main();
}

function main() {
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//crank shaft circle
	ctx.strokeStyle = "#000";
	ctx.beginPath();
	ctx.arc(xref, yref, 10, 0, tau);
	ctx.stroke();
	ctx.closePath();
	
	var sinPos = Math.sin(crankPos);
	var cosPos = Math.cos(crankPos);
	
	//crank
	ctx.beginPath();
	ctx.arc(xref, yref, 50, 0.5 * pi + crankPos, 1.5 * pi + crankPos);
	ctx.arc(xref + 45 * sinPos, yref - 45 * cosPos, 5, 1.5 * pi + crankPos, crankPos);
	ctx.lineTo(xref + 5 * cosPos + 20 * sinPos, yref - 20 * cosPos + 5 * sinPos);
	ctx.moveTo(xref + 10 * cosPos + 15 * sinPos, yref - 15 * cosPos + 10 * sinPos);
	ctx.arc(xref + 10 * cosPos + 20 * sinPos, yref - 20 * cosPos + 10 * sinPos, 5, 0.5 * pi + crankPos, pi + crankPos);
	ctx.moveTo(xref + 10 * cosPos + 15 * sinPos, yref - 15 * cosPos + 10 * sinPos);
	ctx.lineTo(xref + 50 * cosPos + 15 * sinPos, yref - 15 * cosPos + 50 * sinPos);
	ctx.arc(xref + 50 * cosPos, yref + 50 * sinPos, 15, 1.5 * pi + crankPos, 0.5 * pi + crankPos);
	ctx.lineTo(xref + 10 * cosPos - 15 * sinPos, yref + 15 * cosPos + 10 * sinPos);
	ctx.moveTo(xref + 5 * cosPos - 20 * sinPos, yref + 20 * cosPos + 5 * sinPos);
	ctx.arc(xref + 10 * cosPos - 20 * sinPos, yref + 20 * cosPos + 10 * sinPos, 5, pi + crankPos, 1.5 * pi + crankPos);
	ctx.moveTo(xref + 5 * cosPos - 20 * sinPos, yref + 20 * cosPos + 5 * sinPos);
	ctx.lineTo(xref + 5 * cosPos - 45 * sinPos, yref + 45 * cosPos + 5 * sinPos);
	ctx.arc(xref - 45 * sinPos, yref + 45 * cosPos, 5, crankPos, 0.5 * pi + crankPos);
	ctx.stroke();
	ctx.closePath();
	
	//piston
	var y = 50 * sinPos - Math.sqrt(130 * 130 - 2500 * cosPos * cosPos);
	ctx.beginPath();
	ctx.arc(xref, yref + y + 80, 55, pi + Math.acos(45/55), -Math.acos(45/55));
	ctx.lineTo(xref + 50, yref + y + 80 - 55 * Math.sin(Math.acos(45/55)));
	ctx.lineTo(xref + 50, yref + y - 30);
	ctx.lineTo(xref - 50, yref + y - 30);
	ctx.lineTo(xref - 50, yref + y + 80 - 55 * Math.sin(Math.acos(45/55)));
	ctx.lineTo(xref - 45, yref + y + 80 - 55 * Math.sin(Math.acos(45/55)));
	ctx.stroke();
	ctx.closePath();
	
	//crank-piston connection rod
	var cx = xref + 50 * cosPos;
	var cy = yref + 50 * sinPos;
	var px = xref;
	var py = yref + 50 * sinPos - Math.sqrt(130 * 130 - 2500 * cosPos * cosPos);
	var angle = Math.atan2(px - cx, cy - py);
	ctx.beginPath();
	ctx.arc(cx, cy, 20, angle - Math.acos(1/2), angle + pi + Math.acos(1/2));
	ctx.lineTo(px - 20 * Math.cos(angle - Math.acos(1/2)), py - 20 * Math.sin(angle - Math.acos(1/2)));
	ctx.arc(px, py, 20, angle + pi - Math.acos(1/2), angle + Math.acos(1/2));
	ctx.lineTo(cx + 20 * Math.cos(angle - Math.acos(1/2)), cy + 20 * Math.sin(angle - Math.acos(1/2)));
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	
	//crank rod attachment circle
	ctx.beginPath();
	ctx.arc(xref + 50 * cosPos, yref + 50 * sinPos, 10, 0, tau)
	ctx.stroke();
	ctx.closePath();
	
	//piston rod attachment circle
	ctx.beginPath();
	ctx.arc(xref, yref + 50 * sinPos - Math.sqrt(130 * 130 - 2500 * cosPos * cosPos), 10, 0, tau);
	ctx.stroke();
	ctx.closePath();
	
	//piston housing
	ctx.beginPath();
	ctx.moveTo(xref - 50, yref - 60);
	ctx.lineTo(xref - 50, yref - 220);
	ctx.lineTo(xref + 50, yref - 220);
	ctx.lineTo(xref + 50, yref - 60);
	ctx.lineTo(xref + 55, yref - 60);
	ctx.lineTo(xref + 55, yref - 225);
	ctx.lineTo(xref - 55, yref - 225);
	ctx.lineTo(xref - 55, yref - 60);
	ctx.lineTo(xref - 50, yref - 60);
	ctx.stroke();
	ctx.closePath();
	
	//updated this. Now it operates at maximum fps for smoothest operation and the animation speed is fps independant
	crankPos = (new Date() / 400) % tau;
	setTimeout(main, 0);
}
