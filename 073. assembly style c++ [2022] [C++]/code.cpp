// I have converted some assembly I wrote a long time ago to an equivalent C++ program that is as close as I could get to
// the original assembly source code. The original assembly is shown below:

/*

.global main

.text

;; this write_number function took me FOREVER (hours!). The function main on the other hand literally took like 2 minutes.
write_number:
	movb $0x0a, -1(%rsp)
	mov %rdi, %rax
	mov $10, %rdi
	mov $-1, %rcx
	
write_number_loop:
	mov $0, %rdx
	div %rdi
	add $48, %rdx
	mov %dl, -1(%rsp, %rcx)
	dec %rcx
	cmp $0, %rax
	jz write_number_print
	jmp write_number_loop
	
write_number_print:
	neg %rcx
	mov %rcx, %rdx
	mov $1, %rdi
	mov %rsp, %rsi
	sub %rcx, %rsi
	mov $1, %rax
	syscall
	
	ret

;; *************************************
;; END OF WRITE_NUMBER BEGINNING OF MAIN
;; *************************************

main:
	mov $0, %rax
	mov $1, %rdx
	mov $0, %rcx
	
loop:
	add %rax, %rdx
	jc exit
	mov %rdx, %rdi
	push %rax
	push %rdx
	call write_number
	pop %rax
	pop %rdx
	jmp loop
	
exit:
	ret

*/

#include <stdint.h>

// These variables don't map to the registers they're named after, unless the compiler by chance happens to allocate
// them in those particular registers. This is definitely not the case for the %rsp and %rax registers, and probably
// not the case for any of the other registers. However, the code below uses these variables as if they are the
// registers they've been named after, and any special behavior of certain registers has been emulated in the code.
uint64_t rsp;
uint64_t rax;
uint64_t rdi;
uint64_t rcx;
uint64_t rdx;
uint8_t& dl = *((uint8_t*)&rdx);
uint64_t rsi;

uint64_t getRsp(int a) {
	return (uint64_t)&a;
}

int main() {
	rsp = getRsp(0);
	
	goto main;
	
	write_number:
	*(uint8_t*)(rsp - 1) = 0x0a;
	rax = rdi;
	rdi = 10;
	rcx = -1;
	
	write_number_loop:
	rdx = 0;
	rdx = rax % rdi; rax /= rdi;
	rdx += 48;
	*(uint8_t*)(rsp + rcx - 1) = dl;
	rcx -= 1;
	if (rax == 0) goto write_number_print;
	else goto write_number_loop;
	
	write_number_print:
	rcx = -rcx;
	rdx = rcx;
	rdi = 1;
	rsi = rsp;
	rsi -= rcx;
	rax = 1;
	__asm__ (
		"syscall" // some assembly code to execute because I couldn't get the compiler to find the syscall() library function
		: "=a" (rax) // tell the compiler to put the contents of %rax into the rax variable after executing the assembly
		: "a" (rax), "D" (rdi), "S" (rsi), "d" (rdx) // tell the compiler to fill the contents of the %rax, %rdi, %rsi, and %rdx registers with their respective variables before executing the assembly
		: "%rcx", "%r11" // tell the compiler that the assembly clobbers the %rcx and %r11 registers
	);
	goto write_number_return;
	
	main:
	rax = 0;
	rdx = 1;
	rcx = 0;
	
	loop:
	rdx += rax;
	if (rdx < rax) goto exit; // of course I can't just check the carry flag, so I see if the addition overflowed by using a comparison
	rdi = rdx;
	rsp -= sizeof(uint64_t); *(uint64_t*)rsp = rax;
	rsp -= sizeof(uint64_t); *(uint64_t*)rsp = rdx;
	goto write_number; // I've replaced the call/return with a goto and label because I couldn't convince C++ to call a label
	write_number_return:
	rax = *(uint64_t*)rsp; rsp += sizeof(uint64_t);
	rdx = *(uint64_t*)rsp; rsp += sizeof(uint64_t);
	goto loop;
	
	exit:
	return rax;
}
