import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import axios from "axios";

// Import pages
import LoginPage from "./pages/LoginPage";
import TeacherDashboard from "./pages/teacher/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import TeacherStudents from "./pages/teacher/Students";
import TeacherCreateExam from "./pages/teacher/CreateExam";
import TeacherCheaters from "./pages/teacher/Cheaters";
import TeacherResults from "./pages/teacher/Results";
import StudentExam from "./pages/student/Exam";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Protected Route components
const ProtectedTeacherRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser || currentUser.userType !== "teacher") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ProtectedStudentRoute = ({ children }) => {
  const currentStudent = JSON.parse(localStorage.getItem("currentStudent") || "null");
  if (!currentStudent) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  // Initialize data on app start
  useEffect(() => {
    const initializeData = async () => {
      try {
        await axios.post(`${API}/init-data`);
      } catch (error) {
        console.error("Failed to initialize data:", error);
      }
    };
    initializeData();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedTeacherRoute>
                <TeacherDashboard />
              </ProtectedTeacherRoute>
            } 
          />
          <Route 
            path="/teacher/students" 
            element={
              <ProtectedTeacherRoute>
                <TeacherStudents />
              </ProtectedTeacherRoute>
            } 
          />
          <Route 
            path="/teacher/create" 
            element={
              <ProtectedTeacherRoute>
                <TeacherCreateExam />
              </ProtectedTeacherRoute>
            } 
          />
          <Route 
            path="/teacher/cheaters" 
            element={
              <ProtectedTeacherRoute>
                <TeacherCheaters />
              </ProtectedTeacherRoute>
            } 
          />
          <Route 
            path="/teacher/results/:examId" 
            element={
              <ProtectedTeacherRoute>
                <TeacherResults />
              </ProtectedTeacherRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedStudentRoute>
                <StudentDashboard />
              </ProtectedStudentRoute>
            } 
          />
          <Route 
            path="/student/exam/:examId" 
            element={
              <ProtectedStudentRoute>
                <StudentExam />
              </ProtectedStudentRoute>
            } 
          />
        </Routes>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;