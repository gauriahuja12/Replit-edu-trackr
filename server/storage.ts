import {
  users,
  students,
  classSchedules,
  attendanceRecords,
  paymentRecords,
  type User,
  type UpsertUser,
  type InsertStudent,
  type Student,
  type InsertClassSchedule,
  type ClassSchedule,
  type InsertAttendanceRecord,
  type AttendanceRecord,
  type InsertPaymentRecord,
  type PaymentRecord,
  type StudentWithScheduleAndPayments,
  type AttendanceWithStudent,
  type PaymentWithStudent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Student operations
  getStudents(instructorId: string): Promise<StudentWithScheduleAndPayments[]>;
  getStudent(id: string, instructorId: string): Promise<StudentWithScheduleAndPayments | undefined>;
  createStudent(student: InsertStudent, schedule: InsertClassSchedule, instructorId: string): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>, instructorId: string): Promise<Student>;
  deleteStudent(id: string, instructorId: string): Promise<void>;

  // Class schedule operations
  getClassSchedule(studentId: string): Promise<ClassSchedule | undefined>;
  updateClassSchedule(studentId: string, schedule: Partial<InsertClassSchedule>): Promise<ClassSchedule>;

  // Attendance operations
  getAttendanceRecords(instructorId: string, startDate?: string, endDate?: string): Promise<AttendanceWithStudent[]>;
  getStudentAttendance(studentId: string, instructorId: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord>;
  getTodaysClasses(instructorId: string): Promise<Array<Student & { classSchedule: ClassSchedule; attendance?: AttendanceRecord }>>;

  // Payment operations
  getPaymentRecords(instructorId: string): Promise<PaymentWithStudent[]>;
  getStudentPayments(studentId: string, instructorId: string): Promise<PaymentRecord[]>;
  createPaymentRecord(record: InsertPaymentRecord): Promise<PaymentRecord>;
  updatePaymentRecord(id: string, record: Partial<InsertPaymentRecord>): Promise<PaymentRecord>;
  getOverduePayments(instructorId: string): Promise<PaymentWithStudent[]>;

  // Dashboard metrics
  getDashboardMetrics(instructorId: string): Promise<{
    totalStudents: number;
    weeklyAttendance: { attended: number; total: number };
    pendingPayments: number;
    overdueFees: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getStudents(instructorId: string): Promise<StudentWithScheduleAndPayments[]> {
    const result = await db
      .select({
        student: students,
        classSchedule: classSchedules,
        recentPayment: paymentRecords,
      })
      .from(students)
      .leftJoin(classSchedules, eq(students.id, classSchedules.studentId))
      .leftJoin(
        paymentRecords,
        and(
          eq(students.id, paymentRecords.studentId),
          eq(
            paymentRecords.createdAt,
            sql`(SELECT MAX(created_at) FROM ${paymentRecords} WHERE student_id = ${students.id})`
          )
        )
      )
      .where(eq(students.instructorId, instructorId))
      .orderBy(students.name);

    return result.map(row => ({
      ...row.student,
      classSchedule: row.classSchedule || undefined,
      recentPayment: row.recentPayment || undefined,
    }));
  }

  async getStudent(id: string, instructorId: string): Promise<StudentWithScheduleAndPayments | undefined> {
    const [result] = await db
      .select({
        student: students,
        classSchedule: classSchedules,
      })
      .from(students)
      .leftJoin(classSchedules, eq(students.id, classSchedules.studentId))
      .where(and(eq(students.id, id), eq(students.instructorId, instructorId)));

    if (!result) return undefined;

    return {
      ...result.student,
      classSchedule: result.classSchedule || undefined,
    };
  }

  async createStudent(
    student: InsertStudent,
    schedule: InsertClassSchedule,
    instructorId: string
  ): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values({ ...student, instructorId })
      .returning();

    await db.insert(classSchedules).values({
      ...schedule,
      studentId: newStudent.id,
    });

    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>, instructorId: string): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(and(eq(students.id, id), eq(students.instructorId, instructorId)))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string, instructorId: string): Promise<void> {
    await db.delete(students).where(and(eq(students.id, id), eq(students.instructorId, instructorId)));
  }

  async getClassSchedule(studentId: string): Promise<ClassSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(classSchedules)
      .where(eq(classSchedules.studentId, studentId));
    return schedule;
  }

  async updateClassSchedule(studentId: string, schedule: Partial<InsertClassSchedule>): Promise<ClassSchedule> {
    const [updatedSchedule] = await db
      .update(classSchedules)
      .set({ ...schedule, updatedAt: new Date() })
      .where(eq(classSchedules.studentId, studentId))
      .returning();
    return updatedSchedule;
  }

  async getAttendanceRecords(instructorId: string, startDate?: string, endDate?: string): Promise<AttendanceWithStudent[]> {
    let query = db
      .select({
        attendance: attendanceRecords,
        student: students,
      })
      .from(attendanceRecords)
      .innerJoin(students, eq(attendanceRecords.studentId, students.id))
      .where(eq(students.instructorId, instructorId))
      .orderBy(desc(attendanceRecords.classDate));

    if (startDate && endDate) {
      query = db
        .select({
          attendance: attendanceRecords,
          student: students,
        })
        .from(attendanceRecords)
        .innerJoin(students, eq(attendanceRecords.studentId, students.id))
        .where(
          and(
            eq(students.instructorId, instructorId),
            gte(attendanceRecords.classDate, startDate),
            lte(attendanceRecords.classDate, endDate)
          )
        )
        .orderBy(desc(attendanceRecords.classDate));
    }

    const result = await query;
    return result.map(row => ({ ...row.attendance, student: row.student }));
  }

  async getStudentAttendance(studentId: string, instructorId: string): Promise<AttendanceRecord[]> {
    const result = await db
      .select()
      .from(attendanceRecords)
      .innerJoin(students, eq(attendanceRecords.studentId, students.id))
      .where(and(eq(attendanceRecords.studentId, studentId), eq(students.instructorId, instructorId)))
      .orderBy(desc(attendanceRecords.classDate));

    return result.map(row => row.attendance_records);
  }

  async createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [newRecord] = await db.insert(attendanceRecords).values(record).returning();
    return newRecord;
  }

  async updateAttendanceRecord(id: string, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord> {
    const [updatedRecord] = await db
      .update(attendanceRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(attendanceRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async getTodaysClasses(instructorId: string): Promise<Array<Student & { classSchedule: ClassSchedule; attendance?: AttendanceRecord }>> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayStr = today.toISOString().split('T')[0];

    const result = await db
      .select({
        student: students,
        classSchedule: classSchedules,
        attendance: attendanceRecords,
      })
      .from(students)
      .innerJoin(classSchedules, eq(students.id, classSchedules.studentId))
      .leftJoin(
        attendanceRecords,
        and(
          eq(students.id, attendanceRecords.studentId),
          eq(attendanceRecords.classDate, todayStr)
        )
      )
      .where(
        and(
          eq(students.instructorId, instructorId),
          eq(classSchedules.dayOfWeek, dayOfWeek),
          eq(students.status, "active")
        )
      )
      .orderBy(classSchedules.startTime);

    return result.map(row => ({
      ...row.student,
      classSchedule: row.classSchedule,
      attendance: row.attendance || undefined,
    }));
  }

  async getPaymentRecords(instructorId: string): Promise<PaymentWithStudent[]> {
    const result = await db
      .select({
        payment: paymentRecords,
        student: students,
      })
      .from(paymentRecords)
      .innerJoin(students, eq(paymentRecords.studentId, students.id))
      .where(eq(students.instructorId, instructorId))
      .orderBy(desc(paymentRecords.dueDate));

    return result.map(row => ({ ...row.payment, student: row.student }));
  }

  async getStudentPayments(studentId: string, instructorId: string): Promise<PaymentRecord[]> {
    const result = await db
      .select()
      .from(paymentRecords)
      .innerJoin(students, eq(paymentRecords.studentId, students.id))
      .where(and(eq(paymentRecords.studentId, studentId), eq(students.instructorId, instructorId)))
      .orderBy(desc(paymentRecords.dueDate));

    return result.map(row => row.payment_records);
  }

  async createPaymentRecord(record: InsertPaymentRecord): Promise<PaymentRecord> {
    const [newRecord] = await db.insert(paymentRecords).values(record).returning();
    return newRecord;
  }

  async updatePaymentRecord(id: string, record: Partial<InsertPaymentRecord>): Promise<PaymentRecord> {
    const [updatedRecord] = await db
      .update(paymentRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(paymentRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async getOverduePayments(instructorId: string): Promise<PaymentWithStudent[]> {
    const today = new Date().toISOString().split('T')[0];

    const result = await db
      .select({
        payment: paymentRecords,
        student: students,
      })
      .from(paymentRecords)
      .innerJoin(students, eq(paymentRecords.studentId, students.id))
      .where(
        and(
          eq(students.instructorId, instructorId),
          eq(paymentRecords.status, "pending"),
          sql`${paymentRecords.dueDate} < ${today}`
        )
      )
      .orderBy(desc(paymentRecords.dueDate));

    return result.map(row => ({ ...row.payment, student: row.student }));
  }

  async getDashboardMetrics(instructorId: string): Promise<{
    totalStudents: number;
    weeklyAttendance: { attended: number; total: number };
    pendingPayments: number;
    overdueFees: number;
  }> {
    // Total students
    const [{ totalStudents }] = await db
      .select({ totalStudents: count() })
      .from(students)
      .where(and(eq(students.instructorId, instructorId), eq(students.status, "active")));

    // Weekly attendance
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const [{ totalWeeklyClasses }] = await db
      .select({ totalWeeklyClasses: count() })
      .from(attendanceRecords)
      .innerJoin(students, eq(attendanceRecords.studentId, students.id))
      .where(
        and(
          eq(students.instructorId, instructorId),
          gte(attendanceRecords.classDate, weekStartStr),
          lte(attendanceRecords.classDate, todayStr)
        )
      );

    const [{ attendedClasses }] = await db
      .select({ attendedClasses: count() })
      .from(attendanceRecords)
      .innerJoin(students, eq(attendanceRecords.studentId, students.id))
      .where(
        and(
          eq(students.instructorId, instructorId),
          eq(attendanceRecords.status, "attended"),
          gte(attendanceRecords.classDate, weekStartStr),
          lte(attendanceRecords.classDate, todayStr)
        )
      );

    // Pending payments
    const pendingPaymentsResult = await db
      .select({ amount: paymentRecords.amount })
      .from(paymentRecords)
      .innerJoin(students, eq(paymentRecords.studentId, students.id))
      .where(
        and(
          eq(students.instructorId, instructorId),
          eq(paymentRecords.status, "pending")
        )
      );

    const pendingPayments = pendingPaymentsResult.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    // Overdue fees
    const today = new Date().toISOString().split('T')[0];
    const [{ overdueFees }] = await db
      .select({ overdueFees: count() })
      .from(paymentRecords)
      .innerJoin(students, eq(paymentRecords.studentId, students.id))
      .where(
        and(
          eq(students.instructorId, instructorId),
          eq(paymentRecords.status, "pending"),
          sql`${paymentRecords.dueDate} < ${today}`
        )
      );

    return {
      totalStudents: totalStudents || 0,
      weeklyAttendance: {
        attended: attendedClasses || 0,
        total: totalWeeklyClasses || 0,
      },
      pendingPayments: Math.round(pendingPayments),
      overdueFees: overdueFees || 0,
    };
  }
}

export const storage = new DatabaseStorage();
