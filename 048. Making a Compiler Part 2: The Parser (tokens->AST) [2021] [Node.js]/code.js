// code covered in previous parts of the Making a Compiler series ends at line 128
// also some new code has been added to main()

function main() {
	const program = `
	3 + 5*sin(8) ==2
	10< 8
	
	100.23
	
	100_000.234
	`;
	const tokens = tokenizer(program);
	const AST = parser(tokens);
	console.log(require("util").inspect(AST, {depth: 1/0 /* INFINITE DEPTH!!!! */}));
}

/****************\
START OF TOKENIZER
\****************/

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
const SPECIAL_CHARS = ["(", ")"];
const IDENTIFIER_CHARS = [
	"_",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];
const NUM_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
const OPERATOR_CHARS = ["+", "-", "*", "/", "=", "!", "<", ">"];

const OPERATORS = ["+", "-", "*", "/", "=", "==", "!=", "<", "<=", ">", ">=", "!", "-", "||", "&&"];
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
			else if (!OPERATORS.includes(currentToken.contents)) throw new Error(`Syntax Error: Invalid operator "${currentToken.contents}"`);
			else {
				tokens.push(currentToken);
				currentToken = newToken(c);
			}
			
			break;
		case NUM_WITH_DECIMAL_T:
			if (DIGITS.includes(c)) currentToken.contents += c;
			else if (c === ".") throw new Error("Syntax Error: Number cannot have more than one decimal point");
			else if (IDENTIFIER_CHARS.includes(c)) throw new Error("Syntax Error: Identifier cannot begin with a number");
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
			else if (IDENTIFIER_CHARS.includes(c)) throw new Error("Syntax Error: Identifier cannot begin with a number");
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
		default: throw new Error(`Syntax error: Unexpected char "${c}" encontered`);
	}
}

/**************\
END OF TOKENIZER
\**************/

/*************\
START OF PARSER
\*************/

const getPrecedence = {
	"=": 0,
	"||": 1,
	"&&": 2,
	"<": 3,
	">": 3,
	"<=": 3,
	">=": 3,
	"!=": 3,
	"==": 3,
	"+": 4,
	"-": 4,
	"*": 5,
	"/": 5
};

const BINARY_OPERATORS = [
	"=",
	"||",
	"&&",
	"<",
	">",
	"<=",
	">=",
	"!=",
	"==",
	"+",
	"-",
	"*",
	"/"
];

const UNARY_OPERATORS = [
	"!",
	"-"
];

/*

A BLOCK is a sequence of statements. Every program is a BLOCK, but not all BLOCKs are programs.



BLOCK ::= STATEMENT | BLOCK + STATEMENT

STATEMENT ::= STATEMENT_TERMINATOR | EXPRESSION + STATEMENT_TERMINATOR

EXPRESSION ::= VALUE | UNARY_OPERATOR + EXPRESSION | EXPRESSION + BINARY_OPERATOR + EXPRESSION | EXPRESSION + PARENTHESES

VALUE ::= NUMBER | IDENTIFIER | PARENTHESES

*/

const BLOCK = ["BLOCK"];
const NUMBER = ["NUMBER"];
const IDENTIFIER = ["IDENTIFIER"];
const BINARY_OPERATOR = ["BINARY_OPERATOR"];
const UNARY_OPERATOR = ["UNARY_OPERATOR"];
const OPEN_PAREN = ["OPEN_PAREN"]; // open paren is just an intermediate state during construction of the AST. Persistence of an open paren is a compilation error as it indicates a lack of a matching closing parenthesis
const CLOSED_PAREN = ["CLOSED_PAREN"];

const VALUE_TYPES = [
	NUMBER,
	IDENTIFIER,
	CLOSED_PAREN
];

class ASTNode {
	constructor(type, token) {
		this.type = type || null;
		this.token = token || null;
		this.parent = null;
		this.children = [];
	}
	addChild(child) {
		this.children.push(child);
		child.parent = this;
		return child;
	}
	removeChild(indexOfChild) {
		let child = this.children.splice(indexOfChild, 1)[0];
		child.parent = null;
		return child;
	}
}

function parser(tokens) {
	let currentASTNode = new ASTNode(BLOCK);
	
	for (const token of tokens) {
		switch (token.type) {
		case STATEMENT_TERMINATOR_T:
			while (currentASTNode.type !== BLOCK) {
				if (currentASTNode.type === OPEN_PAREN) throw new Error("Syntax Error: Unmatched opening parenthesis");
				
				currentASTNode = currentASTNode.parent;
			}
			
			break;
		case SPECIAL_T:
			if (token.contents === "(") {
				if (currentASTNode.type === BLOCK || VALUE_TYPES.includes(currentASTNode.type) && currentASTNode.type !== NUMBER)
					currentASTNode = currentASTNode.addChild(new ASTNode(OPEN_PAREN));
			} else if (token.contents === ")") {
				while (currentASTNode.type !== OPEN_PAREN) {
					if (currentASTNode.type === BLOCK) throw new Error("Syntax Error: Unmatched closing parenthesis");
					
					currentASTNode = currentASTNode.parent;
				}
				
				currentASTNode.type = CLOSED_PAREN;
			} else throw new Error(`Internal Error: Invalid token of type SPECIAL_T: "${token.contents}"`);
			
			break;
		case IDENTIFIER_T:
		case NUM_WITH_DECIMAL_T:
		case NUM_WITHOUT_DECIMAL_T:
			if (!VALUE_TYPES.includes(currentASTNode.type))
				currentASTNode = currentASTNode.addChild(new ASTNode(token.type === IDENTIFIER_T? IDENTIFIER : NUMBER, token));
			else throw new Error(`Syntax Error: Unexpected ${token.type === IDENTIFIER_T? "IDENTIFIER" : "NUMBER"} after a(n) ${currentASTNode.type[0]}`);
			
			break;
		case OPERATOR_T:
			if (!VALUE_TYPES.includes(currentASTNode.type)) {
				if (UNARY_OPERATORS.includes(token.contents))
					currentASTNode = currentASTNode.addChild(new ASTNode(UNARY_OPERATOR, token));
				else throw new Error(`Syntax Error: "${token.contents}" is not an unary operator`);
			} else if (BINARY_OPERATORS.includes(token.contents)) {
				let child = currentASTNode;
				
				while (child.parent.type === BINARY_OPERATOR && getPrecedence[child.parent.token.contents] >= getPrecedence[token.contents] || VALUE_TYPES.includes(child.parent.type)) {
					child = child.parent;
				}
				
				let parent = child.parent;
				parent.removeChild(parent.children.indexOf(child));
				currentASTNode = new ASTNode(BINARY_OPERATOR, token);
				parent.addChild(currentASTNode);
				currentASTNode.addChild(child);
			} else throw new Error(`Syntax Error: "${token.contents}" is not a binary operator`);
			
			break;
		}
	}
	
	return currentASTNode;
}

/***********\
END OF PARSER
\***********/

main();

