#include <iostream>

template<typename T, class C>
struct dummy {
	using type = T;
};

template<template<auto...> class C, auto... params>
class valid {
	template <template<auto...> class D, auto... params2> static short test(typename dummy<int, D<params2...>>::type);
	template <template<auto...> class D, auto... params2> static long test(...);
public:
	enum { value = sizeof(valid<C, params...>::test<C, params...>(0)) == sizeof(short) };
};

template<int enoughArgs, template<auto...> class C, auto... ArgsSoFar>
struct _curry {
	using type = C<ArgsSoFar...>;
};

template<template<auto...> class C, auto... ArgsSoFar>
struct _curry<0, C, ArgsSoFar...> {
	template<auto... params>
	using apply = _curry<valid<C, ArgsSoFar..., params...>::value, C, ArgsSoFar..., params...>;
};

template<template<auto...> class C>
struct curry {
	template<auto... params>
	using apply = _curry<valid<C, params...>::value, C, params...>;
};



template<int a, int b>
struct add {
	public: enum { value = a + b };
};

int main() {
	std::cout << curry<add>::apply<5>::apply<3>::type::value;
	
	return 0;
}
