import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Students", href: "/students", icon: Users },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <nav className="mt-8 px-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    isActive
                      ? "bg-primary-50 border-r-2 border-primary-500 text-primary-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-primary-500" : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 h-5 w-5"
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
