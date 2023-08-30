#include <iostream>
using namespace std;

template<int N, int M>
struct _isPrime {
	enum {value = N % M && _isPrime<N, M-1>::value};
};

template<int N>
struct _isPrime<N, 1> {
	enum {value = 1};
};

template<int N>
struct isPrime {
	enum {value = _isPrime<N, N-1>::value};
};

int main() {
	cout << "2: " << isPrime<2>::value << endl;
	cout << "3: " << isPrime<3>::value << endl;
	cout << "4: " << isPrime<4>::value << endl;
	cout << "5: " << isPrime<5>::value << endl;
	cout << "6: " << isPrime<6>::value << endl;
	cout << "7: " << isPrime<7>::value << endl;
	cout << "8: " << isPrime<8>::value << endl;
	cout << "9: " << isPrime<9>::value << endl;
	cout << "10: " << isPrime<10>::value << endl;
	cout << "11: " << isPrime<11>::value << endl;
	cout << "12: " << isPrime<12>::value << endl;
	cout << "13: " << isPrime<13>::value << endl;
	cout << "14: " << isPrime<14>::value << endl;
	cout << "15: " << isPrime<15>::value << endl;
	cout << "16: " << isPrime<16>::value << endl;
	cout << "17: " << isPrime<17>::value << endl;
	cout << "18: " << isPrime<18>::value << endl;
	cout << "19: " << isPrime<19>::value << endl;
	cout << "20: " << isPrime<20>::value << endl;

	
	return 0;
}
