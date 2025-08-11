import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Schedule from "@/pages/schedule";
import Attendance from "@/pages/attendance";
import Payments from "@/pages/payments";
import Reports from "@/pages/reports";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  // For demo/development purposes, we'll show the landing page at root
  // and the app at other routes, making it easy to access both
  
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/">
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex h-screen pt-16">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Dashboard />
            </main>
          </div>
        </div>
      </Route>
      <Route path="/students">
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex h-screen pt-16">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Students />
            </main>
          </div>
        </div>
      </Route>
      <Route path="/schedule">
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex h-screen pt-16">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Schedule />
            </main>
          </div>
        </div>
      </Route>
      <Route path="/attendance">
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex h-screen pt-16">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Attendance />
            </main>
          </div>
        </div>
      </Route>
      <Route path="/payments">
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex h-screen pt-16">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Payments />
            </main>
          </div>
        </div>
      </Route>
      <Route path="/reports">
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex h-screen pt-16">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Reports />
            </main>
          </div>
        </div>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
