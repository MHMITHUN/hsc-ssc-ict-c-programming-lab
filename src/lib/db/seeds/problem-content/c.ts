import type { Problem } from "../../types";

/** Problems 16-23: strings and functions/recursion. Every solution is an
 * exact, runnable C program registered in the demo execution catalog. */

export const problemsC: Problem[] = [
  {
    id: "prb-016",
    slug: "palindrome-check",
    title: "Palindrome Check",
    statement:
      "Read one word and check whether it reads the same forwards and backwards (a palindrome). Compare the first letter with the last, the second with the second-to-last, and so on, moving two indexes toward the middle - stop as soon as a pair differs. Print \"Palindrome: Yes\" or \"Palindrome: No\".",
    difficulty: "medium",
    topicSlug: "strings",
    constraints: "The word has at most 99 lowercase letters and contains no spaces.",
    sampleInput: "madam",
    sampleOutput: "Palindrome: Yes",
    hint: "Two indexes: i starts at 0, j starts at length - 1. While i < j, compare word[i] with word[j]; if any pair differs it is not a palindrome.",
    solutionExplanation:
      "First find the length by walking to the null terminator, then move j back to the last real character. The while (i < j) loop compares mirrored pairs; a single mismatch sets the flag to 0 but the loop can also return early. For \"madam\" all pairs match (m-m, a-a) and the middle 'd' is never even compared because i and j meet there - a word of odd length always leaves its middle letter unchecked, which is correct because it equals itself.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    char word[100];
    // TODO: read the word, find its length
    // TODO: compare word[i] with word[j] while i < j
    // TODO: print "Palindrome: Yes" or "Palindrome: No"
    return 0;
}`,
    expectedOutput: "Palindrome: Yes",
    status: "published",
    createdAt: "2026-04-06T09:00:00.000Z",
  },
  {
    id: "prb-017",
    slug: "prime-check",
    title: "Prime Check with a Function",
    statement:
      "Read an integer n and report whether it is prime, using a function int isPrime(int n) that returns 1 for prime and 0 otherwise. A prime has no divisor other than 1 and itself; 0 and 1 are not prime. Print \"Prime: Yes\" or \"Prime: No\".",
    difficulty: "easy",
    topicSlug: "functions",
    constraints: "0 <= n <= 1000000. Trial division up to the square root is fast enough.",
    sampleInput: "13",
    sampleOutput: "Prime: Yes",
    hint: "In the function, return 0 immediately when n < 2. Then loop i from 2 while i * i <= n and return 0 on the first exact divisor.",
    solutionExplanation:
      "The function returns 0 for n < 2, then tests divisors from 2 upward. The bound i * i <= n is the efficiency trick: if n = a * b with a <= b, then a * a <= n, so any composite number has a divisor at or below its square root - no need to walk all the way to n. For 13, i = 2 and i = 3 give 13 % i != 0 and 4 * 4 > 13 stops the loop, so the function returns 1 and main prints \"Prime: Yes\".",
    starterCode: String.raw`#include <stdio.h>

int isPrime(int n);

int main(void) {
    int n;
    scanf("%d", &n);
    // TODO: call isPrime(n) and print "Prime: Yes" or "Prime: No"
    return 0;
}

// TODO: write the isPrime function
`,
    expectedOutput: "Prime: Yes",
    status: "published",
    createdAt: "2026-04-06T09:10:00.000Z",
  },
  {
    id: "prb-018",
    slug: "gcd",
    title: "GCD of Two Numbers",
    statement:
      "Read two integers and print their greatest common divisor (GCD) computed by a function, using Euclid's algorithm: repeatedly replace (a, b) with (b, a % b) until b becomes 0; the remaining a is the GCD. Print \"GCD: x\".",
    difficulty: "easy",
    topicSlug: "functions",
    constraints: "1 <= a, b <= 1000000. Both values fit in an int.",
    sampleInput: "12 18",
    sampleOutput: "GCD: 6",
    hint: "while (b != 0) { temp = b; b = a % b; a = temp; } - then a holds the GCD.",
    solutionExplanation:
      "Euclid's algorithm works because any common divisor of a and b also divides a % b, so the pair keeps exactly the same common divisors while shrinking. Trace (12, 18): first round temp=18, b = 12 % 18 = 12, a = 18; second round temp=12, b = 18 % 12 = 6, a = 12; third round temp=6, b = 12 % 6 = 0, a = 6. Now b is 0, the loop stops, and the remaining a = 6 is the GCD.",
    starterCode: String.raw`#include <stdio.h>

int gcd(int a, int b);

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    // TODO: print "GCD: %d" using the gcd function
    return 0;
}

