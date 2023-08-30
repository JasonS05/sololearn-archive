class tailCallReturnValue {
	constructor(func, args) {
		this.func = func;
		this.args = args;
	}
}

function factorial(n) {
	return _factorial(n, 1);
}

function _factorial(n, accumulator) {
	if (n < 2) {
		return accumulator;
	}
	else {
		return _factorial(n - 1, accumulator * n);
	}
}

function tailRecurseFactorial(n) {
	return _tailRecurseFactorial(n, 1);
}


/*
This function is what's known as a trampoline. It calls the tail-recursive function which
instead of directly calling another function at it's tail, it returns that function and it's
arguments. The trampoline then calls the function with the arguments, and the process repeats
in a loop until the recursion ends. So instead of the stack growing until recursion ends, it
bounces off the trampoline over and over until recursion ends keeping the stack at a finite
size even during infinite recursion.
*/
function _tailRecurseFactorial(n, accumulator) {
	let func = function(n, accumulator) {
		if (n < 2) {
			return accumulator;
		}
		else {
			return new tailCallReturnValue(func, [n - 1, accumulator * n]);
		}
	};
	
	let returnValue = func(n, accumulator);
	while (true) {
		if (returnValue instanceof tailCallReturnValue) {
			returnValue = returnValue.func(...returnValue.args);
		}
		else {
			return returnValue;
		}
	}
}

function test(func, n) {
	try {
		return func(n);
	}
	catch(e) {
		return e;
	}
}

alert("Output of calling regular tail recursive factorial with recursion depth 1000000:\n" + test(factorial, 1000000));
alert("Output of calling proper tail recursive factorial with recursion depth 1000000:\n" + test(tailRecurseFactorial, 1000000));
alert("As you can see, the proper tail recursive version doesn't overflow the stack but of course floating point limitations are very quickly reached resulting in an output of \"Infinity\".");
