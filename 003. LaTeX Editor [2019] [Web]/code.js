// created by Jason Stone

function updateEquation() {
	var LaTeX = document.getElementById("LaTeX");
	var result = document.getElementById("result");
	result.innerHTML = `LaTeX Output:<hr>$$${LaTeX.value}$$`;
	MathJax.Hub.Queue(["Typeset", MathJax.Hub, result]);
	
	LaTeX.style.height = "auto";
	LaTeX.style.height = `${LaTeX.scrollHeight}px`
}

window.onload = function() {
	updateEquation();
	document.getElementById("LaTeX").addEventListener("input", updateEquation);
}
