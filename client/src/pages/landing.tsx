import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Users, Calendar, CreditCard, BarChart3, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary-600 flex items-center">
                  <Palette className="h-6 w-6 mr-2" />
                  ArtStudio Pro
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-primary-600 hover:bg-primary-700 text-white"
                onClick={() => window.location.href = '/'}
              >
                Enter App
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Streamline Your Art Instruction Studio
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage art students, track class attendance, handle payments, and grow your art teaching practice with our comprehensive studio management system.
          </p>
          <Button 
            size="lg" 
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/'}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Manage Your Art Students
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary-600 mb-4" />
                <CardTitle className="text-gray-900">Student Management</CardTitle>
                <CardDescription>
                  Keep detailed records of all your art students including contact information, class schedules, and artistic progress notes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <Calendar className="h-10 w-10 text-secondary-600 mb-4" />
                <CardTitle className="text-gray-900">Schedule & Attendance</CardTitle>
                <CardDescription>
                  Track art class schedules, mark attendance, and manage makeup sessions with an intuitive calendar interface.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-accent-600 mb-4" />
                <CardTitle className="text-gray-900">Payment Tracking</CardTitle>
                <CardDescription>
                  Monitor payment status, track overdue fees, and generate invoices for both monthly and per-session billing for art classes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary-600 mb-4" />
                <CardTitle className="text-gray-900">Reports & Analytics</CardTitle>
                <CardDescription>
                  Get insights into your art studio with detailed reports on attendance rates, revenue, and student artistic development.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-secondary-600 mb-4" />
                <CardTitle className="text-gray-900">Trial Management</CardTitle>
                <CardDescription>
                  Easily manage trial students and convert them to regular art classes with streamlined workflow.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <Palette className="h-10 w-10 text-accent-600 mb-4" />
                <CardTitle className="text-gray-900">Multi-Medium Support</CardTitle>
                <CardDescription>
                  Support for drawing, painting, sculpture, digital art, and other mediums with customizable class types and pricing.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Art Studio?
          </h3>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of art instructors who have streamlined their studios with ArtStudio Pro.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 text-lg"
            onClick={() => window.location.href = '/'}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2023 ArtStudio Pro. Built for art instructors, by art instructors.</p>
        </div>
      </footer>
    </div>
  );
}
