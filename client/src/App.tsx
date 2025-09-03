import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";

import { useAuth } from "./hooks/useAuth";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardScreen } from "./pages/DashboardScreen";
import { BrowseEventsScreen } from "./pages/BrowseEventsScreen";
import { EventDetailsScreen } from "./pages/EventDetailsScreen";
import { AttendeeInsightsScreen } from "./pages/AttendeeInsightsScreen";
import { AllEventsAttendeeInsightsScreen } from "./pages/AllEventsAttendeeInsightsScreen";
import { UserEventsPage } from "./pages/UserEventsPage";
import { EventBookingPage } from "./pages/EventBookingPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import LogoutPage from "./pages/LogoutPage";
import { UserTicketsPage } from "./pages/UserTicketsPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";


function Router() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/logout" component={LogoutPage} />
      
      {/* Always register /tickets to avoid 404 while auth is initializing */}
      <Route path="/tickets" component={UserTicketsPage} />
      {!isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : isAdmin ? (
        // Admin routes
        <>
          <Route path="/" component={DashboardScreen} />
          <Route path="/events" component={BrowseEventsScreen} />
          <Route path="/events/:id" component={EventDetailsScreen} />
          <Route path="/events/:id/insights" component={AttendeeInsightsScreen} />
          <Route path="/insights" component={AllEventsAttendeeInsightsScreen} />
          <Route path="/notifications" component={NotificationsPage} />
        </>
      ) : (
        // Regular user routes
        <>
          <Route path="/" component={UserEventsPage} />
          <Route path="/events" component={UserEventsPage} />
          <Route path="/events/:id" component={EventBookingPage} />
          <Route path="/notifications" component={NotificationsPage} />
        </>
      )}
        {/* Common routes accessible to all authenticated users */}
        <Route path="/booking-success" component={BookingSuccessPage} />
      {/* Fallback to 404 */}
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
