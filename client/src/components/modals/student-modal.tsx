import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StudentForm from "@/components/forms/student-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  student?: any;
}

export default function StudentModal({ open, onClose, student }: StudentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { name, email, phone, status, subject, notes, dayOfWeek, startTime, duration } = data;
      
      const studentData = { name, email, phone, status, subject, notes };
      const scheduleData = { dayOfWeek, startTime, duration };

      await apiRequest("POST", "/api/students", { student: studentData, schedule: scheduleData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Student created successfully",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create student",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { name, email, phone, status, subject, notes } = data;
      const studentData = { name, email, phone, status, subject, notes };
      await apiRequest("PUT", `/api/students/${student.id}`, studentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (student) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const initialData = student ? {
    name: student.name,
    email: student.email || "",
    phone: student.phone || "",
    status: student.status,
    subject: student.subject || "",
    notes: student.notes || "",
    dayOfWeek: student.classSchedule?.dayOfWeek || 1,
    startTime: student.classSchedule?.startTime || "14:00",
    duration: student.classSchedule?.duration || 60,
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>
        <StudentForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
