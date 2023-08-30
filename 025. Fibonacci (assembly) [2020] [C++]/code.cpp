__attribute__((naked)) int main() {
	asm volatile(R"(
		push %rbp					# save old base pointer
		mov	%rsp, %rbp				# create new base pointer
		
		lea	format(%rip),	%rdi	# save absolute address of format string in %rdi using %rip based relative addressing
		
									# set up the registers
		mov $46, %rcx				# %rcx is the loop register used by the loop instruction. It will loop 46 times
		mov $0, %rax
		mov $1, %rbx
		mov $0, %rdx
		
	fib:
									# shuffle around the contents of the registers and perform the addition
		mov %rbx, %rax
		mov %rdx, %rbx
		add %rax, %rdx
		
									# the second argument of printf is stored in %rsi. These instruction say %rsi = 47 - %rcx
		mov $47, %rsi
		sub %rcx, %rsi
		
									# save the registers modified by printf and call printf
		push %rdi
		push %rdx
		push %rcx
		push %rax
		call printf
		
									# restore the saved registers
		pop %rax
		pop %rcx
		pop %rdx
		pop %rdi
		
		loop fib					# decrement %rcx and jump to fib if %rcx is non-zero
		
		mov $0, %eax				# the return value is stored in %eax. This sets the return value to 0
		pop %rbp					# restore old base pointer
		ret							# return
		
	format:
		.asciz "Fib %2d: %d\n"
	)");
}
