
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Overview } from "./pages/Overview";
import { Donations } from "./pages/Donations";
import { Scholarships } from "./pages/Scholarships";
import { Events } from "./pages/Events";
import { Organizations } from "./pages/Organizations";
import { Users } from "./pages/Users";
import { ValuedPartners } from "./pages/ValuedPartners";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { VerificationPending } from "./pages/VerificationPending";
import NotFound from "./pages/NotFound";
import { useRealtimeUpdates } from "./hooks/useRealtimeUpdates";

const queryClient = new QueryClient();

const AppContent = () => {
  useRealtimeUpdates();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="donations" element={<Donations />} />
          <Route path="donations/:donationId" element={<Donations />} />
          <Route path="requests/:requestId" element={<Donations />} />
          <Route path="scholarships" element={<Scholarships />} />
          <Route path="scholarships/:scholarshipId" element={<Scholarships />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:eventId" element={<Events />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="users" element={<Users />} />
          <Route path="valued-partners" element={<ValuedPartners />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
