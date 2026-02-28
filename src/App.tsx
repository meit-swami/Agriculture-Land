import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import PropertyDetail from "./pages/PropertyDetail";
import PostProperty from "./pages/PostProperty";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscriptions from "./pages/Subscriptions";
import AdminDashboard from "./pages/AdminDashboard";
import MyProperties from "./pages/MyProperties";
import PrivatePropertyView from "./pages/PrivatePropertyView";
import BuyerLanding from "./pages/BuyerLanding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/post" element={<PostProperty />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/my-properties" element={<MyProperties />} />
              <Route path="/p/:token" element={<PrivatePropertyView />} />
              <Route path="/buyer" element={<BuyerLanding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
