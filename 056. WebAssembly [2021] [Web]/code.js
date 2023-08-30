window.onload = async function() {
	try {
		// declaration/initialization of module is all the way at the bottom
		const { instance } = await WebAssembly.instantiate(module, { "console": { "log": console.log } });
		document.getElementById("test").textContent = instance.exports.sum1(2, 4)
		instance.exports.sum2(3, 4);
	} catch(e) {
		console.log(`Error: ${e}`);
	}
}

function wasm(...x) {
	let arr = [0, 97, 115, 109, 1, 0, 0, 0];
	
	for (let i = 0; i < x.length; i++) {
		arr = arr.concat(x[i]);
	}
	
	return new Uint8Array(arr);
}

function typeSection(...types) {
	for (let i = 0; i < types.length; i++) {
		types[i] = "func " + vector(...types[i][0]) + " " + vector(...types[i][1]);
	}
	
	return section(1, vector(...types));
}

function importsSection(...imports) {
	for (let i = 0; i < imports.length; i++) {
		imports[i] = "$" + imports[i][0] + " $" + imports[i][1] + " " + typeMap[imports[i][2]] + " " + imports[i][3];
	}
	
	return section(2, vector(...imports));
}

function funcSection(...typeIndexes) {
	return section(3, vector(...typeIndexes));
}

function exportsSection(...exports) {
	for (let i = 0; i < exports.length; i++) {
		exports[i] = "$" + exports[i][0] + " " + typeMap[exports[i][1]] + " " + exports[i][2];
	}
	
	return section(7, vector(...exports));
}

function codeSection(...functions) {
	for (let i = 0; i < functions.length; i++) {
		functions[i] = vector(...functions[i].slice(0, -1)) + " " + functions[i][functions[i].length - 1] + " end";
		functions[i] = assemble(functions[i]).length + " " + functions[i];
	}
	
	return section(10, vector(...functions))
}

function vector(...x) {
	if (!x.length) return "0";
	else return x.length + " " + x.join(" ");
}

function section(sectionNum, str) {
	let bytes = assemble(str);
	return [...LEB128(sectionNum), ...LEB128(bytes.length), ...bytes];
}

function assemble(str) {
	return str.split(" ").reduce((acc, x) => { acc.push(...parse(x)); return acc }, []);
};

function parse(x) {
	if (x[0] === "$") return utf8(x.slice(1));
	else if (keywordMap[x]) return keywordMap[x];
	else return LEB128(Number(x));
}

function LEB128(x) {
	let out = [];
	
	do {
		out.push(x % 128 + 128);
		x = Math.floor(x / 128);
	} while(x)
	
	out[out.length - 1] -= 128;
	
	return out;
}

function utf8(x) {
	let bytes = new TextEncoder("utf-8").encode(x);
	return [...LEB128(bytes.length), ...bytes];
}

const typeMap = {
	"func": 0,
	"table": 1,
	"mem": 2,
	"global": 3
}

const keywordMap = {
	"end": [0x0b],
	"call": [0x10],
	"local.get": [0x20],
	"func": [0x60],
	"i32.add": [0x6a],
	"f64": [0x7c],
	"f32": [0x7d],
	"i64": [0x7e],
	"i32": [0x7f]
};

// module is just a UInt8Array of the bytes in the WASM module. All these functions are just for constructing the UInt8Array
const module = wasm(
	typeSection(
		[["i32", "i32"], ["i32"]], // type 0, takes two i32s and returns an i32
		[["i32"], []], // type 1, takes one i32 and returns nothing
		[["i32", "i32"], []] // type 2, takes two i32s and returns nothing
	),
	importsSection(["console", "log", "func", 1]), // import console.log function from the import object and give it type 1
	funcSection(2, 0), // the first function in the code section has type 2 and the second has type 0
	exportsSection(
		["sum1", "func", 2], // export the second function under the name sum1
		["sum2", "func", 1] // export the first function under the name sum2
	),
	codeSection(
		// Imported functions have lower indexes than regular functions, so 0 is the index of the only imported function.
		// After that, the first function here has index 1 and the next one has index 2, so changing "call 0" to "call 1"
		// will make the function recursive (after adjusting the code to give it the two arguments it needs). The arguments
		// to the function are the first locals, after that are the actual locals, so "local.get 0" gets the first arg.
		// Also, WASM uses a stack machine, so "local.get 0" pushes the first arg to the stack, "local.get 1" pushes the
		// second arg to the stack, "i32.add" pops them and pushes their sum, and "call 0" pops that and calls the function
		// that the index 0 corresponds to with the popped value as the argument (since function 0 takes 1 argument).
		// Furthermore, since there are no more values on the stack once the function ends, there are no values returned.
		// This is reflected in the type of this function. If there were values left on the stack, the function's type would
		// need to be adjusted accordingly to avoid a type error.
		//
		// To declare locals just add them before the code of the function with the number of each type before
		// the type. For example, a function with three i32 locals and one f64 local would look like ["3 i32", "1 f64", "myCodeHere"].
		// Also, the locals go after the arguments. So, if there are two arguments to the function then the third local is
		// accessed with "local.get 3".
		//
		// Also, I've only included support for the few instructions I use and a few custom keywords my code uses internally.
		// To add more functions and keywords add it to the keywordMap variable. To encode more than one byte for a given keyword
		// just put more than one entry into the array, so it might look like "myCustomKeyword": [0x01, 0x02].
		["local.get 0 local.get 1 i32.add call 0"], // the first function
		["local.get 0 local.get 1 i32.add"] // the second function
	)
);

