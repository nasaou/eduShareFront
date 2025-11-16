import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageFilieres from "./pages/admin/ManageFilieres";
import ManageGroupes from "./pages/admin/ManageGroupes";
import ManageFiliereAssignments from "./pages/admin/ManageFiliereAssignments";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/admin/users"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/admin/filieres"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <ManageFilieres />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/admin/groupes"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <ManageGroupes />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/admin/assignments"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <ManageFiliereAssignments />
                </PrivateRoute>
              }
            />

            {/* Teacher/Professor Routes */}
            <Route
              path="/dashboard/teacher"
              element={
                <PrivateRoute allowedRoles={["teacher", "professor"]}>
                  <TeacherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/professor"
              element={
                <PrivateRoute allowedRoles={["teacher", "professor"]}>
                  <TeacherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/teacher/courses"
              element={
                <PrivateRoute allowedRoles={["teacher", "professor"]}>
                  <TeacherCourses />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/professor/courses"
              element={
                <PrivateRoute allowedRoles={["teacher", "professor"]}>
                  <TeacherCourses />
                </PrivateRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/dashboard/student"
              element={
                <PrivateRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/student/courses"
              element={
                <PrivateRoute allowedRoles={["student"]}>
                  <StudentCourses />
                </PrivateRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
