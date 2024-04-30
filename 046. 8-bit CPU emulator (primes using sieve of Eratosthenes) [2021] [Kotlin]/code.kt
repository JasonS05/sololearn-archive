/*

I am currently building this computer in minecraft. I figured that since it'll take a bit to finish I might as well make it in code first.

This computer is what is known as an accumulator machine. It has other registers (instruction pointer, flags, instruction register, memory address register, and temporary register), not all of which are explicitly simulated by this emulator, but the only register used for computation is the accumulator, so all instructions implicitly act on that register.

All instructions have either one or zero operands. If it has an operand, then it takes two bytes, the first being the opcode and the second the operand. If it doesn't have an operand it takes only one byte, the opcode. For example, a program consisting of LOAD 0x05, DREF, JMP would look like:

0x01, 0x05, 0x04, 0x0b

where the 0x01, 0x05 is LOAD 0x05, the 0x04 is DREF, and 0x0b is JMP


Here is the table of instruction specifying the opcode, mnemonic, mnemonic meaning, and function:

0x00 NOP              - 2 - no operation: does nothing
0x01 LOAD operand     - 4 - load: loads the operand into the accumulator
0x02 STOR [operand]   - 5 - store: stores the contents of the accumulator into the memory address specified by the operand
0x03 STOR [[operand]] - 6 - store: stores the contents of the accumulator into the memory address specified by the memory address that's specified by the operand
0x04 DREF             - 4 - dereference: replaces the contents of the accumulator with the contents of the memory slot specified by the value of the accumulator
0x05 UOUT             - 3 - unsigned out: prints the contents of the accumulator as an unsigned integer
0x06 SOUT             - 3 - signed out: prints the contents of the accumulator as a signed integer
0x07 ADD operand      - 5 - add: adds the operand to the accumulator and sets the four flags appropriately
0x08 ADD [operand]    - 6 - add: adds the value at the memory address specified by the operand to the accumulator and sets the four flags appropriately
0x09 SUB operand      - 5 - subtract: subtracts the operand from the accumulator and sets the four flags appropriately
0x0a SUB [operand]    - 6 - subtract: subtracts the value at the memory address specified by the operand from the accumulator and sets the four flags appropriately
0x0b JMP              - 2 - jump: unconditionally jumps to the address in the accumulator
0x0c JZ               - 2 - jump zero: jumps to the address in the accumulator iff the zero flag is set
0x0d JN               - 2 - jump negative: jumps to the address in the accumulator iff the negative flag is set
0x0e JC               - 2 - jump carry: jumps to the address in the accumulator iff the carry flag is set
0x0f JO               - 2 - jump overflow: jumps to the address in the accumulator iff the overflow flag is set
0x10 LDIP             - 2 - load instruction pointer: loads the address of the next instruction into the accumulator
0x11 HLT              - 1 - halt: halts the CPU

0x11 to 0xff NOP - unused opcodes that currently do nothing

The carry flag indicates that the result of an unsigned operation is incorrect due to insufficient number of bits, e.g. 205 + 74 = 23. The overflow flag indicates that the result of a signed operation is incorrect due to insufficient number of bits, e.g. 120 + 38 = -98.

*/

fun Byte.toUInt() = 
	if (this.toInt() < 0)
		this.toInt() + 256 
	else
		this.toInt()

