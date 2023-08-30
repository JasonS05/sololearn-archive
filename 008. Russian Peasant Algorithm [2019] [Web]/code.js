// created by Jason Stone

window.onload = function() {
	alert("This code uses the Russian Peasant Algorithm to multiply two numbers.");
	var num1 = parseInt(prompt("Please enter the first number to be multiplied:"));
	var num2 = parseInt(prompt("Please enter the second number to be multiplied:"));
	const originalNum1 = num1;
	const originalNum2 = num2;
	var body = document.getElementsByTagName("body")[0];
	var nums = [];
	
	function getLen(n) {
		var len = 0;
		while (n > 0) {
			n = Math.floor(n/10);
			len += 1;
		}
		return len;
	}
	
	if (isNaN(num1) || isNaN(num2)) {
		throw Error("invalid input");
	}
	
	if (num1 < 0 || num2 < 0) {
		throw Error("input must be positive");
	}
	
	var len = getLen(num1);
	while (num1 > 0) {
		if (num1%2) nums.push(num2);
		
		body.innerHTML += "<strike>".repeat(1-num1%2)+num1+" ".repeat(len-getLen(num1))+"|"+num2+"</strike>".repeat(1-num1%2)+"<br/>";
		
		num1 = Math.floor(num1 / 2);
		num2 *= 2;
	}
	
	body.innerHTML += "<br/>"+originalNum1+" multiplied by "+originalNum2+" is the sum of "+nums.join(", ")+" is "+nums.reduce((a, b) => a + b, 0);
	body.innerHTML += "<br/>"+originalNum1+" multipled by "+originalNum2+" using normal multiplication is "+originalNum1*originalNum2;
}
