// brainfuck code goes in the CSS section

window.onload = function() {
	run(document.querySelector("style:not(#style)").innerHTML);
}

function run(bf) {
	bf = bf.replace(/[^\[\]<>\+-\.,]+/g, "");
	checkBrainFuckValidity(bf);
	
	js = "let arr=new Uint8Array(32768).fill(0);let i=0;";
	
	for (char of bf) {
		switch (char) {
		case "[":
			js += "while(arr[i]!==0){";
			break;
		case "]":
			js += "}";
			break;
		case "<":
			js += "i--;";
			break;
		case ">":
			js += "i++;";
			break;
		case "+":
			js += "arr[i]++;";
			break;
		case "-":
			js += "arr[i]--;";
			break;
		case ".":
			js += "document.getElementById(\"out\").textContent+=String.fromCharCode(arr[i]);";
			break;
		case ",":
			js += "throw new Error(\"Error: input not supported\");";
			break;
		}
	}
	
	eval(js);
}

function checkBrainFuckValidity(bf) {
	let loopDepth = 0;
	
	for (char in bf) {
		if (char === "[") loopDepth++;
		if (char === "]") loopDepth--;
		if (loopDepth < 0) throw new Error("too many closing brackets");
	}
	
	if (loopDepth !== 0) throw new Error("unmatched opening bracket");
}

