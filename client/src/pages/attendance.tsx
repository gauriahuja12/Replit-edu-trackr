import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, ClipboardCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Attendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentFilter, setStudentFilter] = useState("all");

  const { data: todaysClasses, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/attendance/today"],
  });

  const { data: attendanceHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/attendance"],
  });

  const attendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, notes = "" }: { studentId: string; status: string; notes?: string }) => {
      const today = new Date().toISOString().split('T')[0];
      await apiRequest("POST", "/api/attendance", {
        studentId,
        classDate: today,
        status,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      });
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
        description: "Failed to record attendance",
        variant: "destructive",
      });
    },
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "attended":
        return "bg-secondary-100 text-secondary-800";
      case "missed":
        return "bg-red-100 text-red-800";
      case "makeup_taken":
        return "bg-accent-100 text-accent-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkAttendance = (studentId: string, status: string) => {
    attendanceMutation.mutate({ studentId, status });
  };

  if (classesLoading || historyLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Student</label>
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {todaysClasses?.map((classItem: any) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="bg-secondary-600 text-white hover:bg-secondary-700">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Bulk Mark
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Classes */}
      <Card className="border-gray-200 mb-6">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-900">Today's Classes</CardTitle>
          <p className="text-sm text-gray-600">Mark attendance for scheduled classes</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {todaysClasses && todaysClasses.length > 0 ? (
              todaysClasses.map((classItem: any) => (
                <div key={classItem.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">{classItem.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatTime(classItem.classSchedule.startTime)} - {classItem.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {classItem.attendance ? (
                      <Badge className={getStatusBadgeColor(classItem.attendance.status)}>
                        <Check className="h-3 w-3 mr-1" />
                        {classItem.attendance.status.charAt(0).toUpperCase() + classItem.attendance.status.slice(1).replace('_', ' ')}
                      </Badge>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleMarkAttendance(classItem.id, "attended")}
                          disabled={attendanceMutation.isPending}
                          className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAttendance(classItem.id, "missed")}
                          disabled={attendanceMutation.isPending}
                          variant="outline"
                          className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAttendance(classItem.id, "makeup_taken")}
                          disabled={attendanceMutation.isPending}
                          variant="outline"
                          className="bg-accent-100 text-accent-700 hover:bg-accent-200 border-accent-200"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Makeup
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No classes scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-900">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory && attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record: any) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.classDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No attendance records yet.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
