import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./home/HomePage";
import Blog from "./home/BlogPage";
import CompanyPage from "./home/CompanyPage";
import DemoPage from "./home/DemoPage";
import FeaturesPage from "./home/FeaturesPage";
import PricingPage from "./home/PricingPage";
import PrivacyPage from "./home/PrivacyPage";
import TermsPage from "./home/TermsPage";
import ContactPage from "./home/ContactPage";

import Login from "./login/login";
import SignUp from "./signup/signup";
import Dashboard from "./dashboard/Dashboard";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import ResetPassword from "./reset-password/resetPassword";
import CreateProject from "./project/CreateProject";

import "./App.css";
import "highlight.js/styles/github-dark.css";
import Account from "./account/account";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — redirect to dashboard if user is already logged in */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/blog"
            element={
              <PublicRoute>
                <Blog />
              </PublicRoute>
            }
          />
          <Route
            path="/company"
            element={
              <PublicRoute>
                <CompanyPage />
              </PublicRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicRoute>
                <ContactPage />
              </PublicRoute>
            }
          />
          <Route
            path="/demo"
            element={
              <PublicRoute>
                <DemoPage />
              </PublicRoute>
            }
          />
          <Route
            path="/features"
            element={
              <PublicRoute>
                <FeaturesPage />
              </PublicRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PublicRoute>
                <PricingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <PublicRoute>
                <PrivacyPage />
              </PublicRoute>
            }
          />
          <Route
            path="/terms"
            element={
              <PublicRoute>
                <TermsPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected routes — only for authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/:project_id/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/create"
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
