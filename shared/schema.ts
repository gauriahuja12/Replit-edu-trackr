import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table for instructors
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  status: varchar("status").notNull().default("active"), // active, inactive, trial
  subject: varchar("subject"), // Piano, Guitar, Violin, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Class schedules
export const classSchedules = pgTable("class_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: varchar("start_time").notNull(), // HH:MM format
  duration: integer("duration").notNull(), // Duration in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance records
export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  classDate: date("class_date").notNull(),
  status: varchar("status").notNull(), // attended, missed, makeup_taken, canceled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment records
export const paymentRecords = pgTable("payment_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: varchar("status").notNull().default("pending"), // paid, pending, overdue
  paymentType: varchar("payment_type").notNull(), // monthly, per_class
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  instructor: one(users, {
    fields: [students.instructorId],
    references: [users.id],
  }),
  classSchedule: one(classSchedules),
  attendanceRecords: many(attendanceRecords),
  paymentRecords: many(paymentRecords),
}));

export const classSchedulesRelations = relations(classSchedules, ({ one }) => ({
  student: one(students, {
    fields: [classSchedules.studentId],
    references: [students.id],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  student: one(students, {
    fields: [attendanceRecords.studentId],
    references: [students.id],
  }),
}));

export const paymentRecordsRelations = relations(paymentRecords, ({ one }) => ({
  student: one(students, {
    fields: [paymentRecords.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  instructorId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassScheduleSchema = createInsertSchema(classSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentRecordSchema = createInsertSchema(paymentRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertClassSchedule = z.infer<typeof insertClassScheduleSchema>;
export type ClassSchedule = typeof classSchedules.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertPaymentRecord = z.infer<typeof insertPaymentRecordSchema>;
export type PaymentRecord = typeof paymentRecords.$inferSelect;

// Extended types for API responses
export type StudentWithScheduleAndPayments = Student & {
  classSchedule?: ClassSchedule;
  recentPayment?: PaymentRecord;
  attendanceCount?: number;
};

export type AttendanceWithStudent = AttendanceRecord & {
  student: Student;
};

export type PaymentWithStudent = PaymentRecord & {
  student: Student;
};
