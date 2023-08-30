#include <stdio.h>
#include <stdlib.h>

typedef struct Coroutine {
	void* childStackPointer;
	void* (*function)(struct Coroutine*, void*);
	void* parentStackPointer;
	void* stack;
} Coroutine;

Coroutine createCoroutine(void* function(Coroutine*, void*)) {
	void* stack = malloc(1048576); // 1048576 bytes is 1MB
	void* bottomOfStack = (char*)stack + 1048575;
	Coroutine co = {bottomOfStack, function, NULL, stack};
	return co;
}

__attribute__((naked)) void* start(Coroutine* co, void* args) {
	__asm__ volatile ("\
		.intel_syntax noprefix\n\
		push rbp\n\
		push rbx\n\
		push r12\n\
		push r13\n\
		push r14\n\
		push r15\n\
		mov [rdi+16], rsp\n\
		mov rsp, [rdi]\n\
		push rdi\n\
		call [rdi+8]\n\
		pop rdi\n\
		mov rsp, [rdi+16]\n\
		pop r15\n\
		pop r14\n\
		pop r13\n\
		pop r12\n\
		pop rbx\n\
		pop rbp\n\
		ret\n\
		.att_syntax noprefix\n\
	");
}

__attribute__((naked)) void* yield(Coroutine* co, void* returnData) {
	__asm__ volatile ("\
		.intel_syntax noprefix\n\
		push rbp\n\
		push rbx\n\
		push r12\n\
		push r13\n\
		push r14\n\
		push r15\n\
		mov [rdi], rsp\n\
		mov rsp, [rdi+16]\n\
		mov rax, rsi\n\
		pop r15\n\
		pop r14\n\
		pop r13\n\
		pop r12\n\
		pop rbx\n\
		pop rbp\n\
		ret\n\
		.att_syntax noprefix\n\
	");
}

__attribute__((naked)) void* resume(Coroutine* co, void* args) {
	__asm__ volatile ("\
		.intel_syntax noprefix\n\
		push rbp\n\
		push rbx\n\
		push r12\n\
		push r13\n\
		push r14\n\
		push r15\n\
		mov [rdi+16], rsp\n\
		mov rsp, [rdi]\n\
		mov rax, rsi\n\
		pop r15\n\
		pop r14\n\
		pop r13\n\
		pop r12\n\
		pop rbx\n\
		pop rbp\n\
		ret\n\
		.att_syntax noprefix\n\
	");
}

void* fibonacci(Coroutine* co, void* args) {
	int a = 0;
	int b = 1;
	int c = 0;
	
	while (1) {
		a = b;
		b = c;
		c = a + b;
		yield(co, &c);
	}
}

int main() {
	Coroutine* co = malloc(sizeof(Coroutine));
	*co = createCoroutine(fibonacci);
	
	for (int num = *(int*)start(co, NULL); num < 1000; num = *(int*)resume(co, NULL))
		printf("%d\n", num);
	
	free(co->stack);
	free(co);
	
	return 0;
}

