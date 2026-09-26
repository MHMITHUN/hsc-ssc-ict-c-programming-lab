# Pedagogy

How the lab teaches: the design follows the beginner progression from the project spec (section 37) and every lesson page implements it section by section.

```text
Concept  ->  Example  ->  Explain  ->  Try  ->  Feedback  ->  Practice
```

## The loop, and where the lesson page implements it

| Stage | What the student does | Where it lives on `/learn/[topic]` |
| --- | --- | --- |
| **Concept** | Reads a short, plain-language explanation of one idea - no formal-language walls, no copied textbook blocks. | "Learning objective" banner + "Concept" section (`ConceptText`, light Markdown rendering) |
| **Example** | Sees the syntax skeleton, then a complete runnable program with a numbered annotation on every important line. | "Syntax" code block + "Annotated example" (`AnnotatedCode` - click a line's indigo number to read its note), side-by-side sample input/output |
| **Explain** | Reads the *why*: how the sample produces its output, which mistakes beginners make here and how to fix each one. | "Common mistakes (and how to fix them)" cards; the dry-run trace explains each step in words |
| **Try** | Steps through the program's execution themselves and answers quick questions. | "Dry run: watch it happen step by step" (`DryRunTable` - step/prev/next/play over a hand-authored trace) + "Check your understanding" (inline `ConceptCheck`, instant, not saved) |
| **Feedback** | Gets corrected immediately, with the reasoning - and later, a graded quiz. | Concept checks reveal the right answer and its explanation; the topic quiz (`QuizPanel`) is graded on the server and returns per-question correctness + explanations |
| **Practice** | Transfers the idea to a new task with a different shape. | "Practice task" card linking straight to the playground; "Practise this topic" links the topic's problems, each auto-checked on run |

## Principles the content follows

1. **One idea per lesson.** The objective is a single sentence ("Write while and for loops that repeat a known number of times..."), and every section serves it.
2. **Explain like a teacher, not a manual.** Analogies come from the students' world - variables are labelled boxes, arrays are numbered seats, a file is a notebook that survives the program. Bangladeshi classroom context is used where it is natural: marks, GPA, grade letters, roll numbers, electricity-bill slabs, CGPA.
3. **Mistakes are content, not shame.** Every lesson names the three or four mistakes real beginners make ("semicolon after `for`", "forgetting `i = i + 1` causes an infinite loop") and pairs each with its fix.
4. **"Why this works" beats "memorize this".** The dry-run trace shows the loop variable and running total changing round by round - the exact skill a "trace the program" exam question tests.
5. **Practice is checked, not trusted.** Running a problem compares output against the sample case **on the server**; the client never grades itself. Quiz scores are computed from the stored answer keys.
6. **Feedback loops back to the loop.** The dashboard's "Recommended next" sends the student to the first incomplete published topic in curriculum order, and topic mastery (50% lesson completion + 50% best quiz score) shows where to revisit.

## Honest feedback (spec section 36)

Nothing pretends. Concept checks say they are private and unsaved - they are. Quiz submissions are recorded with a server-computed score. The dry-run caption says it is a hand-authored trace, not a live debugger. Demo execution says plainly when a program is not in the pre-recorded catalog. A dashboard empty of activity says so instead of showing sample numbers; when it shows numbers, they are the student's own records.

## For teachers extending the content

- Keep the loop intact when writing a new lesson: objective, concept, syntax, annotated example, mistakes, dry-run (recommended for anything with state changes), checks (2-3), practice task.
- The teacher editors accept structured fields as line formats (documented in `docs/api.md` and in the form hints): annotations as `line|note`, dry-run steps as `step|line|variable|value|explanation`, checks as blank-line-separated 4-line blocks.
- A dry-run trace must match the lesson's sample input exactly - it is a promise to the student, and the playground replays the same sample from the demo execution catalog.
- Draft lessons are invisible to students until published; publish when the example, dry-run and checks all agree.
