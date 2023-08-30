/*

In this program I make the same syscall (write) three times. The first and last times are with the C function syscall() and the middle time is with assembly.

*/

#include <stdio.h>
#include <unistd.h>
#include <sys/syscall.h>

void assembly();

int main() {
	syscall(1, 1, "Before assembly execution\n", 26);
	assembly();
	syscall(1, 1, "After assembly execution\n", 25);
	
	return 0;
}

// the naked attribute removes the compiler-inserted prologue and epilogue.
// I set it to naked to show the prologue and epilogue in assembly.
// if I removed it then I can skip the prologue and epilogue and go straight to the fun part.
__attribute__((naked)) void assembly() {
	asm volatile (R"(
		# the following two lines are the function prologue and are included at the beginning of every function
		push %rbp				# save base pointer
		mov %rsp, %rbp 		# set base pointer to base of current stack frame
		
		mov $1, %rax			# system call 1 is write
		mov $1, %rdi			# file handle 1 is stdout
		mov $message, %rsi	# address of string
		mov $len, %rdx			# length of string
		syscall
		
		# the following two lines are the function epilogue and are included at the end of every function
		leave 					# restore old base pointer
		ret 					# return
	
	message:
		.ascii "During assembly execution\n"
		len = . - message
	)");
}
