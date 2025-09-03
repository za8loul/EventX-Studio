import { Button } from "../components/ui/button";
import { Calendar, Users, BarChart3 } from "lucide-react";

export function LandingPage() {
  function handleLoginClick() {
    window.location.href = "/login";
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">EventManager</h1>
          </div>
          <Button 
            onClick={handleLoginClick}
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6" data-testid="text-hero-title">
          Manage Events Like a Pro
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
          Complete event management platform with analytics, booking system, and seat selection. 
          Perfect for administrators managing events and users booking tickets.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="card-feature-analytics">
            <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics & Insights</h3>
            <p className="text-gray-600">Track attendee demographics, engagement metrics, and revenue insights.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="card-feature-booking">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Booking</h3>
            <p className="text-gray-600">Interactive seat selection with real-time availability and QR tickets.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md" data-testid="card-feature-management">
            <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Event Management</h3>
            <p className="text-gray-600">Create, manage, and track events with comprehensive admin tools.</p>
          </div>
        </div>

        <Button 
          size="lg" 
          onClick={handleLoginClick}
          data-testid="button-get-started"
        >
          Get Started
        </Button>
        <div className="mt-4 text-sm text-gray-600">
          New here? <a href="/signup" className="underline">Create an account</a>
        </div>
      </main>
    </div>
  );
}