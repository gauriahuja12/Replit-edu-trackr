import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, Plus, Eye, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Payments() {
  const { toast } = useToast();
  
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentPeriodFilter, setPaymentPeriodFilter] = useState("all");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  // Calculate payment metrics
  const paymentMetrics = payments ? {
    totalCollected: payments
      .filter((p: any) => p.status === "paid")
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
    pending: payments
      .filter((p: any) => p.status === "pending")
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
    overdue: payments?.filter((p: any) => {
      const today = new Date().toISOString().split('T')[0];
      return p.status === "pending" && p.dueDate < today;
    }).length || 0,
  } : { totalCollected: 0, pending: 0, overdue: 0 };

  const filteredPayments = payments?.filter((payment: any) => {
    const matchesSearch = payment.student.name.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesStatus = !paymentStatusFilter || payment.status === paymentStatusFilter;
    // TODO: Implement period filtering based on paymentPeriodFilter
    return matchesSearch && matchesStatus;
  }) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeColor = (status: string, dueDate?: string) => {
    if (status === "paid") {
      return "bg-secondary-100 text-secondary-800";
    } else if (status === "pending") {
      const today = new Date().toISOString().split('T')[0];
      if (dueDate && dueDate < today) {
        return "bg-red-100 text-red-800";
      }
      return "bg-accent-100 text-accent-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string, dueDate?: string) => {
    if (status === "paid") {
      return "Paid";
    } else if (status === "pending") {
      const today = new Date().toISOString().split('T')[0];
      if (dueDate && dueDate < today) {
        return "Overdue";
      }
      return "Pending";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-50">
                <CheckCircle className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Collected</h3>
                <p className="text-2xl font-bold text-gray-900">${paymentMetrics.totalCollected.toFixed(0)}</p>
                <p className="text-xs text-gray-400">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-50">
                <Clock className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">${paymentMetrics.pending.toFixed(0)}</p>
                <p className="text-xs text-gray-400">
                  {payments?.filter((p: any) => p.status === "pending").length || 0} students
                </p>
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
                <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
                <p className="text-2xl font-bold text-gray-900">{paymentMetrics.overdue}</p>
                <p className="text-xs text-gray-400">students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by student name..."
            value={paymentSearch}
            onChange={(e) => setPaymentSearch(e.target.value)}
          />
        </div>
        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentPeriodFilter} onValueChange={setPaymentPeriodFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.student.name}</div>
                            <div className="text-sm text-gray-500">{payment.paymentType.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${parseFloat(payment.amount).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(payment.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(payment.status, payment.dueDate)}>
                          {getStatusLabel(payment.status, payment.dueDate)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {payment.paymentType.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        {paymentSearch || paymentStatusFilter ? 
                          "No payments found matching your filters" : 
                          "No payment records yet."
                        }
                      </div>
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
