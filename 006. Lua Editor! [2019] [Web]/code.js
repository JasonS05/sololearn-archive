// created by Jason Stone

// auto resizing and "smart quote" and other "smart" character replacements
document.querySelector("#program").addEventListener("input", function() {
	this.style.height = "auto";
	this.style.height = program.scrollHeight + "px";
})

document.querySelector("#format").onclick = function() {
	document.querySelector("#program").value = document.querySelector("#program").value
		.replace(/[\u2014]/g, "--") // double length hyphen -> --
		.replace(/[\u2022]/g, "*") // bullet "•" -> *
		.replace(/[\u2018\u2019]/g, "'") // "smart"/curly single quotes -> '
		.replace(/[\u201C\u201D]/g, '"'); // "smart"/curly double quotes -> "
}

// button
document.querySelector("#run").onclick = function() {
	try {
		document.querySelector("#output").innerHTML = ""; // clear the output
		// append print and io.write definitions to the beginning of the program before running
		fengari.load("require('js') print = function(...) for _, arg in ipairs({...}) do js.global.document:querySelector('#output').innerHTML = js.global.document:querySelector('#output').innerHTML .. tostring(arg) .. ' ' end js.global.document:querySelector('#output').innerHTML = js.global.document:querySelector('#output').innerHTML .. '\\n' end io = {write = function(...) for _, arg in ipairs({...}) do js.global.document:querySelector('#output').innerHTML = js.global.document:querySelector('#output').innerHTML .. tostring(arg) end end}" + program.value)();
	}
	// if there's an error put it in the output
	catch(error) {
		document.querySelector("#output").innerHTML = error;
	}
}
