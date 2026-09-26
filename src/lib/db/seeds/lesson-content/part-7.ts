import type { Lesson } from "../../types";

/** Seed lessons for topics 13-14 (Structures, File Handling). */

export const part7Lessons: Lesson[] = [
  {
    id: "les-013",
    slug: "structures",
    title: "Structures: Roll, Name and Marks in One Box",
    topicSlug: "structures",
    level: "intermediate",
    audience: "HSC",
    summary:
      "Define a custom type with struct, declare variables of it, and reach fields with the dot operator - the C ancestor of records everywhere.",
    objective:
      "Define a structure type with several fields, declare a structure variable, fill its fields with scanf, and print them back using the dot operator.",
    conceptMd: `One student has a roll number, a name and marks. Three separate variables (int roll; char name[50]; float marks;) work - until you need two students, or ten, or want to pass "a student" to a function. A structure fixes that by grouping related fields under one new type:

struct Student { int roll; char name[50]; float marks; };

This defines a type, not a variable - nothing is stored yet. struct Student s; now declares s, a box with three labelled compartments inside. The dot operator reaches each compartment: s.roll is an int you can use exactly like any int, s.name is a char array you can scanf with %s, s.marks is a float.

The important mental shift: s is ONE variable with three fields, so copying it, passing it to a function, or filling it from input treats the student as a unit. struct Student t = s; copies the whole record. That is why structures are the C foundation of the "record" idea you meet again in the database chapter of your ICT course - a row of a table, with one column per field.

Filling from the keyboard is pure combination of things you already know. scanf needs the address of each field: &s.roll for the int, &s.marks for the float - but NOT &s.name, because s.name is already an array (the strings rule again). If a function must modify the record, the same pointers rule applies: pass &s and declare struct Student *sp; then sp->roll is pointer shorthand for (*sp).roll.

Why does this work? The compiler lays out the fields of a structure side by side in memory and remembers their offsets. s.roll compiles to "the seat at s's start", s.marks to "a few seats further in". You get named compartments with zero runtime cost - a structure is organisation, not extra machinery.`,
    syntax: String.raw`struct Student {              // type definition
    int roll;
    char name[50];
    float marks;
};

struct Student s;             // variable of that type
scanf("%d %s %f", &s.roll, s.name, &s.marks);  // dot reaches fields`,
    example: {
      code: String.raw`#include <stdio.h>

struct Student {
    int roll;
    char name[50];
    float marks;
};

int main(void) {
    struct Student s;
    printf("Enter roll, name and marks: ");
    scanf("%d %s %f", &s.roll, s.name, &s.marks);
    printf("Roll %d: %s got %.2f marks\n", s.roll, s.name, s.marks);
    return 0;
}`,
      annotations: [
        { line: 3, note: "A type definition - no student exists yet, only the shape." },
        { line: 10, note: "One variable with three labelled compartments inside." },
        { line: 13, note: "&s.roll and &s.marks need &; s.name is an array, so no &." },
        { line: 14, note: "Each field prints with the format specifier of its own type." },
      ],
    },
    mistakes: [
      "Stopping at the definition: struct Student { ... }; declares a type, not a variable - you still need struct Student s;. Fix: define the type above main(), declare variables inside it.",
      "Using s roll or s->roll on a non-pointer - the dot is the operator for a structure variable. Fix: s.roll; the arrow -> belongs to pointers, as in sp->roll.",
      "Writing &s.name - name is an array, and the array name is already an address. Fix: scanf(\"%s\", s.name); exactly like a plain char array.",
      "Forgetting struct in the declaration: Student s; is C++ style and plain C rejects it. Fix: struct Student s; (or add a typedef, which comes later).",
    ],
    sampleInput: "7 Nusrat 86.5",
    sampleOutput: "Enter roll, name and marks: Roll 7: Nusrat got 86.50 marks\n",
    checks: [
      {
        question: "What does struct Student { int roll; float marks; }; by itself create?",
        options: [
          "A variable named Student",
          "A new type - no variable exists yet",
          "Two global variables",
          "A function",
        ],
        answerIndex: 1,
        explanation: "The block defines a type; struct Student s; is what actually reserves memory.",
      },
      {
        question: "How do you read a mark into s.marks with scanf?",
        options: [
          "scanf(\"%f\", s.marks);",
          "scanf(\"%f\", &s.marks);",
          "scanf(\"%d\", &s.marks);",
          "scanf(\"%s\", s.marks);",
        ],
        answerIndex: 1,
        explanation: "marks is a float field, so %f and the address &s.marks are needed.",
      },
      {
        question: "Which field needs NO & in scanf?",
        options: ["s.roll", "s.marks", "s.name (a char array)", "All need &"],
        answerIndex: 2,
        explanation: "An array name is already an address - the strings rule unchanged inside a structure.",
      },
    ],
    practiceTask:
      "Define struct Book { int id; char title[50]; float price; }. Read one book, print it as \"ID x - Title - y taka\", then declare a second book, copy the first into it with one assignment, change only its price, and print both to prove the copy is independent.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-04-06T09:00:00.000Z",
    updatedAt: "2026-04-06T09:00:00.000Z",
  },
  {
    id: "les-014",
    slug: "file-handling",
    title: "File Handling: Making Results Survive the Program",
    topicSlug: "file-handling",
    level: "advanced",
    audience: "HSC",
    summary:
      "fopen with a mode, FILE *, fprintf and fgets, and the always-check-for-NULL habit that separates working file code from crashes.",
    objective:
      "Open a file for writing with fopen, write a line with fprintf, close it, reopen it for reading, read the line back with fgets, and check the FILE pointer against NULL.",
    conceptMd: `Every variable you have used so far vanishes when main() returns. Marks typed in, totals computed - gone. A file is the bridge: fopen connects your program to a named file on disk, and from then on fprintf and fgets work almost exactly like printf and the input functions you know, except the data travels to and from the file.

The pattern has four steps and they are always the same:

1. FILE *fp = fopen("note.txt", "w"); - open the file. "w" means write: create the file, wiping any existing content. "r" means read. "a" means append - add to the end without wiping.
2. Check fp against NULL. If the file cannot be opened (wrong path, disk problem), fopen returns NULL, and calling fprintf on NULL crashes the program. The check costs two lines and saves the whole run.
3. Use the file: fprintf(fp, "ICT practical is fun\\n"); writes a line - same format specifiers as printf, just with fp first. fgets(line, sizeof(line), fp); reads one line back into a char array.
4. fclose(fp); - flush and release the file. Forgetting fclose can leave the last writes unfinished, because output is buffered before it reaches the disk.

Note what did not change: %d, %f and %s still control formatting; a char array still holds what you read; the null terminator still ends strings. File handling is printf/scanf through a pipe to disk.

Why does this work? The operating system owns the disk; your program never touches it directly. fopen asks the OS for a channel to the named file and hands you a FILE * - a handle that remembers the channel, the mode and the current position. fprintf writes through that channel; fclose tells the OS you are done. The buffer explains the close-first rule: data waits in memory until the buffer fills or the file closes, whichever comes first.`,
    syntax: String.raw`FILE *fp = fopen("note.txt", "w");   // open for write
if (fp == NULL) { /* handle failure */ }
fprintf(fp, "ICT practical is fun\n"); // like printf, into the file
fclose(fp);                             // always close

fp = fopen("note.txt", "r");            // reopen for reading
fgets(line, sizeof(line), fp);          // read one line back`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    FILE *fp;
    char line[100];
    fp = fopen("note.txt", "w");
    if (fp == NULL) {
        printf("Could not open the file.\n");
        return 1;
    }
    fprintf(fp, "ICT practical is fun\n");
    fclose(fp);

    fp = fopen("note.txt", "r");
    if (fp == NULL) {
        printf("Could not open the file.\n");
        return 1;
    }
    fgets(line, sizeof(line), fp);
    fclose(fp);
    printf("Read back: %s", line);
    return 0;
}`,
      annotations: [
        { line: 5, note: "Open for writing - \"w\" creates note.txt fresh." },
        { line: 6, note: "The NULL check: opening can fail, and using a NULL fp crashes." },
        { line: 10, note: "fprintf works like printf; fp goes first, then the format." },
        { line: 11, note: "Close after writing so buffered data reaches the disk." },
        { line: 13, note: "Reopen for reading - \"r\" never wipes anything." },
        { line: 17, note: "fgets reads one line (up to the newline) into the array." },
        { line: 19, note: "The line keeps its newline, so %s without \\n prints neatly." },
      ],
    },
    mistakes: [
      "Never checking fp == NULL and calling fprintf anyway - the program crashes the moment opening fails. Fix: the two-line guard right after every fopen.",
      "Using \"w\" when you meant to keep old data - opening with \"w\" wipes the file to empty. Fix: \"a\" appends; \"r\" only reads.",
      "Forgetting fclose before the program ends - the tail of the output may never reach the disk. Fix: close every file you open, once, right after the last use.",
      "printf(\"Read back: %s\\n\", line); - fgets keeps the newline, so \\n doubles the spacing. Fix: print with %s and no \\n, or strip the newline first.",
    ],
    sampleInput: "",
    sampleOutput: "Read back: ICT practical is fun\n",
    checks: [
      {
        question: "What does fopen(\"data.txt\", \"w\") do if data.txt already exists?",
        options: [
          "Appends to it",
          "Fails",
          "Wipes it and starts an empty file",
          "Opens it read-only",
        ],
        answerIndex: 2,
        explanation: "\"w\" truncates - old content is lost. \"a\" appends, \"r\" reads.",
      },
      {
        question: "Why compare fp with NULL after fopen?",
        options: [
          "To reset the file position",
          "Because using a NULL FILE pointer crashes the program",
          "To make fopen faster",
          "NULL means the file is empty",
        ],
        answerIndex: 1,
        explanation: "fopen returns NULL when opening fails; every fprintf or fgets through NULL is a crash.",
      },
      {
        question: "Which pair matches - writing and reading a line?",
        options: [
          "printf / scanf",
          "fprintf / fgets",
          "fprint / fscan",
          "putfile / getfile",
        ],
        answerIndex: 1,
        explanation: "fprintf writes formatted text to the file; fgets reads one line back into a char array.",
      },
    ],
    practiceTask:
      "Write a program that asks for a student's roll and marks, appends one line \"roll,marks\" to \"results.txt\" with mode \"a\", closes the file, then reopens it with \"r\" and prints everything inside. Run it three times and confirm all three lines survive - that persistence is the whole point.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-04-13T09:00:00.000Z",
    updatedAt: "2026-04-13T09:00:00.000Z",
  },
];
