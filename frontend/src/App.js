import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ExpertProvider } from "./context/ExpertContext";
import { RegionProvider } from "./context/RegionContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/DashboardMultiScale";
import DifferentialPage from "./pages/DifferentialPage";
import DrugsPage from "./pages/DrugsPage";
import UserManual from "./pages/UserManual";
import ExpertAuthPage from "./pages/ExpertAuthPage";
import ExpertDashboard from "./pages/ExpertDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ExperimentLab from "./pages/ExperimentLab";
import EquationsPage from "./pages/EquationsPage";
import MathModelsAdmin from "./pages/MathModelsAdmin";
import CasesPage from "./pages/CasesPage";
import FoodAnalysisPage from "./pages/FoodAnalysisPage";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Allow access to dashboard even without auth for demo purposes
  return children;
};

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/differential"
          element={
            <ProtectedRoute>
              <DifferentialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drugs"
          element={
            <ProtectedRoute>
              <DrugsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/user-manual" element={<UserManual />} />
        <Route path="/manual" element={<UserManual />} />
        <Route path="/help" element={<UserManual />} />
        
        {/* Cases Management */}
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:caseId" element={<CasesPage />} />
        
        {/* Food Analysis - Π (Pi) Tab */}
        <Route path="/food" element={<FoodAnalysisPage />} />
        <Route path="/nutrition" element={<FoodAnalysisPage />} />
        
        {/* Expert Curation System Routes */}
        <Route path="/expert-login" element={<ExpertAuthPage />} />
        <Route path="/expert" element={<ExpertDashboard />} />
        <Route path="/expert/experiments" element={<ExperimentLab />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/models" element={<MathModelsAdmin />} />
        <Route path="/equations" element={<EquationsPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider>
            <RegionProvider>
              <AuthProvider>
                <ExpertProvider>
                  <AppContent />
                </ExpertProvider>
              </AuthProvider>
            </RegionProvider>
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    </div>
  );
}

export default App;