// TODO: implement gcd with Euclid's algorithm
`,
    expectedOutput: "GCD: 6",
    status: "published",
    createdAt: "2026-04-13T09:00:00.000Z",
  },
  {
    id: "prb-019",
    slug: "fibonacci-term",
    title: "Nth Fibonacci Term (Recursive)",
    statement:
      "The Fibonacci sequence starts 0, 1, 1, 2, 3, 5, 8, 13, ... - each term is the sum of the two before it. Using this convention fib(0) = 0 and fib(1) = 1, read n and print the n-th term with a recursive function. Print \"Fibonacci term: x\".",
    difficulty: "medium",
    topicSlug: "recursion",
    constraints: "0 <= n <= 25 (beyond that the naive recursion becomes too slow).",
    sampleInput: "7",
    sampleOutput: "Fibonacci term: 13",
    hint: "Base cases: n <= 1 returns n. Recursive case: fib(n - 1) + fib(n - 2).",
    solutionExplanation:
      "The two base cases collapse into one: for n <= 1 the function returns n itself, which hands back 0 for fib(0) and 1 for fib(1). Every larger n splits into two smaller calls, so fib(7) expands into a tree that bottoms out at the base cases and reassembles to 13. Tracing fib(4) by hand first (it returns 3) is the best way to see the two-layer recursion before attempting n = 7.",
    starterCode: String.raw`#include <stdio.h>

int fib(int n);

int main(void) {
    int n;
    scanf("%d", &n);
    // TODO: print "Fibonacci term: %d" using fib(n)
    return 0;
}

// TODO: recursive fib: base case n <= 1 returns n
`,
    expectedOutput: "Fibonacci term: 13",
    status: "published",
    createdAt: "2026-04-20T09:00:00.000Z",
  },
  {
    id: "prb-020",
    slug: "count-vowels",
    title: "Count Vowels in a Word",
    statement:
      "Read one lowercase word and count how many of its letters are vowels (a, e, i, o, u). Walk the array until the null terminator and test each character with || conditions. Print \"Vowels: x\".",
    difficulty: "easy",
    topicSlug: "strings",
    constraints: "The word has at most 99 lowercase letters; consonant-only words print 0.",
    sampleInput: "programming",
    sampleOutput: "Vowels: 3",
    hint: "One while loop to the \\0, inside it: if (word[i]=='a' || word[i]=='e' || word[i]=='i' || word[i]=='o' || word[i]=='u') count++;",
    solutionExplanation:
      "The loop from the strings lesson (stop at \\0) now carries a five-way condition. \"programming\" contains o, a and i as vowels - p r O g r A m m I n g - so the counter finishes at 3. Note the test compares single characters with ==, one per vowel; a common faster version uses strpbrk or a switch, but five || conditions is the clearest at this level.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    char word[100];
    int i = 0, count = 0;
    scanf("%s", word);
    // TODO: loop to the null terminator, counting vowels
    // TODO: print "Vowels: %d"
    return 0;
}`,
    expectedOutput: "Vowels: 3",
    status: "published",
    createdAt: "2026-04-20T09:10:00.000Z",
  },
  {
    id: "prb-021",
    slug: "string-length-manual",
    title: "String Length Without strlen",
    statement:
      "Read one word and print its length computed with your own loop - strlen and other library functions are not allowed in this task. The length is the number of characters before the null terminator. Print \"Length: x\".",
    difficulty: "easy",
    topicSlug: "strings",
    constraints: "The word has at most 99 letters, no spaces.",
    sampleInput: "Bangladesh",
    sampleOutput: "Length: 10",
    hint: "int i = 0; while (word[i] != '\\0') i = i + 1; - then i is the length.",
    solutionExplanation:
      "Starting at seat 0 and stepping until the seat holds \\0 counts exactly the real characters: B a n g l a d e s h is 10 letters, so the loop runs 10 rounds and i ends at 10. This is literally what strlen does internally - after writing it yourself, the library version is no longer magic, and the trace table from the strings lesson matches this program one-for-one.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    char word[100];
    int i = 0;
    scanf("%s", word);
    // TODO: advance i until word[i] == '\0'
    // TODO: print "Length: %d"
    return 0;
}`,
    expectedOutput: "Length: 10",
    status: "published",
    createdAt: "2026-04-27T09:00:00.000Z",
  },
  {
    id: "prb-022",
    slug: "reverse-string",
    title: "Reverse a Word",
    statement:
      "Read one word and print it reversed. Build the reversed copy by copying characters from the end of the original to the start of a second array, and remember to place the null terminator at the end before printing with %s. Print \"Reversed: x\".",
    difficulty: "easy",
    topicSlug: "strings",
    constraints: "The word has at most 99 letters, no spaces.",
    sampleInput: "hello",
    sampleOutput: "Reversed: olleh",
    hint: "After finding the length i, loop j from 0 to i-1 with reversed[j] = word[i - 1 - j]; then set reversed[i] = '\\0';",
    solutionExplanation:
      "The index formula i - 1 - j maps the last real character to seat 0, the second-to-last to seat 1, and so on - the mirror image of the array. The final reversed[i] = '\\0'; is the step everyone forgets: without it %s keeps printing past the copied letters into garbage. For \"hello\" (length 5) the copies are o l l e h plus the terminator, and printf prints \"olleh\".",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    char word[100], reversed[100];
    int i = 0, j;
    scanf("%s", word);
    // TODO: find the length in i
    // TODO: copy reversed, add '\0', print "Reversed: %s"
    return 0;
}`,
    expectedOutput: "Reversed: olleh",
    status: "published",
    createdAt: "2026-04-27T09:10:00.000Z",
  },
  {
    id: "prb-023",
    slug: "ascii-value",
    title: "ASCII Value of a Character",
    statement:
      "Read a single character and print its ASCII code. A char in C is a small integer, so printing the same variable with %d instead of %c shows the code. Print \"ASCII of c = x\" (with the actual character and its code).",
    difficulty: "easy",
    topicSlug: "strings",
    constraints: "The input is exactly one printable character.",
    sampleInput: "C",
    sampleOutput: "ASCII of C = 67",
    hint: "scanf(\"%c\", &ch); reads one character. Then printf(\"ASCII of %c = %d\\n\", ch, ch); - same variable, two format specifiers.",
    solutionExplanation:
      "This tiny program demonstrates the whole idea: ch is one byte holding the code 67, and the format specifier decides how it is shown - %c displays the letter 'C', %d displays the number 67. That is why 'A' + 1 is valid C arithmetic (it gives 'B'), and why comparing characters with < really compares their codes.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    char ch;
    scanf("%c", &ch);
    // TODO: print "ASCII of %c = %d" using ch twice
    return 0;
}`,
    expectedOutput: "ASCII of C = 67",
    status: "published",
    createdAt: "2026-05-04T09:00:00.000Z",
  },
];

/** Reference solutions for problems 16-23. */
export const solutionsC: Record<string, string> = {
  "palindrome-check": String.raw`#include <stdio.h>

