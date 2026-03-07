import React from "react";

import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Footer from "./components/Footer";
import Contact from "./components/Contact";
import SignupPage from "./page/Signup";
import LoginPage from "./page/Login";
import ForgotPasswordPage from "./page/ForgotPassword";
import TutorDashboard from "./page/TutorDashbaord";
import AdminDashboard from "./page/AdminDashboard";
import StudentDashboard from "./page/StudentDashboard";
import AboutPage from "./page/About";
import Active from "./page/Active";
import Inactive from "./page/Inactive";
import CourseDetail from "./components/Course/CourseDetail";
import CourseMarketing from "./page/CourseMarketing";
import CertificatesPage from "./page/CertificatesPage";

const ADMIN_EMAILS = ['vc2802204@gmail.com', 'techiguru.in@gmail.com'];

// Layout: pages WITH Navbar + Footer
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-20"><Outlet /></main>
    <Footer />
  </div>
);

// Admin route guard  
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin' && !ADMIN_EMAILS.includes(user?.email)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Protected route guard
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CourseProvider>
          <Routes>
            {/* PUBLIC LAYOUT (Navbar + Footer) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/active-course" element={<Active />} />
              <Route path="/inactive-course" element={<Inactive />} />
              <Route path="/active-certificates" element={<CertificatesPage />} />
              <Route path="/inactive-certificates" element={<CertificatesPage />} />
            </Route>

            {/* COURSE - Public marketing page with Navbar */}
            <Route element={<MainLayout />}>
              <Route path="/course/:id" element={<CourseMarketing />} />
            </Route>

            {/* STANDALONE PAGES (no Navbar/Footer) */}
            {/* LMS Player - private, enrolled students only */}
            <Route path="/course/:id/learn" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* PROTECTED ROUTES */}
            <Route path="/dashboard" element={<PrivateRoute><TutorDashboard /></PrivateRoute>} />
            <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <div className="text-8xl font-black text-gray-200 mb-4">404</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
                <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
                <a href="/" className="px-6 py-3 rounded-xl text-white font-semibold" style={{ background: '#a435f0' }}>← Back to Home</a>
              </div>
            } />
          </Routes>
        </CourseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
