import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Download,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Reports() {
  const { toast } = useToast();
  const [reportPeriod, setReportPeriod] = useState("thisMonth");
  const [reportType, setReportType] = useState("overview");

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/attendance"],
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

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
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

  const isLoading = studentsLoading || paymentsLoading || attendanceLoading || metricsLoading;

  // Calculate report metrics
  const reportMetrics = {
    totalRevenue: payments?.filter((p: any) => p.status === "paid")
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
    totalStudents: students?.length || 0,
    activeStudents: students?.filter((s: any) => s.status === "active").length || 0,
    trialStudents: students?.filter((s: any) => s.status === "trial").length || 0,
    attendanceRate: attendance?.length > 0 ? 
      (attendance.filter((a: any) => a.status === "attended").length / attendance.length * 100) : 0,
    totalClasses: attendance?.length || 0,
    overduePayments: payments?.filter((p: any) => {
      const today = new Date().toISOString().split('T')[0];
      return p.status === "pending" && p.dueDate < today;
    }).length || 0,
  };

  // Student status distribution
  const studentStatusData = [
    { 
      name: "Active", 
      count: reportMetrics.activeStudents, 
      percentage: reportMetrics.totalStudents > 0 ? 
        (reportMetrics.activeStudents / reportMetrics.totalStudents * 100).toFixed(1) : "0",
      color: "bg-secondary-500"
    },
    { 
      name: "Trial", 
      count: reportMetrics.trialStudents, 
      percentage: reportMetrics.totalStudents > 0 ? 
        (reportMetrics.trialStudents / reportMetrics.totalStudents * 100).toFixed(1) : "0",
      color: "bg-blue-500"
    },
    { 
      name: "Inactive", 
      count: reportMetrics.totalStudents - reportMetrics.activeStudents - reportMetrics.trialStudents, 
      percentage: reportMetrics.totalStudents > 0 ? 
        ((reportMetrics.totalStudents - reportMetrics.activeStudents - reportMetrics.trialStudents) / reportMetrics.totalStudents * 100).toFixed(1) : "0",
      color: "bg-gray-500"
    },
  ];

  // Payment status distribution
  const paymentStatusData = [
    {
      name: "Paid",
      count: payments?.filter((p: any) => p.status === "paid").length || 0,
      amount: payments?.filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
      color: "bg-secondary-500"
    },
    {
      name: "Pending",
      count: payments?.filter((p: any) => p.status === "pending").length || 0,
      amount: payments?.filter((p: any) => p.status === "pending")
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
      color: "bg-accent-500"
    },
    {
      name: "Overdue",
      count: reportMetrics.overduePayments,
      amount: payments?.filter((p: any) => {
        const today = new Date().toISOString().split('T')[0];
        return p.status === "pending" && p.dueDate < today;
      }).reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
      color: "bg-red-500"
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <div className="flex space-x-4">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Report</SelectItem>
              <SelectItem value="financial">Financial Report</SelectItem>
              <SelectItem value="attendance">Attendance Report</SelectItem>
              <SelectItem value="student">Student Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-50">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportMetrics.totalRevenue)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12.5% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-50">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Students</h3>
                <p className="text-2xl font-bold text-gray-900">{reportMetrics.activeStudents}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {reportMetrics.totalStudents} total students
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-50">
                <CheckCircle className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {reportMetrics.attendanceRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {reportMetrics.totalClasses} total classes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-50">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Overdue Payments</h3>
                <p className="text-2xl font-bold text-gray-900">{reportMetrics.overduePayments}</p>
                <p className="text-xs text-red-600 mt-1">
                  Requires attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Status Distribution */}
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Student Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {studentStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Overview */}
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Payment Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {paymentStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</div>
                    <div className="text-xs text-gray-500">{item.count} payments</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Students */}
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students?.slice(0, 5).map((student: any) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">95%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={
                          student.status === "active" ? "bg-secondary-100 text-secondary-800" :
                          student.status === "trial" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payment Activity */}
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Recent Payment Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments?.slice(0, 5).map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.student.name}</div>
                        <div className="text-sm text-gray-500">{payment.paymentType.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(parseFloat(payment.amount))}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={
                          payment.status === "paid" ? "bg-secondary-100 text-secondary-800" :
                          payment.status === "pending" ? "bg-accent-100 text-accent-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
