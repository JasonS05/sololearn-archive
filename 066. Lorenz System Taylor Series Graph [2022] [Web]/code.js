// please forgive my poor variable/function naming, I can never think of good names for math stuff

window.onload = main;
const stepSize = 2 ** -4; // must be a power of two, otherwise floating-point rounding error messes up the recursion conditions

function main() {
	let canvas = document.getElementsByTagName("canvas")[0];
	let ctx = canvas.getContext("2d");
	
	let data = computeCoefficients({x: -5, y: 7, z: 35}, 20);
	draw(ctx, canvas.width, canvas.height, func, data);

    console.log(func(30, [data]));
}

function draw(ctx, width, height, func, ...stuff) {
	ctx.strokeStyle = "black";
	
	for (let i = 0; i <= 1000; i++) {
		if (i == 0)
			ctx.moveTo(0, height/2 - func((i - 500)/100, stuff))
		else
			ctx.lineTo(i/1000 * width, height/2 - func(i/10, stuff).x)
	}

	ctx.stroke();
}

function func(input, [{x, y, z, n}]) {
	if (input < -stepSize) {
        let _ = computeCoefficients(func(input - (input % stepSize || -stepSize), [{x, y, z, n, fact}]), n);
        x = _.x;
        y = _.y;
        z = _.z;
        input = (input % stepSize || -stepSize);
    }
    
    if (input > stepSize) {
        let _ = computeCoefficients(func(input - (input % stepSize || stepSize), [{x, y, z, n, fact}]), n);
        x = _.x;
        y = _.y;
        z = _.z;
        input = input % stepSize || stepSize;
    }
    
    let xOut = 0;
    let yOut = 0;
    let zOut = 0;
	
	for (i = 0; i < n; i++) {
		xOut += input**i * x[i] / fact[i];
		yOut += input**i * y[i] / fact[i];
		zOut += input**i * z[i] / fact[i];
	}
	
	return {x: xOut, y: yOut, z: zOut};
}

var computeCoefficients = (function() {
    let cache = [];

    let f = function(_x, _y, _z, n) {
    	let a = 10;
    	let b = 28;
    	let c = 8/3;
    
    	let x = [_x];
    	let y = [_y];
    	let z = [_z];
    
    	for (i = 1; i < n; i++) {
    		x.push(fx(i, x, y, z, a, b, c, fact));
    		y.push(fy(i, x, y, z, a, b, c, fact));
    		z.push(fz(i, x, y, z, a, b, c, fact));
    	}
    
    	return {x, y, z, n};
    }

    return function({x, y, z}, n) {
        if (!cache[x])
            cache[x] = [];
        
        if (!cache[x][y])
            cache[x][y] = [];
        
        if (cache[x][y][z])
            return cache[x][y][z];

        let value = f(x, y, z, n);
        cache[x][y][z] = value;
        return value;
    };
})();

function fx(n, x, y, z, a, b, c, fact) {
	return a*y[n - 1] - a*x[n - 1];
}

function fy(n, x, y, z, a, b, c, fact) {
	let out = x[n - 1]*b - y[n - 1]
	
	for (let i = 0; i < n; i++) {
		out -= x[n - i - 1] * z[i] * pascal(n - i - 1, i, fact);
	}
	
	return out;
}

function fz(n, x, y, z, a, b, c, fact) {
	let out = -c*z[n - 1];
	
	for (let i = 0; i < n; i++) {
		out += x[n - i - 1] * y[i] * pascal(n - i - 1, i, fact);
	}
	
	return out
}

var fact = (function(n) {
	let fact = [1]

	for (let i = 1; i < 170; i++) {
	    fact.push(fact[i - 1] * i)
	}

	return fact;
})(170);

function pascal(a, b, fact) {
	let k = a + b;
	
	return fact[k]/(fact[a] * fact[k - a])
}

