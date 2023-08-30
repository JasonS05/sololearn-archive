#include <iostream>

template<typename T, typename U>
class Coroutine {
private:
	void* childStackPointer;
	T* (*function)(Coroutine*, U*);
	void* parentStackPointer;
	void* stack;
public:
	Coroutine(T* _function(Coroutine<T, U>*, U*)): function(_function) {
		stack = new char[1048576]; // 1048576 bytes is 1MB
		childStackPointer = (char*)stack + 1048575;
	}
	~Coroutine() {
		delete((char*)stack);
	}
	__attribute__((naked)) T* start(U* a) {
		__asm__ volatile (R"(
			.intel_syntax noprefix
			push rbp
			push rbx
			push r12
			push r13
			push r14
			push r15
			mov [rdi+16], rsp
			mov rsp, [rdi]
			push rdi
			call [rdi+8]
			pop rdi
			mov rsp, [rdi+16]
			pop r15
			pop r14
			pop r13
			pop r12
			pop rbx
			pop rbp
			ret
			.att_syntax noprefix
		)");
	}
	__attribute__((naked)) U* yield(T* a) {
		__asm__ volatile (R"(
			.intel_syntax noprefix
			push rbp
			push rbx
			push r12
			push r13
			push r14
			push r15
			mov [rdi], rsp
			mov rsp, [rdi+16]
			mov rax, rsi
			pop r15
			pop r14
			pop r13
			pop r12
			pop rbx
			pop rbp
			ret
			.att_syntax noprefix
		)");
	}
	__attribute__((naked)) T* resume(U* args) {
		__asm__ volatile (R"(
			.intel_syntax noprefix
			push rbp
			push rbx
			push r12
			push r13
			push r14
			push r15
			mov [rdi+16], rsp
			mov rsp, [rdi]
			mov rax, rsi
			pop r15
			pop r14
			pop r13
			pop r12
			pop rbx
			pop rbp
			ret
			.att_syntax noprefix
		)");
	}
};

int* fibonacci(Coroutine<int, void>* co, void* password) {
	int a = 0;
	int b = 1;
	int c = 0;
	
	while (1) {
		a = b;
		b = c;
		c = a + b;
		co->yield(&c);
	}
}

int main() {
	auto co = new Coroutine<int, void>(fibonacci);
	
	// since the coroutine takes no input I just pass NULL
	for (int num = *co->start(NULL); num < 1000; num = *co->resume(NULL)) {
		std::cout << num << std::endl;
	}
	
	delete co;
	
	return 0;
}

