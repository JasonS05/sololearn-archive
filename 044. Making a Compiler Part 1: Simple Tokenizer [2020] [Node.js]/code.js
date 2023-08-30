function main() {
	const program = `
	3 + 5*sin(8) ==2
	10< 8
	
	100.23
	
	100_000.234
	`;
	const tokens = tokenizer(program);
	console.log(tokens);
}

// the suffix _T denotes token
// the strings are wrapped in arrays to make them unique
const STATEMENT_TERMINATOR_T = ["STATEMENT_TERMINATOR"];
const SPECIAL_T = ["SPECIAL"];
const IDENTIFIER_T = ["IDENTIFIER"];
const OPERATOR_T = ["OPERATOR"];
const NUM_WITH_DECIMAL_T = ["NUM_WITH_DECIMAL"];
const NUM_WITHOUT_DECIMAL_T = ["NUM_WITHOUT_DECIMAL"];

const WHITESPACE = [" ", "\t"];
const STATEMENT_TERMINATORS = ["\n", ";"];
const SPECIAL_CHARS = ["(", ")", ","];
const IDENTIFIER_CHARS = [
	"_",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];
const NUM_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
const OPERATOR_CHARS = ["+", "-", "*", "/", "=", "!", "<", ">"];

const OPERATORS = ["+", "-", "*", "/", "=", "==", "!=", "<", "<=", ">", ">="];
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

class Token {
	constructor(type, contents) {
		this.type = type || null;
		this.contents = contents || "";
	}
}

function tokenizer(program) {
	let tokens = [];
	let currentToken = new Token();

	for (const c of program) {
		switch (currentToken.type) {
		case null:
			currentToken = newToken(c);
			break;
		case STATEMENT_TERMINATOR_T:
			if (tokens[tokens.length-1]?.type !== STATEMENT_TERMINATOR_T) tokens.push(currentToken);
			currentToken = newToken(c);
			break;
		case SPECIAL_T:
			tokens.push(currentToken);
			currentToken = newToken(c);
			break;
		case IDENTIFIER_T:
			if (IDENTIFIER_CHARS.includes(c) || DIGITS.includes(c)) currentToken.contents += c;
			else {
				tokens.push(currentToken);
				currentToken = newToken(c);
			}
			break;
		case OPERATOR_T:
			if (OPERATOR_CHARS.includes(c)) currentToken.contents += c;
			else if (!OPERATORS.includes(currentToken.contents)) throw new Error(`Invalid operator ${currentToken.contents}`);
			else {
				tokens.push(currentToken);
				currentToken = newToken(c);
			}
			break;
		case NUM_WITH_DECIMAL_T:
			if (DIGITS.includes(c)) currentToken.contents += c;
			else if (c === ".") throw new Error("Number cannot have more than one decimal point");
			else if (IDENTIFIER_CHARS.includes(c)) throw new Error("Identifier cannot begin with a number");
			else {
				tokens.push(currentToken);
				currentToken = newToken(c);
			}
			break;
		case NUM_WITHOUT_DECIMAL_T:
			if (DIGITS.includes(c)) currentToken.contents += c;
			else if (c === "_");
			else if (c === ".") {
				currentToken.type = NUM_WITH_DECIMAL_T;
				currentToken.contents += c;
			}
			else if (IDENTIFIER_CHARS.includes(c)) throw new Error("Identifier cannot begin with a number");
			else {
				tokens.push(currentToken);
				currentToken = newToken(c);
			}
			break;
		}
	}

	return tokens;
}

function newToken(c) {
	switch (true) {
		case WHITESPACE.includes(c): return new Token();
		case STATEMENT_TERMINATORS.includes(c): return new Token(STATEMENT_TERMINATOR_T);
		case SPECIAL_CHARS.includes(c): return new Token(SPECIAL_T, c);
		case IDENTIFIER_CHARS.includes(c): return new Token(IDENTIFIER_T, c);
		case OPERATOR_CHARS.includes(c): return new Token(OPERATOR_T, c);
		case NUM_CHARS.includes(c):
			if (c === ".") return new Token(NUM_WITH_DECIMAL_T, c);
			else return new Token(NUM_WITHOUT_DECIMAL_T, c);
		default: throw new Error(`Syntax error: unexpected char ${c} encontered`);
	}
}

main();

