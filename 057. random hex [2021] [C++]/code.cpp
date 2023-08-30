#include <iostream>
#include <cmath>

unsigned long long randommm() {
	unsigned long long out;
	asm volatile ("rdrand %[result]":[result]"=r"(out));
	return out;
}

int main() {
	for (int i = 0; i < 100; i++) {
		printf("%llx", randommm());
	}
	
	return 0;
}