int main(void) {
    char word[100];
    int i = 0, j = 0, isPalindrome = 1;
    scanf("%s", word);
    while (word[j] != '\0') {
        j = j + 1;
    }
    j = j - 1;
    while (i < j) {
        if (word[i] != word[j]) {
            isPalindrome = 0;
        }
        i = i + 1;
        j = j - 1;
    }
    if (isPalindrome == 1) {
        printf("Palindrome: Yes\n");
    } else {
        printf("Palindrome: No\n");
    }
    return 0;
}`,
  "prime-check": String.raw`#include <stdio.h>

int isPrime(int n);

int main(void) {
    int n;
    scanf("%d", &n);
    if (isPrime(n) == 1) {
        printf("Prime: Yes\n");
    } else {
        printf("Prime: No\n");
    }
    return 0;
}

int isPrime(int n) {
    int i;
    if (n < 2) {
        return 0;
    }
    for (i = 2; i * i <= n; i = i + 1) {
        if (n % i == 0) {
            return 0;
        }
    }
    return 1;
}`,
  gcd: String.raw`#include <stdio.h>

int gcd(int a, int b);

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("GCD: %d\n", gcd(a, b));
    return 0;
}

int gcd(int a, int b) {
    int temp;
    while (b != 0) {
        temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}`,
  "fibonacci-term": String.raw`#include <stdio.h>

int fib(int n);

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Fibonacci term: %d\n", fib(n));
    return 0;
}

int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}`,
  "count-vowels": String.raw`#include <stdio.h>

int main(void) {
    char word[100];
    int i = 0, count = 0;
    scanf("%s", word);
    while (word[i] != '\0') {
        if (word[i] == 'a' || word[i] == 'e' || word[i] == 'i' || word[i] == 'o' || word[i] == 'u') {
            count = count + 1;
        }
        i = i + 1;
    }
    printf("Vowels: %d\n", count);
    return 0;
}`,
  "string-length-manual": String.raw`#include <stdio.h>

int main(void) {
    char word[100];
    int i = 0;
    scanf("%s", word);
    while (word[i] != '\0') {
        i = i + 1;
    }
    printf("Length: %d\n", i);
    return 0;
}`,
  "reverse-string": String.raw`#include <stdio.h>

int main(void) {
    char word[100], reversed[100];
    int i = 0, j;
    scanf("%s", word);
    while (word[i] != '\0') {
        i = i + 1;
    }
    for (j = 0; j < i; j = j + 1) {
        reversed[j] = word[i - 1 - j];
    }
    reversed[i] = '\0';
    printf("Reversed: %s\n", reversed);
    return 0;
}`,
  "ascii-value": String.raw`#include <stdio.h>

int main(void) {
    char ch;
    scanf("%c", &ch);
    printf("ASCII of %c = %d\n", ch, ch);
    return 0;
}`,
};
