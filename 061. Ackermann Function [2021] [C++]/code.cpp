#include <iostream>

unsigned long long i = 0;
unsigned char* mainStackAddress;

/*
The ackermann function recurses in a very complex way despite having a very simple definition. No
matter the input, it will always terminate (will not recurse forever), but even for modest inputs it
outputs ludicrous numbers. For example, ackermann(4, 2) outputs a number with 19,729 digits.
And furthermore, the only arithmetic the function does is incrementing and decrementing, so
ackermann(4, 2) will not terminate until it has incremented at least 10^19729 times, and even then it
will probably be far from done executing since it doesn't always take the most efficient path to the
right answer. As such, the execution will always time out, although for some reason the program just
stops outputting to stdout without even saying "Execution timed out." like it usually does.

One interesting thing is that the large growth of the Ackermann function is closely related to
Knuth's up-arrow notation (variants with three arguments have an even closer relationship) and so
this function can be used to compute Graham's number which is based on Knuth's up-arrow notation.
I might make a code that does just this, although don't expect it to terminate for it will be
giving arguments far larger than 4 and 2 to the Ackermann function. In fact, these arguments will
be far larger than Ackermann(4, 2) and even Ackermann(Ackermann(4, 2), Ackermann(4, 2)).
*/
unsigned long long ackermann(unsigned long long m, unsigned long long n) {
	i++;
	if (i % 1000000 == 0) {
		std::cout << "number of calls to the ackermann function: " << i << std::endl;
		std::cout << "and stack depth of " << mainStackAddress - (unsigned char*)&n << " bytes" << std::endl << std::endl;
	}
	if (m == 0) return n + 1;
	if (n == 0) return ackermann(m - 1, 1);
	else return ackermann(m - 1, ackermann(m, n - 1));
}

int main() {
	int dummyVar;
	mainStackAddress = (unsigned char*)&dummyVar;
	std::cout << ackermann(4, 2) << std::endl;
	
	return 0;
}
