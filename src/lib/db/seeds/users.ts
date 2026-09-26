import type { Role } from "../types";

/**
 * Demo user seed definitions. Passwords are scrypt-hashed at seed time
 * (see demo-store.ts ensureSeeded) — never store real hashes here.
 * Demo password for every account: Demo@12345
 */

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string; // fixed ISO dates in January 2026
}

export const DEMO_PASSWORD = "Demo@12345";

export const seedUsers: SeedUser[] = [
  {
    id: "usr-admin-01",
    name: "MD Mahamudul Hasan",
    email: "admin@demo.local",
    role: "ADMIN",
    createdAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "usr-teacher-01",
    name: "Nusrat Jahan",
    email: "teacher@demo.local",
    role: "TEACHER",
    createdAt: "2026-01-03T09:00:00.000Z",
  },
  {
    id: "usr-teacher-02",
    name: "Tanvir Ahmed",
    email: "tanvir.teacher@demo.local",
    role: "TEACHER",
    createdAt: "2026-01-03T10:00:00.000Z",
  },
  {
    id: "usr-teacher-03",
    name: "Shamima Akter",
    email: "shamima.teacher@demo.local",
    role: "TEACHER",
    createdAt: "2026-01-04T09:00:00.000Z",
  },
  {
    id: "usr-student-01",
    name: "Rakib Hasan",
    email: "student@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
  {
    id: "usr-student-02",
    name: "Sumaiya Islam",
    email: "sumaiya@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-05T09:30:00.000Z",
  },
  {
    id: "usr-student-03",
    name: "Arif Chowdhury",
    email: "arif@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-05T10:00:00.000Z",
  },
  {
    id: "usr-student-04",
    name: "Mehjabin Rahman",
    email: "mehjabin@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-06T09:00:00.000Z",
  },
  {
    id: "usr-student-05",
    name: "Sabbir Hossain",
    email: "sabbir@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-06T09:30:00.000Z",
  },
  {
    id: "usr-student-06",
    name: "Farhana Yasmin",
    email: "farhana@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-07T09:00:00.000Z",
  },
  {
    id: "usr-student-07",
    name: "Imran Kabir",
    email: "imran@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-07T09:30:00.000Z",
  },
  {
    id: "usr-student-08",
    name: "Tasnim Alam",
    email: "tasnim@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-08T09:00:00.000Z",
  },
  {
    id: "usr-student-09",
    name: "Jubayer Siddique",
    email: "jubayer@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-08T09:30:00.000Z",
  },
  {
    id: "usr-student-10",
    name: "Nabila Sultana",
    email: "nabila@demo.local",
    role: "STUDENT",
    createdAt: "2026-01-09T09:00:00.000Z",
  },
];
