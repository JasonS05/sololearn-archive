/*require("js")
local window = js.global
local document = window.document
local canvas, width, height, ctx
local points = {};

local Quaternion
Quaternion = {
	meta = {
		__add = function(q1, q2)
			if getmetatable(q1) ~= Quaternion.meta or getmetatable(q2) ~= Quaternion.meta then
				error("attempt to add a quaternion and a non-quaternion", 2)
			end
			
			return Quaternion.new(q1.r + q2.r, q1.i + q2.i, q1.j + q2.j, q1.k + q2.k)
		end,
		
		__mul = function(q1, q2)
			if getmetatable(q1) ~= Quaternion.meta or getmetatable(q2) ~= Quaternion.meta then
				error("attempt to multiply a quaternion and a non-quaternion", 2)
			end
			
			local r = q1.r * q2.r - q1.i * q2.i - q1.j * q2.j - q1.k * q2.k
			local i = q1.r * q2.i + q1.i * q2.r + q1.j * q2.k - q1.k * q2.j
			local j = q1.r * q2.j - q1.i * q2.k + q1.j * q2.r + q1.k * q2.i
			local k = q1.r * q2.k + q1.i * q2.j - q1.j * q2.i + q1.k * q2.r
			
			return Quaternion.new(r, i, j, k)
		end,
		
		__pow = function(q, n)
			if type(n) ~= "number" then
				error("attempt to raise a quaternion to a non-numerical value '" .. n .. "' of type " .. type(n), 2)
			end
			
			local angle = 2 * math.acos(q.r)
			local x = q.i / math.sin(angle / 2)
			local y = q.j / math.sin(angle / 2)
			local z = q.k / math.sin(angle / 2)
			
			angle = angle * n
			
			local r = math.cos(angle / 2)
			local i = x * math.sin(angle / 2)
			local j = y * math.sin(angle / 2)
			local k = z * math.sin(angle / 2)
			
			return Quaternion.new(r, i, j, k)
		end
	},
	
	new = function(r, i, j, k)
		local instance = {
			r = r,
			i = i,
			j = j,
			k = k
		}
		
		setmetatable(instance, Quaternion.meta)
		return instance
	end
}

local Point
Point = {
	new = function(x, y, z, radius)
		local instance = {
			position = Quaternion.new(0, x, y, z),
			radius = radius,
			
			rotate = function(self, rotation) --{}
				self.position = rotation * self.position * rotation ^ -1
			end,
			
			show = function(self)
				local x = self.position.i / (self.position.k + 5) * 1000
				local y = self.position.j / (self.position.k + 5) * 1000
				local dist = math.sqrt(self.position.i ^ 2 + self.position.j ^ 2 + (self.position.k + 5) ^ 2)
				local size = self.radius / dist
				
				ctx:beginPath()
				ctx:arc(width / 2 + x, height / 2 + y, size, 0, math.pi * 2)
				ctx:fill()
				ctx:closePath()
			end
		}
		
		return instance
	end
}

window.onload = function()
	canvas = document:querySelector("#canvas")
	width, height = canvas.width, canvas.height
	ctx = canvas:getContext("2d")
	
	ctx.fillStyle = "#000"
	ctx:fillRect(0, 0, width, height)
	
	for i = 1, 200 do
		local x, y, z
		
		repeat
			x = math.random() * 2 - 1
			y = math.random() * 2 - 1
			z = math.random() * 2 - 1
		until x ^ 2 + y ^ 2 + z ^ 2 < 1
		
		local scaleFactor = math.sqrt(x ^ 2 + y ^ 2 + z ^ 2)
		x = x / scaleFactor
		y = y / scaleFactor
		z = z / scaleFactor
		
		points[i] = Point.new(x, y, z, 10)
	end
	
	ctx.fillStyle = "#fff"
	
	for _, point in ipairs(points) do
		point:show()
	end
	
	local x, y
	
	document:querySelector("#canvas"):addEventListener("touchstart", function(self, event)
		event:preventDefault()
		x = event.changedTouches[0].pageX
		y = event.changedTouches[0].pageY
	end)
	
	document:querySelector("#canvas"):addEventListener("touchmove", function(self, event)
		local dx = event.changedTouches[0].pageX - x
		local dy = event.changedTouches[0].pageY - y
		x = event.changedTouches[0].pageX
		y = event.changedTouches[0].pageY
		
		ctx.fillStyle = "#000"
		ctx:fillRect(0, 0, width, height)
		ctx.fillStyle = "#fff"
		for _, point in ipairs(points) do
			local angle = math.sqrt(dx ^ 2 + dy ^ 2) / 1000
			
			local r = math.cos(angle / 2)
			local i = math.sin(angle / 2) * dy
			local j = math.sin(angle / 2) * -dx
			local k = 0
			
			local scaleFactor = math.sqrt(r ^ 2 + i ^ 2 + j ^ 2 + k ^ 2)
			
			r = r / scaleFactor
			i = i / scaleFactor
			j = j / scaleFactor
			k = k / scaleFactor
			
			point:rotate(Quaternion.new(r, i, j, k))
			point:show()
		end
	end)
end
*/

