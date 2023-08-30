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
My primes program, including the steps I used to construct it

First, the C like pseudo-code

var primeCandidate = 2
var primeCandidate2 = 2
var divisibilityTest = 2

while (true) {
	if (divisibilityTest == primeCandidate) {
		println(primeCandidate)
		primeCandidate += 1
		if (overflow) halt
		divisibilityTest = 2
	} else {
		primeCandidate2 = primeCandidate
		while (true) {
			primeCandidate2 -= divisibilityTest
			if (zero) {
				primeCandidate += 1
				if (overflow) halt
				divisibilityTest = 2
				break
			} else if (negative) {
				divisibilityTest += 1
				break
			}
		}
	}
}


Then, the human readable assembly

primeCandidate: 2
primeCandidate2: 2
divisibilityTest: 2

start:
	LOAD primeCandidate
	SUB divisibilityTest
	JZ block1
	JMP block2
	
block1:
	LOAD primeCandidate
	UOUT
	ADD 1
	STORE primeCandidate
	JO end
	LOAD 2
	STORE divisibilityTest
	JMP start
	
block2:
	LOAD primeCandidate
	STORE primeCandidate2
	
block2.1:
	LOAD primeCandidate2
	SUB divisibilityTest
	STORE primeCandidate2
	JZ block2.1.1
	JN block2.1.2
	JMP block2.1
	
block2.1.1:
	LOAD primeCandidate
	ADD 1
	STORE primeCandidate
	JO end
	LOAD 2
	STORE divisibilityTest
	JMP start
	
block2.1.2:
	LOAD divisibilityTest
	ADD 1
	STORE divisibilityTest
	JMP start
	
end:
	HALT


And finally, the assembly with the labels replaced with hexadecimal addresses and some instructions like
	JMP somewhere
expanded to
	LOAD somewhere
	JMP
as well as specifying the exact location of each instruction in hexadecimal. This is similar to what would come from something like the Linux command "objdump", just without the bytes of each instruction.

	0x00: LOAD 0xfd
	0x02: DREF
	0x03: SUB [0xff]
	0x05: LOAD 0x0b
	0x07: JZ
	0x08: LOAD 0x1d
	0x0a: JMP
	0x0b: LOAD 0xfd
	0x0d: DREF
	0x0e: UOUT
	0x0f: ADD 1
	0x11: STORE [0xfd]
	0x13: LOAD 0x4d
	0x15: JO
	0x16: LOAD 2
	0x18: STORE [0xff]
	0x1a: LOAD 0x00
	0x1c: JMP
	0x1d: LOAD 0xfd
	0x1f: DREF
	0x20: STORE [0xfe]
	0x22: LOAD 0xfe
	0x24: DREF
	0x25: SUB [0xff]
	0x27: STORE [0xfe]
	0x29: LOAD 0x32
	0x2b: JZ
	0x2c: LOAD 0x43
	0x2e: JN
	0x2f: LOAD 0x22
	0x31: JMP
	0x32: LOAD 0xfd
	0x34: DREF
	0x35: ADD 1
	0x37: STORE [0xfd]
	0x39: LOAD 0x4d
	0x3b: JO
	0x3c: LOAD 2
	0x3e: STORE [0xff]
	0x40: LOAD 0x00
	0x42: JMP
	0x43: LOAD 0xff
	0x45: DREF
	0x46: ADD 1
	0x48: STORE [0xff]
	0x4a: LOAD 0x00
	0x4c: JMP
	0x4d: HALT
	
	0xfd: 0x02
	0xfe: 0x02
	0xff: 0x02


And here is the program in hexadecimal
	*/
	var RAM = Array<Byte>(256, {index: Int ->
		arrayOf(
			0x01, 0xfd, 0x04, 0x0a, 0xff, 0x01, 0x0b, 0x0c, 0x01, 0x1d, 0x0b, 0x01, 0xfd, 0x04, 0x05, 0x07,
			0x01, 0x02, 0xfd, 0x01, 0x4d, 0x0f, 0x01, 0x02, 0x02, 0xff, 0x01, 0x00, 0x0b, 0x01, 0xfd, 0x04,
			0x02, 0xfe, 0x01, 0xfe, 0x04, 0x0a, 0xff, 0x02, 0xfe, 0x01, 0x32, 0x0c, 0x01, 0x43, 0x0d, 0x01,
			0x22, 0x0b, 0x01, 0xfd, 0x04, 0x07, 0x01, 0x02, 0xfd, 0x01, 0x4d, 0x0f, 0x01, 0x02, 0x02, 0xff,
			0x01, 0x00, 0x0b, 0x01, 0xff, 0x04, 0x07, 0x01, 0x02, 0xff, 0x01, 0x00, 0x0b, 0x11, 0x00, 0x00,
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
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x02, 0x02
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

