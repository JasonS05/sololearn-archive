/*
Never used C before but I just discovered pointers and now I wanna do some evil memory hacking with them :D
*/

#include <stdio.h>

int main() {
	int x = 5;
	int* somePointer = &x;
	
	for (int i = -9; i <= 9; i++) {
		if (i == 0) {
			printf("%2d: 0x%08x -- this is the data the pointer points to\n", i, *(somePointer + i));
		}
		else {
			printf("%2d: 0x%08x\n", i, *(somePointer + i));
		}
	}
	
	return 0;
}