fun main(args: Array<String>) {
	/*
val limit = 128
val sqrtOfLimit = ceil(sqrt(limit)) = 12
var *array = 0x80
var pos = 0
var i

while (true) {
	array[pos] = 0
	pos += 1
	if (pos == limit) {
		break
	}
}

pos = 2

while (true) {
	if (array[pos] == 0) {
		println(pos)
		if (pos < sqrtOfLimit) {
			i = pos
			while (true) {
				i += pos
				if (i < limit) {
					array[i] = 1
				} else {
					break
				}
			}
		}
	}
	pos += 1
	if (pos == limit) halt
}


limit: 128
sqrtOfLimit: 12
array: 0x80
*pos: 0
*i
*auxiliaryVar

start:
	LOAD array
	ADD [pos]
	STOR [auxiliaryVar]
	LOAD 0
	STOR [[auxiliaryVar]]
	LOAD [pos]
	ADD 1
	STOR [pos]
	SUB limit
	JZ middle
	JMP start

middle:
	LOAD 2
	STOR [pos]

mainLoop:
	LOAD array
	ADD [pos]
	DREF
	ADD 0
	JZ outerIf
	JMP afterIf

outerIf:
	LOAD [pos]
	UOUT
	SUB sqrtOfLimit
	JN innerIf
	JMP afterIf

innerIf:
	LOAD [pos]
	STOR [i]
	
innerLoop:
	LOAD [i]
	ADD [pos]
	STOR [i]
	SUB limit
	JN innerMostIf
	JMP afterIf

innerMostIf:
	LOAD array
	ADD [i]
	STOR [auxiliaryVar]
	LOAD 1
	STOR [[auxiliaryVar]]
	JMP innerLoop

afterIf:
	LOAD [pos]
	ADD 1
	STOR [pos]
	SUB limit
	JZ halt
	JMP mainLoop

halt:
	HLT


	0x00: LOAD 0x80
	0x02: ADD [0x67]
	0x04: STOR [0x69]
	0x06: LOAD 0x00
	0x08: STOR [[0x69]]
	0x0a: LOAD 0x67
	0x0c: DREF
	0x0d: ADD 0x01
	0x0f: STOR [0x67]
	0x11: SUB 0x80
	0x13: LOAD 0x19
	0x15: JZ
	0x16: LOAD 0x00
	0x18: JMP
	0x19: LOAD 0x02
	0x1b: STOR [0x67]
	0x1d: LOAD 0x80
	0x1f: ADD [0x67]
	0x21: DREF
	0x22: ADD 0x00
	0x24: LOAD 0x2a
	0x26: JZ
	0x27: LOAD 0x57
	0x29: JMP
	0x2a: LOAD 0x67
	0x2c: DREF
	0x2d: UOUT
	0x2e: SUB 0x0c
	0x30: LOAD 0x36
	0x32: JN
	0x33: LOAD 0x57
	0x35: JMP
	0x36: LOAD 0x67
	0x38: DREF
	0x39: STOR [0x68]
	0x3b: LOAD 0x68
	0x3d: DREF
	0x3e: ADD [0x67]
	0x40: STOR [0x68]
	0x42: SUB 0x80
	0x44: LOAD 0x4a
	0x46: JN
	0x47: LOAD 0x57
	0x49: JMP
	0x4a: LOAD 0x80
	0x4c: ADD [0x68]
	0x4e: STOR [0x69]
	0x50: LOAD 0x01
	0x52: STOR [[0x69]]
	0x54: LOAD 0x3b
	0x56: JMP
	0x57: LOAD 0x67
	0x59: DREF
	0x5a: ADD 0x01
	0x5c: STOR [0x67]
	0x5e: SUB 0x80
	0x60: LOAD 0x66
	0x62: JZ
	0x63: LOAD 0x1d
	0x65: JMP
	0x66: HLT
	*/
	var RAM = arrayOf(
		0x01, 0x80, 0x08, 0x67, 0x02, 0x69, 0x01, 0x00, 0x03, 0x69, 0x01, 0x67, 0x04, 0x07, 0x01, 0x02, 
		0x67, 0x09, 0x80, 0x01, 0x19, 0x0c, 0x01, 0x00, 0x0b, 0x01, 0x02, 0x02, 0x67, 0x01, 0x80, 0x08, 
		0x67, 0x04, 0x07, 0x00, 0x01, 0x2a, 0x0c, 0x01, 0x57, 0x0b, 0x01, 0x67, 0x04, 0x05, 0x09, 0x0c, 
		0x01, 0x36, 0x0d, 0x01, 0x57, 0x0b, 0x01, 0x67, 0x04, 0x02, 0x68, 0x01, 0x68, 0x04, 0x08, 0x67, 
		0x02, 0x68, 0x09, 0x80, 0x01, 0x4a, 0x0d, 0x01, 0x57, 0x0b, 0x01, 0x80, 0x08, 0x68, 0x02, 0x69, 
		0x01, 0x01, 0x03, 0x69, 0x01, 0x3b, 0x0b, 0x01, 0x67, 0x04, 0x07, 0x01, 0x02, 0x67, 0x09, 0x80, 
		0x01, 0x66, 0x0c, 0x01, 0x1d, 0x0b, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
	).map({it.toByte()}).toByteArray()
	var clockCycles = 0
	var instructionPointer: Byte = 0
	var accumulator: Byte = 0
	var flags = hashMapOf(
		"zero" to false,
		"negative" to false,
		"carry" to false, // unsigned overflow/borrow
		"overflow" to false // signed overflow/borrow
	)
	
	fun ALUOperation(
		dereferenceOperand: Boolean,
		function: (Byte, Byte) -> Byte,
		determineCarry: (Byte, Byte, Byte) -> Boolean,
		determineOverflow: (Byte, Byte, Byte) -> Boolean
	) {
		val operand1 = accumulator
		var operand2 = RAM[(++instructionPointer).toUInt()]
		
		if (dereferenceOperand) operand2 = RAM[operand2.toUInt()]
		
		val result = function(operand1, operand2)
		accumulator = result
		
		flags["zero"] = result == 0.toByte()
		flags["negative"] = result < 0.toByte()
		flags["carry"] = determineCarry(operand1, operand2, result)
		flags["overflow"] = determineOverflow(operand1, operand2, result)
	}
	
	while (true) {
		var instruction = RAM[instructionPointer.toUInt()].toUInt()
		
		if (instruction >= 18) {
			return println("Invalid instruction \"$instruction\" at RAM position \"${instructionPointer.toString(16)}\"")
		}
		
		clockCycles += arrayOf(
			2,
			4,
			5,
			6,
			4,
			3,
			3,
			5,
			6,
			5,
			6,
			2,
			2,
			2,
			2,
			2,
			2,
			1
		)[instruction]

		when (instruction) {
			0x00 -> {} // do nothing. I'm including this so it's an official NOP rather than just a missing entry
			0x01 -> accumulator = RAM[(++instructionPointer).toUInt()]
			0x02 -> RAM[RAM[(++instructionPointer).toUInt()].toUInt()] = accumulator
			0x03 -> RAM[RAM[RAM[(++instructionPointer).toUInt()].toUInt()].toUInt()] = accumulator
			0x04 -> accumulator = RAM[accumulator.toUInt()]
			0x05 -> println(accumulator.toUInt())
			0x06 -> println(accumulator.toInt())
			0x07 -> ALUOperation(
				false,
				{operand1: Byte, operand2: Byte -> (operand1 + operand2).toByte()},
				{operand1: Byte, operand2: Byte, result: Byte -> 
					operand1.toUInt() > result.toUInt() || operand2.toUInt() > result.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) == (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x08 -> ALUOperation(
				true,
				{operand1: Byte, operand2: Byte -> (operand1 + operand2).toByte()},
				{operand1: Byte, operand2: Byte, result: Byte -> 
					operand1.toUInt() > result.toUInt() || operand2.toUInt() > result.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) == (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x09 -> ALUOperation(
				false,
				{operand1: Byte, operand2: Byte -> (operand1 - operand2).toByte()},
				{operand1: Byte, operand2: Byte, _: Byte -> 
					operand1.toUInt() < operand2.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) != (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x0a -> ALUOperation(
				true,
				{operand1: Byte, operand2: Byte -> (operand1 - operand2).toByte()},
				{operand1: Byte, operand2: Byte, _: Byte -> 
					operand1.toUInt() < operand2.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) != (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x0b -> instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0c -> if (flags["zero"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0d -> if (flags["negative"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0e -> if (flags["carry"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0f -> if (flags["overflow"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x10 -> accumulator = instructionPointer
			0x11 -> return println("\nNumber of clock cycles before halting: " + clockCycles)
		}
		
		instructionPointer++
	}
}
