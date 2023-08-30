// created by Jason Stone

var plot, width, height, ctx;

window.onload = function() {
	plot = document.querySelector("#plot");
	width = plot.width = window.innerWidth * 0.8;
	height = plot.height = width / 2;
	ctx = plot.getContext("2d");
	
	ctx.fillStyle = "#777";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "#fff";
	ctx.fillRect(2, 2, width - 4, height - 4);
	
	main();
}

function main() {
	ctx.fillStyle = "#000";
	
	var a = 1;
	for (let i = 2; i < 1000; i++) {
		ctx.beginPath();
		ctx.arc(i / 1000 * width, height - a / 3000 * height - 2, 2, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
		
		if (gcd(a, i) === 1) a += i + 1;
		else a /= gcd(a, i);
	}
}

function gcd(a, b) {
	if (b > a) [a, b] = [b, a];
	
	var out = 1;
	while (true) {
		if (b === 0) return a;
		a %= b;
		if (a === 0) return b;
		b %= a;
	}
}
