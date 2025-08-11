import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertStudentSchema,
  insertClassScheduleSchema,
  insertAttendanceRecordSchema,
  insertPaymentRecordSchema,
} from "@shared/schema";

// Simple middleware to simulate authentication - for development/local use
const mockAuth = (req: any, res: any, next: any) => {
  // Create a mock user for development
  req.user = {
    id: "mock-user-id",
    email: "instructor@example.com",
    firstName: "Art",
    lastName: "Instructor"
  };
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock auth routes for development
  app.get('/api/auth/user', mockAuth, async (req: any, res) => {
    try {
      let user = await storage.getUser(req.user.id);
      
      // Create mock user if doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const metrics = await storage.getDashboardMetrics(instructorId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Student routes
  app.get("/api/students", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const students = await storage.getStudents(instructorId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const student = await storage.getStudent(req.params.id, instructorId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const { student: studentData, schedule: scheduleData } = req.body;
      
      const validatedStudent = insertStudentSchema.parse(studentData);
      const validatedSchedule = insertClassScheduleSchema.parse(scheduleData);

      const student = await storage.createStudent(validatedStudent, validatedSchedule, instructorId);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData, instructorId);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      await storage.deleteStudent(req.params.id, instructorId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(400).json({ message: "Failed to delete student" });
    }
  });

  // Class schedule routes
  app.put("/api/students/:id/schedule", mockAuth, async (req: any, res) => {
    try {
      const validatedData = insertClassScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateClassSchedule(req.params.id, validatedData);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(400).json({ message: "Failed to update schedule" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const { startDate, endDate } = req.query;
      const attendance = await storage.getAttendanceRecords(
        instructorId, 
        startDate as string, 
        endDate as string
      );
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.get("/api/attendance/today", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const classes = await storage.getTodaysClasses(instructorId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching today's classes:", error);
      res.status(500).json({ message: "Failed to fetch today's classes" });
    }
  });

  app.post("/api/attendance", mockAuth, async (req: any, res) => {
    try {
      const validatedData = insertAttendanceRecordSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating attendance record:", error);
      res.status(400).json({ message: "Failed to create attendance record" });
    }
  });

  app.put("/api/attendance/:id", mockAuth, async (req: any, res) => {
    try {
      const validatedData = insertAttendanceRecordSchema.partial().parse(req.body);
      const record = await storage.updateAttendanceRecord(req.params.id, validatedData);
      res.json(record);
    } catch (error) {
      console.error("Error updating attendance record:", error);
      res.status(400).json({ message: "Failed to update attendance record" });
    }
  });

  // Payment routes
  app.get("/api/payments", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const payments = await storage.getPaymentRecords(instructorId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payment records" });
    }
  });

  app.get("/api/payments/overdue", mockAuth, async (req: any, res) => {
    try {
      const instructorId = req.user.id;
      const payments = await storage.getOverduePayments(instructorId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching overdue payments:", error);
      res.status(500).json({ message: "Failed to fetch overdue payments" });
    }
  });

  app.post("/api/payments", mockAuth, async (req: any, res) => {
    try {
      const validatedData = insertPaymentRecordSchema.parse(req.body);
      const record = await storage.createPaymentRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating payment record:", error);
      res.status(400).json({ message: "Failed to create payment record" });
    }
  });

  app.put("/api/payments/:id", mockAuth, async (req: any, res) => {
    try {
      const validatedData = insertPaymentRecordSchema.partial().parse(req.body);
      const record = await storage.updatePaymentRecord(req.params.id, validatedData);
      res.json(record);
    } catch (error) {
      console.error("Error updating payment record:", error);
      res.status(400).json({ message: "Failed to update payment record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
