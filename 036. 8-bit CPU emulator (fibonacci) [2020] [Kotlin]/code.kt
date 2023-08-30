/*

I am currently building this computer in minecraft. I figured that since it'll take a bit to finish I might as well make it in code first.

This computer is what is known as an accumulator machine. It has other registers (instruction pointer, flags, instruction register, memory address register, and temporary register), not all of which are explicitly simulated by this emulator, but the only register used for computation is the accumulator, so all instructions implicitly act on that register.

All instructions have either one or zero operands. If it has an operand, then it takes two bytes, the first being the opcode and the second the operand. If it doesn't have an operand it takes only one byte, the opcode. For example, a program consisting of LOAD 0x05, DREF, JMP would look like:

0x01, 0x05, 0x04, 0x0b

where the 0x01, 0x05 is LOAD 0x05, the 0x04 is DREF, and 0x0b is JMP


Here is the table of instruction specifying the opcode, mnemonic, mnemonic meaning, and function:

0x00 NOP - no operation: does nothing
0x01 LOAD operand - load: loads the operand into the accumulator
0x02 STOR [operand] - store: stores the contents of the accumulator into the memory address specified by the operand
0x03 STOR [[operand]] - store: stores the contents of the accumulator into the memory address specified by the memory address that's specified by the operand
0x04 DREF - dereference: replaces the contents of the accumulator with the contents of the memory slot specified by the value of the accumulator
0x05 UOUT - unsigned out: prints the contents of the accumulator as an unsigned integer
0x06 SOUT - signed out: prints the contents of the accumulator as a signed integer
0x07 ADD operand - add: adds the operand to the accumulator and sets the four flags appropriately
0x08 ADD [operand] - add: adds the value at the memory address specified by the operand to the accumulator and sets the four flags appropriately
0x09 SUB operand - subtract: subtracts the operand from the accumulator and sets the four flags appropriately
0x0a SUB [operand] - subtract: subtracts the value at the memory address specified by the operand from the accumulator and sets the four flags appropriately
0x0b JMP - jump: unconditionally jumps to the address in the accumulator
0x0c JZ - jump zero: jumps to the address in the accumulator iff the zero flag is set
0x0d JN - jump negative: jumps to the address in the accumulator iff the negative flag is set
0x0e JC - jump carry: jumps to the address in the accumulator iff the carry flag is set
0x0f JO - jump overflow: jumps to the address in the accumulator iff the overflow flag is set
0x10 LDIP - load instruction pointer: loads the address of the current instruction into the accumulator
0x11 HLT - halt: halts the CPU

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
	0x00: LOAD 0xff
	0x02: DREF
	0x03: UOUT
	0x04: ADD [0xfe]
	0x06: STOR [0xfe]
	0x08: LOAD 0x19
	0x0a: JC
	0x0b: LOAD 0xfe
	0x0d: DREF
	0x0e: UOUT
	0x0f: ADD [0xff]
	0x11: STOR [0xff]
	0x13: LOAD 0x19
	0x15: JC
	0x16: LOAD 0x00
	0x18: JMP
	0x19: HLT
	
	0xfe: 0x00
	0xff: 0x01
	*/
	var RAM = Array<Byte>(256, {index: Int ->
		arrayOf(
			0x01, 0xff, 0x04, 0x05, 0x08, 0xfe, 0x02, 0xfe, 0x01, 0x19, 0x0e, 0x01, 0xfe, 0x04, 0x05, 0x08,
			0xff, 0x02, 0xff, 0x01, 0x19, 0x0e, 0x01, 0x00, 0x0b, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01
		)[index].toByte()
	})
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
		when (RAM[instructionPointer.toUInt()]) {
			0x00.toByte() -> {} // do nothing. I'm including this so it's an official NOP rather than just a missing entry
			0x01.toByte() -> accumulator = RAM[(++instructionPointer).toUInt()]
			0x02.toByte() -> RAM[RAM[(++instructionPointer).toUInt()].toUInt()] = accumulator
			0x03.toByte() -> RAM[RAM[RAM[(++instructionPointer).toUInt()].toUInt()].toUInt()] = accumulator
			0x04.toByte() -> accumulator = RAM[accumulator.toUInt()]
			0x05.toByte() -> println(accumulator.toUInt())
			0x06.toByte() -> println(accumulator.toInt())
			0x07.toByte() -> ALUOperation(
				false,
				{operand1: Byte, operand2: Byte -> (operand1 + operand2).toByte()},
				{operand1: Byte, operand2: Byte, result: Byte -> 
					operand1.toUInt() > result.toUInt() || operand2.toUInt() > result.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) == (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x08.toByte() -> ALUOperation(
				true,
				{operand1: Byte, operand2: Byte -> (operand1 + operand2).toByte()},
				{operand1: Byte, operand2: Byte, result: Byte -> 
					operand1.toUInt() > result.toUInt() || operand2.toUInt() > result.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) == (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x09.toByte() -> ALUOperation(
				false,
				{operand1: Byte, operand2: Byte -> (operand1 - operand2).toByte()},
				{operand1: Byte, operand2: Byte, result: Byte -> 
					operand1.toUInt() < operand2.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) != (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x0a.toByte() -> ALUOperation(
				true,
				{operand1: Byte, operand2: Byte -> (operand1 - operand2).toByte()},
				{operand1: Byte, operand2: Byte, result: Byte -> 
					operand1.toUInt() < operand2.toUInt()
				},
				{operand1: Byte, operand2: Byte, result: Byte ->
					(operand1 < 0.toByte()) != (operand2 < 0.toByte()) && (operand1 < 0.toByte()) != (result < 0.toByte())
				}
			)
			0x0b.toByte() -> instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0c.toByte() -> if (flags["zero"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0d.toByte() -> if (flags["negative"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0e.toByte() -> if (flags["carry"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x0f.toByte() -> if (flags["overflow"]!!) instructionPointer = (accumulator - 1.toByte()).toByte()
			0x10.toByte() -> accumulator = instructionPointer
			0x11.toByte() -> return
		}
		
		instructionPointer++
	}
}