// created by Jason Stone

var program;
let luaSetup = `require('js') print = function(...)for _, arg in ipairs({...}) do js.global.document:querySelector('#output').innerHTML = js.global.document:querySelector('#output').innerHTML .. tostring(arg) .. ' ' end js.global.document:querySelector('#output').innerHTML = js.global.document:querySelector('#output').innerHTML .. '\\n' end io = { write = function(...) for _, arg in ipairs({...}) do js.global.document:querySelector('#output').innerHTML = js.global.document:querySelector('#output').innerHTML .. tostring(arg) end end}`;

let syntaxHighlights = {
	strings: {
		color: "9c9",
		regex: /("[^"]*")|('[^']*')/g
	},
	keywords: {
		color: "dad",
		regex: /(\W|^)(and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)(\W|$)/g
	},
	functionNames: {
		color: "fff",
		regex: /(function<\/span>\s*)([_|A-z]\w*)/g
	},
	functionArgs: {
		color: "ddf",
		regex: /(function<\/span>[^\(]*\()([^\)]*)/g
	},
	numbers: {
		color: "f95",
		regex: /([^\w\.]|^)(\d+\.?\d*)([^\w\.]|$)/g
	}
};


window.onload = function() {
	program = document.querySelector("#program");
	program.addEventListener("input", autoResize);
	fixSpecialChars();
	autoResize();
	highlightSyntax();
};

function autoResize() {
	program.style.height = "100px";
	program.style.height = program.scrollHeight + "px";
}

// "smart quote" and other "smart" character replacements
function fixSpecialChars() {
	program.innerHTML = program.innerHTML
		.replace(/[\u2014]/g, "--") // em-dash -> --
		.replace(/[\u2022]/g, "*") // bullet "•" -> *
		.replace(/[\u2018\u2019]/g, "'") // "smart"/curly single quotes -> '
		.replace(/[\u201C\u201D]/g, '"') // "smart"/curly double quotes -> "
		.replace(/\t/g, "  "); // tab -> "  "
}

function highlightSyntax() {
	program.innerHTML = color(uncolor(program.innerHTML));
}

function color(text) {
	text = text.replace(syntaxHighlights.strings.regex, `<span style="color:#${syntaxHighlights.strings.color}">$1$2</span>`);
	text = text.replace(syntaxHighlights.keywords.regex, `$1<span style="color:#${syntaxHighlights.keywords.color}">$2</span>$3`);
	text = text.replace(syntaxHighlights.functionNames.regex, `$1<span style="color:#${syntaxHighlights.functionNames.color}">$2</span>`);
	text = text.replace(syntaxHighlights.functionArgs.regex, `$1<span style="color:#${syntaxHighlights.functionArgs.color}">$2</span>`);
	text = text.replace(syntaxHighlights.numbers.regex, `$1<span style="color:#${syntaxHighlights.numbers.color}">$2</span>$3`);
	
	return `<span style="color:#eed">${text}</span>`;
}

function uncolor(text) {
	return text
		.replace(/<\/?(span|font|br)[^>]*>/g, "")
		.replace(/&lt;/g, "<");
}

function runTheLua() {
	try {
		document.querySelector("#output").innerHTML = "";
		// append print and io.write definitions to the beginning of the program before running
		fengari.load(/*luaSetup + */uncolor(program.innerHTML))();
	}
	catch(error) {
		document.querySelector("#output").innerHTML = error;
	}
}
