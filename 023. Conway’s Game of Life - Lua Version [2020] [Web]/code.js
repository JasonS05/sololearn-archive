function getTime() {
	return new Date().getTime(); // dunno how to say "new Date()" in Lua so I'm making a JS function for it
}

//</script><script type="application/lua">

-- /* I'm commenting out this whole code with a JS comment so the JS syntax highlighting doesn't attempt to highlight the Lua

require("js")

local window = js.global
local document, getTime = window.document, window.getTime

local canvas, width, height, ctx, cells
local pixelsPerCell, targetFPS = 10, 60

local WrapAroundArray = {
	new = function(self)
		local instance = {}
		setmetatable(instance, self.meta)
		return instance
	end,
	meta = {
		-- __index is called when an index in the array that does not exist is accessed
		__index = function(self, index)
			if index == 0 then
				return self[#self] -- # is the length operator
			else
				return self[1] -- array indices are standardly in the range (1, #table), not (0, #table - 1)
			end
		end
	}
}

window.onload = function()
	canvas = document:querySelector("#canvas")
	width = math.floor(canvas.width / pixelsPerCell)
	height = math.floor(canvas.height / pixelsPerCell)
	ctx = canvas:getContext("2d")
	
	cells = WrapAroundArray:new()
	for x = 1, width do
		cells[x] = WrapAroundArray:new()
		for y = 1, height do
			if x > (width / 3) and x < (2 * width / 3) and y > (height / 3) and y < (2 * height / 3) then
				cells[x][y] = {isAlive = math.random(0, 1), isActive = 1}
			else
				cells[x][y] = {isAlive = 0, isActive = 1}
			end
		end
	end
	
	main()
end

function main()
	local lastCalled = getTime()
	
	draw()
	calculateNextGen()
	
	window:setTimeout(main, 1000/targetFPS + lastCalled - getTime())
end

function draw()
	ctx.fillStyle = "#000"
	ctx:fillRect(0, 0, canvas.width, canvas.height)
	
	ctx.fillStyle = "#0f0"
	for x = 1, width do
		for y = 1, height do
			if cells[x][y].isAlive == 1 then
				ctx:fillRect((x - 1) * pixelsPerCell, (y - 1) * pixelsPerCell, pixelsPerCell, pixelsPerCell)
			end
		end
	end
end

function calculateNextGen()
	local newCells, neighbors = WrapAroundArray:new(), 0
	for x = 1, width do
		newCells[x] = WrapAroundArray:new()
		for y = 1, height do
			if cells[x][y].isActive == 1 then
				neighbors = 0
				
				neighbors = neighbors + cells[x - 1][y - 1].isAlive
				neighbors = neighbors + cells[x - 1][y + 0].isAlive
				neighbors = neighbors + cells[x - 1][y + 1].isAlive
				neighbors = neighbors + cells[x + 0][y - 1].isAlive
				neighbors = neighbors + cells[x + 0][y + 1].isAlive
				neighbors = neighbors + cells[x + 1][y - 1].isAlive
				neighbors = neighbors + cells[x + 1][y + 0].isAlive
				neighbors = neighbors + cells[x + 1][y + 1].isAlive
				
				if neighbors == 3 then
					newCells[x][y] = {isAlive = 1, isActive = 1}
				elseif neighbors == 2 then
					newCells[x][y] = {isAlive = cells[x][y].isAlive, isActive = 1}
				else
					newCells[x][y] = {isAlive = 0, isActive = 1}
				end
				
				if newCells[x][y].isAlive == cells[x][y].isAlive then
					newCells[x][y].isActive = 0
				end
			else
				newCells[x][y] = {isAlive = cells[x][y].isAlive, isActive = 0}
			end
		end
	end
	
	for x = 1, width do
		for y = 1, height do
			cells[x][y].isAlive = newCells[x][y].isAlive;
			cells[x][y].isActive = newCells[x][y].isActive;
		end
	end
	
	for x = 1, width do
		for y = 1, height do
			if cells[x][y].isActive == 1 then
				-- set cells next to active cells to active because they could change in the next generation
				newCells[x - 1][y - 1].isActive = 1
				newCells[x - 1][y + 0].isActive = 1
				newCells[x - 1][y + 1].isActive = 1
				newCells[x + 0][y - 1].isActive = 1
				newCells[x + 0][y + 1].isActive = 1
				newCells[x + 1][y - 1].isActive = 1
				newCells[x + 1][y + 0].isActive = 1
				newCells[x + 1][y + 1].isActive = 1
			end
		end
	end
	
	cells = newCells
end
