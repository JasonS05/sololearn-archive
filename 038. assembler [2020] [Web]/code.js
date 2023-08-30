let assembly = `LOAD 0x80
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
	0x30: LOAD 0x37
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
	0x66: HLT`;

let lines = assembly
	.split(/\n\t0x..:/).join("")
	.split(" [0").join("$ 0")
	.split(" [[").join("$$ ")
	.split("]").join("")
	.split(" ");

let replacements = {
	NOP: "0x00",
	LOAD: "0x01",
	STOR$: "0x02",
	STOR$$: "0x03",
	DREF: "0x04",
	UOUT: "0x05",
	SOUT: "0x06",
	ADD: "0x07",
	ADD$: "0x08",
	SUB: "0x09",
	SUB$: "0x0a",
	JMP: "0x0b",
	JZ: "0x0c",
	JN: "0x0d",
	JC: "0x0e",
	JO: "0x0f",
	LDIP: "0x10",
	HLT: "0x11"
}

for (let i = 0; i < 256; i++) {
	lines[i] = replacements[lines[i]] || lines[i];
	if (!lines[i]) lines[i] = "0x00";
	if (i % 16 == 0) lines[i] = "\n\t\t\t" + lines[i];
}

document.write(lines.join(", "));
