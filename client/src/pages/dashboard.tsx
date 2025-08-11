import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, DollarSign, AlertTriangle, UserPlus, ClipboardCheck, CreditCard, TrendingUp } from "lucide-react";
import { useState } from "react";
import StudentModal from "@/components/modals/student-modal";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const [showStudentModal, setShowStudentModal] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: todaysClasses } = useQuery({
    queryKey: ["/api/attendance/today"],
  });

  if (metricsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's your art student activity overview.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-50">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                <p className="text-2xl font-bold text-gray-900">{(metrics as any)?.totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-50">
                <CheckCircle className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">This Week's Attendance</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics as any)?.weeklyAttendance?.attended || 0}/{(metrics as any)?.weeklyAttendance?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-50">
                <DollarSign className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
                <p className="text-2xl font-bold text-gray-900">${(metrics as any)?.pendingPayments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Overdue Fees</h3>
                <p className="text-2xl font-bold text-gray-900">{(metrics as any)?.overdueFees || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setShowStudentModal(true)}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-primary-50 hover:bg-primary-100 border-primary-200"
              >
                <UserPlus className="h-6 w-6 text-primary-600 mb-2" />
                <span className="text-sm font-medium text-primary-700">Add Student</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-secondary-50 hover:bg-secondary-100 border-secondary-200"
              >
                <ClipboardCheck className="h-6 w-6 text-secondary-600 mb-2" />
                <span className="text-sm font-medium text-secondary-700">Mark Attendance</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-accent-50 hover:bg-accent-100 border-accent-200"
              >
                <CreditCard className="h-6 w-6 text-accent-600 mb-2" />
                <span className="text-sm font-medium text-accent-700">Record Payment</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-gray-50 hover:bg-gray-100 border-gray-200"
              >
                <TrendingUp className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysClasses && (todaysClasses as any[]).length > 0 ? (
                (todaysClasses as any[]).map((classItem: any) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{classItem.name}</p>
                        <p className="text-xs text-gray-500">{classItem.subject || 'Art Class'}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatTime(classItem.classSchedule.startTime)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No art classes scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentModal
        open={showStudentModal}
        onClose={() => setShowStudentModal(false)}
      />
    </div>
  );
}
