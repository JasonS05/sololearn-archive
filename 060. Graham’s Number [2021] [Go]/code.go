/*
This program will never terminate. Its execution time is technically finite (assuming infinite memory and no integer overflows), but it would take far longer than the age of the universe to execute. In fact, the age of the universe is so small in comparison to the execution time that the age of the universe and the planck time, the smallest unit of time there is (sorta), look like they last about the same amount of time in comparison to the execution time of this program. The sheer magnitude of this execution time almost cannot be expressed in words. Now, let's look at the function knuthUpArrow, which I'll call f for convenience's sake. The way I've defined it is such that f(a, b, 0) is the sum of a and b, f(a, b, 1) is the repeated sum of a b times, a.k.a. a times b, f(a, b, 2) is the repeated multiplication of a b times, a.k.a. a to the power of b, and so on for higher and higher numbers. Now, consider f(3, 3, 5). The sheer magnitude of even this number is incredibly difficult to express. Now, the function graham is defined such that graham(1) is f(3, 3, 5), graham(2) is f(3, 3, graham(1) + 1), graham(3) is f(3, 3, graham(2) + 1), and so on. Graham's number itself is graham(64). Now, imagine that number. At this scale, the entirety of the universe is just as small compared to grahams number as a single lone proton is. Scale is almost meaningless at this scale, but there are still bigger numbers. MUCH bigger numbers. Things far bigger than even graham(graham(64)), or graham(graham(graham(... graham(64) ...))) with a nesting depth of graham(64). Geez, now my brain hurts.
*/

package main

import "fmt"

func main() {
	fmt.Println(graham(64))
}

func graham(n int) int {
	if n == 1 {
		return knuthUpArrow(3, 3, 5)
	} else {
		return knuthUpArrow(3, 3, graham(n - 1) + 1)
	}
}

func knuthUpArrow(a, b, c int) int {
	if c == 0 {
		if b == 0 {
			return a
		} else {
			return knuthUpArrow(a + 1, b - 1, 0)
		}
	} else {
		if (b == 1) {
			return a
		} else {
			return knuthUpArrow(a, knuthUpArrow(a, b - 1, c), c - 1)
		}
	}
}

