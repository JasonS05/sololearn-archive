// I'm writing this C style (using file functions with file pointers rather than file streams) since I originally planned to write this in C and only switched to C++ for the R"()" strings

#include <stdio.h>
#include <stdlib.h>

// I'm beginning and ending the string literal with #" to make SoloLearn's syntax coloring not color the contents of the string because SoloLearn doesn't know about R"()" strings. I'm also putting the # to make GAS (the assembler used by GCC) ignore the "
const char *program = R"(#"

.global main

.text

#// this write_number function took me FOREVER (hours!). The function main on the other hand literally took like 2 minutes.
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

/***********************************\
END OF WRITE_NUMBER BEGINNING OF MAIN
\***********************************/

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

#"
)";

int main() {
	FILE *file = fopen("hello.s", "w");
	fprintf(file, "%s", program);
	fclose(file);
	
	system("gcc hello.s -o hello");
	system("./hello");
	
	return 0;
}
