// created by Jason Stone

window.onload = function () {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const imageData = ctx.createImageData(canvas.width, canvas.height);
	var primes = new Array(imageData.data.length/4).fill(true);
	primes[1] = false;
	var x = 0;
	var y = 0;
	
	for (let i = 0; i < imageData.data.length/4; i++) {
		let pixelX = x + canvas.width/2;
		let pixelY = y + canvas.height/2;
		let dataLocation = pixelX + canvas.height * pixelY;
		
		if (primes[i + 1] && i !== 0) {
			for (let multiple = 2 * i + 2; multiple < primes.length; multiple += i + 1) {
				primes[multiple] = false;
			}
		}
		
		if (primes[i + 1]) {
			imageData.data[dataLocation * 4 + 0] = 0;
			imageData.data[dataLocation * 4 + 1] = 0;
			imageData.data[dataLocation * 4 + 2] = 0;
			imageData.data[dataLocation * 4 + 3] = 255;
		}
		else {
			imageData.data[dataLocation * 4 + 0] = 255;
			imageData.data[dataLocation * 4 + 1] = 255;
			imageData.data[dataLocation * 4 + 2] = 255;
			imageData.data[dataLocation * 4 + 3] = 255;
		}
		
		let direction = Math.floor(2 * Math.sqrt(i + 1/4) - 1) % 4;
		if (direction === 0) {
			x++;
		}
		else if (direction === 1) {
			y--;
		}
		else if (direction === 2) {
			x--;
		}
		else {
			y++;
		}
	}
	ctx.putImageData(imageData, 0, 0);
};
