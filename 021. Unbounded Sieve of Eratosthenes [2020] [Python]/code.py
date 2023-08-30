# I know it's been too long since I programmed in Python when I reach for the semicolon button only to realize I don't need it, and then when trying to write a comment about that I try to use // instead of #

# This is a modification of the Sieve of Eratosthenes that finds primes without bound instead of only finding primes up to a specified limit.

# Here is an explanation of the algorithm here: imagine a row of numbered holes with numbered balls in them. Initially, there are no balls. You start at hole 2 and move across the holes until you've found the desired number of primes. If a hole is empty, it is a prime hole. Since you start at hole 2, and there are no balls in any of the holes, hole 2 is a prime hole. That means that 2 is a prime number. Since you are on a prime hole, put a ball with that number on it in the hole. The hole now has a ball with 2 in it. Now, regardless of the primality of the hole, move all balls in the hole a number of holes forward according to the number on the ball.

# Here is the algorithm running: there are no balls and you start at hole 2. Since there are no balls, you declare 2 a prime number and put a ball with the number 2 on it in the hole. Now, you move that ball two holes forward since it has a two on it. It is now in hole 4. Repeat with hole 3. You now have 2 and 3 as prime numbers. Now go to hole 4. There is already a ball in hole four, so it isn't prime. Now, move that ball forward. It has a 2 on it, so you move it to hole 6. Ok, now do hole 5. It has no balls, so it is a prime number. Now, 2, 3, and 5 are prime. Ok, now do hole 6. There are two balls in it, one with a two on it and one with a three on it (since it's divisble by both those numbers). Move the ball with a two in it two holes forward, to hole 8. Do the same with the other ball, moving it to hole 9. This goes on indefinitely, producing all the primes.

mainList = [[], [], []] # This is the list of "holes". Each list in mainList represents a hole and can hold "balls" (numbers)
num = 2 # This is the current hole that is being looked at
numberOfPrimes = int(input("Enter the number of primes to be found:\n> ")) # number of primes to be found
primes = [] # the list of primes found so far

while len(primes) < numberOfPrimes:
	if len(mainList[num]) == 0: # if the "hole" is empty
		mainList[num].append(num) # put a "numbered ball" (just a number) in that "hole"
		primes.append(num) # add the number to the list of primes
	
	for prime in mainList[num]: # for each "ball" in that "hole"
		if len(mainList) <= num + prime: # going to move the "ball", but must make sure the list of "holes" is long enough
			mainList += [[] for i in range(num + prime - len(mainList) + 1)] # extend the list of "holes"
		
		mainList[num + prime].append(prime) # move the "ball" (well, actually jsut copy of it leaving the old one behind)
	
	num += 1 # move to the next "hole"

print(f"\n\nHere are the first {numberOfPrimes} primes:\n{primes}")
