# Curriculum Map

The lab covers 15 topics in teaching order (defined in `src/lib/curriculum/topics.ts`). This document maps every seeded lesson, problem and quiz onto those topics, so a teacher can see exactly what exists before planning a class.

Totals: **15 lessons** (13 published, 2 drafts), **30 problems** (all published), **6 quizzes** (5 questions each).

| # | Topic | Level / Audience | Lesson | Problems | Quiz |
| --- | --- | --- | --- | --- | --- |
| 01 | Program Structure | Beginner / SSC | `program-structure` (published) | - | - |
| 02 | Variables and Data Types | Beginner / SSC+HSC | `variables-and-data-types` (published) | `area-of-rectangle` (easy), `cgpa-calc` (medium) | `quiz-variables` |
| 03 | Input / Output | Beginner / SSC+HSC | `input-output` (published) | `sum-and-average-of-two-numbers` (easy) | `quiz-io` |
| 04 | Arithmetic Operators | Beginner / SSC | `arithmetic-operators` (**draft**) | `simple-interest` (easy), `celsius-to-fahrenheit` (easy) | - |
| 05 | Conditional Statements | Beginner / SSC+HSC | `conditional-statements` (published) | `even-or-odd`, `largest-of-three`, `pass-or-fail` (easy); `leap-year`, `electricity-bill` (medium) | `quiz-conditionals` |
| 06 | Loops | Intermediate / SSC+HSC | `loops` (published) | `multiplication-table`, `sum-1-to-n`, `digit-sum` (easy); `factorial`, `reverse-number`, `pattern-pyramid` (medium) | `quiz-loops` |
| 07 | Series Problems | Intermediate / HSC | `series-problems` (**draft**) | - | - |
| 08 | Arrays | Intermediate / HSC | `arrays` (published) | `count-evens-in-array`, `max-in-array`, `linear-search` (easy); `bubble-sort`, `matrix-addition` (medium) | `quiz-arrays` |
| 09 | Strings | Intermediate / HSC | `strings` (published) | `count-vowels`, `string-length-manual`, `reverse-string`, `ascii-value` (easy); `palindrome-check` (medium) | - |
| 10 | Functions | Intermediate / HSC | `functions` (published) | `prime-check`, `gcd` (easy) | `quiz-functions-basics` |
| 11 | Recursion | Advanced / HSC | `recursion` (published) | `fibonacci-term` (medium) | - |
| 12 | Pointers | Advanced / HSC | `pointers` (published) | `swap-two-numbers` (easy) | - |
| 13 | Structures | Intermediate / HSC | `structures` (published) | - | - |
| 14 | File Handling | Advanced / HSC | `file-handling` (published) | - | - |
| 15 | Debugging | Intermediate / SSC+HSC | `debugging` (published) | - | - |

## Notes for teachers

- **Draft topics (04, 07)** still appear on `/learn` as "lesson coming soon", and their problems (for topic 04) are listed on the topic page and in the problem library. Publishing the drafts from the teacher editor requires no other change - the topic page picks the lesson up automatically.
- **Topics without a quiz** (01, 04, 07, 09, 11-15) show no quiz section on the lesson page; quizzes are standalone and can be authored independently of lessons.
- **Problem difficulty spread**: 20 easy, 10 medium, 0 hard. Easy problems fit SSC-level introductions; medium ones (leap year, factorial, reverse a number, palindrome, fibonacci, bubble sort, matrix addition, electricity bill, CGPA, pyramid) fit HSC practice and lab exams.
- Every lesson carries 3 inline concept checks; every published lesson's example output is replayable in the playground via the demo execution catalog.

## SSC / HSC alignment

This map is **designed to complement common SSC/HSC ICT and introductory CSE learning outcomes**: the topic order follows the chapter order used by the mainstream SSC and HSC ICT practical curriculum in Bangladesh (first program -> variables -> I/O -> operators -> conditionals -> loops -> series -> arrays -> strings -> functions -> recursion -> pointers -> structures -> files -> debugging). The audience tags (SSC / HSC / both) mirror where each topic typically appears in those courses. No affiliation with or endorsement by any education board is claimed or implied.

Where the lab uses local context, it mirrors what students actually see in exams: GPA and grade-letter calculations, pass/fail checks, electricity-bill slab rates, CGPA of four courses, roll/name/marks records, and the classic HSC series and dry-run traces.
