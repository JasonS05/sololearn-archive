class Cons {
	constructor(car, cdr) {
		this.car = car;
		this.cdr = cdr;
	}
}

class Lambda {
	constructor(scope, args, functionBody) {
		this.scope = {...scope};
		
		this.func = (function(self) {
			return function(argsList, scope) {
				let newStackFrame = {...self.scope};
				let argsOriginal = args;
				while (args instanceof Cons) {
					newStackFrame[args.car] = trampoline(evaluate(argsList.car, {...scope}));
					args = args.cdr;
					argsList = argsList.cdr;
				}
				args = argsOriginal;
				return new TailCall(evaluate, [functionBody, newStackFrame]);
			}
		})(this);
	}
}

class TailCall {
	constructor(func, args) {
		this.func = func;
		this.args = args;
	}
}

function trampoline(returnVal) {
	while (returnVal instanceof TailCall) {
		returnVal = returnVal.func(...returnVal.args);
	}
	
	return returnVal;
}

window.onload = function() { // the backslashes get in the way of sololearn's auto-tabbing so that the spaces stay spaces
	document.getElementById("code").textContent = `\
(function (factorial num)
  (named-let loop ((a num) (accumulator 1))
  \  (if (< a 2)
  \  \  accumulator
  \  \  (loop (- a 1) (* accumulator a)))))

(print (factorial 5))`;
}

function run() {
	let code = document.getElementById("code").textContent;
	
	try {
		let list = parse(code, 0);
		
		while (list instanceof Cons) {
			trampoline(evaluate(list.car, defaultScope));
			list = list.cdr;
		}
	}
	catch(e) {
		alert(e);
	}
}

function parse(code, pos) {
	if (code[pos] === undefined) {
		return null;
	}
	
	while ((code[pos] === " ") || (code[pos] === "\n") || (code[pos] === "\t")) {
		++pos;
	}
	
	let car;
	let cdr;
	
	if (code[pos] === "(") {
		car = parse(code, 1 + pos);
		let parenDepth = 1;
		
		while (parenDepth) {
			++pos;
			if (code[pos] === "(") {
				++parenDepth;
			}
			else if (code[pos] === ")") {
				--parenDepth;
			}
			else if (code[pos] === undefined) {
				throw new Error("unexpected EOF at pos " + pos);
			}
		}
		
		cdr = parse(code, 1 + pos);
	}
	else if (code[pos] === ")") {
		return null;
	}
	else {
		car = "";
		
		while ((code[pos] !== " ") && (code[pos] !== "\n") && (code[pos] !== "\t") && (code[pos] !== ")")) {
			car += code[pos];
			++pos;
			
			if (code[pos] === undefined) {
				throw new Error("unexpected EOF at pos " + pos);
			}
		}
		
		cdr = parse(code, pos);
	}
	
	return new Cons(car, cdr);
}

function print(list) {
	if (list instanceof Cons) {
		let out = "(";
		while (true) {
			out += print(list.car) + (list.cdr? " " : "");
			list = list.cdr;
			
			if (list === null) {
				out += ")";
				return out;
			}
			else if (!(list instanceof Cons)) {
				throw new Error("list terminated by something other than null of type " + typeof list);
			}
		}
	}
	else if (typeof list === "string") {
		return list;
	}
	else if (list === null) {
		return "()";
	}
	else {
		throw new Error("program contains something that isn't a cons, string, or null, and is of type " + typeof list);
	}
}

function evaluate(list, scope) {
	if (!(list instanceof Cons)) {
		if (!isNaN(Number(list))) {
			return Number(list);
		}
		else {
			return scope[list];
		}
	}
	else if (typeof scope[list.car] !== "function") {
		throw new Error(print(list.car) + " is not a function");
	}
	else {
		return new TailCall(scope[list.car], [list.cdr, scope]);
	}
}

let defaultScope = {
	"lambda": function(list, scope) {
		return new Lambda(scope, list.car, list.cdr.car);
	},
	"function": function(list, scope) {
		let lambda = defaultScope.lambda(new Cons(list.car.cdr, list.cdr), scope);
		
		scope[list.car.car] = lambda.func;
		lambda.scope[list.car.car] = lambda.func;
	},
	"named-let": function(list, scope) {
		let variableBindings = list.cdr.car;
		
		if (variableBindings.car === null) {
			let lambda = defaultScope.lambda(new Cons(null, list.cdr.cdr), scope);
			lambda.scope[list.car] = lambda.func;
			return new TailCall(lambda.func, [null]);
		}
		else {
			let argNames = new Cons(variableBindings.car.car, null);
			let argValues = new Cons(variableBindings.car.cdr.car, null);
			variableBindings = variableBindings.cdr;
			
			let argNames2 = argNames;
			let argValues2 = argValues;
			
			while (variableBindings instanceof Cons) {
				argNames = argNames.cdr = new Cons(variableBindings.car.car, null);
				argValues = argValues.cdr = new Cons(variableBindings.car.cdr.car, null);
				variableBindings = variableBindings.cdr;
			}
			
			let lambda = defaultScope.lambda(new Cons(argNames2, list.cdr.cdr), scope);
			lambda.scope[list.car] = lambda.func;
			return new TailCall(lambda.func, [argValues2, scope]);
		}
	},
	"if": function(list, scope) {
		let condition = trampoline(evaluate(list.car, scope));
		
		if (condition) {
			return new TailCall(evaluate, [list.cdr.car, scope]);
		}
		else {
			return new TailCall(evaluate, [list.cdr.cdr.car, scope]);
		}
	},
	"print": function(list, scope) {
		alert(trampoline(evaluate(list.car, scope)));
	},
	"<": function(list, scope) {
		let arg1 = trampoline(evaluate(list.car, scope));
		let arg2 = trampoline(evaluate(list.cdr.car, scope));
		
		return arg1 < arg2;
	},
	"-": function(list, scope) {
		let arg1 = trampoline(evaluate(list.car, scope));
		let arg2 = trampoline(evaluate(list.cdr.car, scope));
		
		return arg1 - arg2;
	},
	"*": function(list, scope) {
		let arg1 = trampoline(evaluate(list.car, scope));
		let arg2 = trampoline(evaluate(list.cdr.car, scope));
		
		return arg1 * arg2;
	}
};

