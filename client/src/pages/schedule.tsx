import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Schedule() {
  const { toast } = useToast();

  const { data: students, isLoading } = useQuery({
    queryKey: ["/api/students"],
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
      }
    },
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary-100 text-secondary-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Group students by day of week
  const scheduleByDay = students?.reduce((acc: any, student: any) => {
    if (student.classSchedule) {
      const dayIndex = student.classSchedule.dayOfWeek;
      if (!acc[dayIndex]) {
        acc[dayIndex] = [];
      }
      acc[dayIndex].push({
        ...student,
        startTime: student.classSchedule.startTime,
        duration: student.classSchedule.duration,
      });
    }
    return acc;
  }, {}) || {};

  // Sort students by start time within each day
  Object.keys(scheduleByDay).forEach(day => {
    scheduleByDay[day].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Schedule</h2>
        <p className="text-gray-600">View your weekly class schedule and student assignments</p>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
          <Card key={dayIndex} className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                {getDayName(dayIndex)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {scheduleByDay[dayIndex] && scheduleByDay[dayIndex].length > 0 ? (
                  scheduleByDay[dayIndex].map((student: any) => (
                    <div
                      key={student.id}
                      className="p-2 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {student.subject}
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {formatTime(student.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {student.duration}min
                            </span>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(student.status)} text-xs ml-1`}>
                          {student.status.charAt(0).toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No classes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-50">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Active Students</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {students?.filter((s: any) => s.status === "active").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-50">
                <Clock className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Weekly Teaching Hours</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {students?.filter((s: any) => s.status === "active" && s.classSchedule)
                    .reduce((total: number, s: any) => total + s.classSchedule.duration, 0) / 60 || 0}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Trial Students</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {students?.filter((s: any) => s.status === "trial").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
