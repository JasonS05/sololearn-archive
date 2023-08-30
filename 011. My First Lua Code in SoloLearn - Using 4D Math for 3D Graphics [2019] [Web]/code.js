//</script><script type="application/lua">

--// created by Jason Stone

--// a double hyphen is a comment in Lua
--// I am using the slashes so the javascript coloring shows this as a comment
--// normally slashes are not used as a comment in Lua
-- it still works without the slashes
--[[/*
	this is a multine comment
	the comment at the very top (with the <script> tags) switches it from JavaScript mode to Lua mode
	I am using Lua because Lua is awesome and I really want those metatables for defining behavior when an object is used with arithmetic operators
	if you wanna use Lua in your web codes just include the script link I have in my HTML tab in your HTML tab and put the comment at the top of this JS tab at the top of your JS tab. I do not gaurantee that this will work anywhere other than the SoloLearn code playground
	unlike in JavaScript you cannot define a function later in the code than when it's used so that restricts the structure somewhat
*/]]

require "js" --// import js so I can access JavaScript stuff
local window = js.global --// local is Lua's version of var. It does still work without it, but it becomes global and that is usually unwanted because if another Lua script runs this script it'll also go in the global for the other Lua script since globals ignore the usual lexical scoping. Also, Lua does not need any separation between statements. Newlines and semicolons are entirely unnecessary. In cases when it may be interpreted in more than one way you should use a semicolon for separation as newlines are entirely ignored
local document = window.document
local canvas, width, height, ctx
local points = {};

--// since tables are the only data structure classes have to be set up manually instead of having special class syntax
--// I have to declare Quaternion before it's defined so it's in the scope when it's defined
local Quaternion
Quaternion = {
	--// defines addition, multiplication, and exponentiation operations for quaternions
	meta = {
		__add = function(q1, q2) --{}
			if getmetatable(q1) ~= Quaternion.meta or getmetatable(q2) ~= Quaternion.meta then --// here I use the metatable as the class identifier
				error("attempt to add a quaternion and a non-quaternion", 2) --// the second argument tells it where to send the error. 2 means to send it to the line calling the function so it directs you there instead of here, as directing you here doesn't tell you anything meaningful
			end
			
			return Quaternion.new(q1.r + q2.r, q1.i + q2.i, q1.j + q2.j, q1.k + q2.k)
		end,
		
		__mul = function(q1, q2) --{}
			if getmetatable(q1) ~= Quaternion.meta or getmetatable(q2) ~= Quaternion.meta then
				error("attempt to multiply a quaternion and a non-quaternion", 2)
			end
			
			local r = q1.r * q2.r - q1.i * q2.i - q1.j * q2.j - q1.k * q2.k
			local i = q1.r * q2.i + q1.i * q2.r + q1.j * q2.k - q1.k * q2.j
			local j = q1.r * q2.j - q1.i * q2.k + q1.j * q2.r + q1.k * q2.i
			local k = q1.r * q2.k + q1.i * q2.j - q1.j * q2.i + q1.k * q2.r
			
			return Quaternion.new(r, i, j, k)
		end,
		
		__pow = function(q, n) --{}
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
	
	new = function(r, i, j, k) --{} // I'm going to be putting --{} after every function to satisfy the javascript coloring
		local instance = {
			r = r,
			i = i,
			j = j,
			k = k
		}
		
		--// metatables define behavior for arithmetic operations and a few other things
		setmetatable(instance, Quaternion.meta)
		return instance
	end
}

local Point
Point = {
	new = function(x, y, z, radius) --{}
		local instance = {
			position = Quaternion.new(0, x, y, z),
			radius = radius,
			
			rotate = function(self, rotation) --{}
				self.position = rotation * self.position * rotation ^ -1
			end,
			
			show = function(self) --{}
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

window.onload = function() --{}
	canvas = document:querySelector("#canvas")
	width, height = canvas.width, canvas.height
	ctx = canvas:getContext("2d")
	
	ctx.fillStyle = "#000"
	ctx:fillRect(0, 0, width, height)
	
	for i = 1, 200 do --// Lua loops and table indexes standardly begin with 1 and all Lua standard libs follow this convention
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
	
	for _, point in ipairs(points) do --// when you need a dummy variable in Lua underscores are usually used
		point:show()
	end
	
	local x, y
	
	document:querySelector("#canvas"):addEventListener("touchstart", function(self, event) --{}
		event:preventDefault()
		x = event.changedTouches[0].pageX
		y = event.changedTouches[0].pageY
	end)
	
	document:querySelector("#canvas"):addEventListener("touchmove", function(self, event) --{}
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
