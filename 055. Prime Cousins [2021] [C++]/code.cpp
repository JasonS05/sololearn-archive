#include <iostream> // std::cout std::endl
#include <utility> // std::pair
#include <vector> // std::vector
#include <algorithm> // std::max

// this is my C++ Coroutine class from https://code.sololearn.com/cL4zuZOY0AuO/?ref=app
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

int* primeGenerator(Coroutine<int, void>* self, void* a) {
	std::vector<std::vector<int>> primes(3);
	
	for (int i = 2; true; i++) {
		if (!primes[i].size()) {
			self->yield(&i);
			primes[i].push_back(i);
		}
		
		auto factors = primes[i];
		
		for (auto factor: factors) {
			primes.resize(std::max((int)primes.size(), i + primes[i][0] + 1));
			primes[i + factor].push_back(factor);
		}
	}
}

std::pair<int, int>* primeCousinGenerator(Coroutine<std::pair<int, int>, bool>* self, bool* a) {
	auto primes = new Coroutine(primeGenerator);
	
	int currPrime = *primes->start(NULL);
	int nextPrime = *primes->resume(NULL);
	
	{
		auto b = std::pair<int, int>(3, 7);
		self->yield(&b);
	}
	
	while (true) {
		if (currPrime + 4 == nextPrime) {
			auto primePair = std::pair(currPrime, nextPrime);
			if (*self->yield(&primePair)) {
				delete primes;
				return NULL;
			}
		}
		
		currPrime = nextPrime;
		nextPrime = *primes->resume(NULL);
	}
}

int main() {
	auto primeCousins = new Coroutine(primeCousinGenerator);
	bool f = false;
	bool t = true;
	
	auto primePair = *primeCousins->start(&f);
	
	for (int i = 0; i < 100; i++) {
		std::cout << primePair.first << " " << primePair.second << std::endl;
		primePair = *primeCousins->resume(&f);
	}
	
	primeCousins->resume(&t);
	delete primeCousins;
	
	return 0;
}

