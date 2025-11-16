import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderOpen,
  UsersRound,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = {
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
      { icon: Users, label: "Manage Users", path: "/dashboard/admin/users" },
      {
        icon: GraduationCap,
        label: "Manage Filieres",
        path: "/dashboard/admin/filieres",
      },
      {
        icon: UsersRound,
        label: "Manage Groupes",
        path: "/dashboard/admin/groupes",
      },
      {
        icon: Users,
        label: "Filière Assignments",
        path: "/dashboard/admin/assignments",
      },
    ],
    teacher: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/teacher" },
      {
        icon: BookOpen,
        label: "My Courses",
        path: "/dashboard/teacher/courses",
      },
    ],
    professor: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/dashboard/professor",
      },
      {
        icon: BookOpen,
        label: "My Courses",
        path: "/dashboard/professor/courses",
      },
    ],
    student: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/student" },
      {
        icon: FolderOpen,
        label: "Browse Courses",
        path: "/dashboard/student/courses",
      },
    ],
  };

  const currentNavItems = navItems[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-200 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-semibold">Edushare</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b border-border px-6 py-4">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">
              {user?.role}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-smooth ${
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-border p-4">
            <Button
              variant="outline"
              className="w-full justify-start transition-smooth"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-200 ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="transition-smooth"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold">
            {currentNavItems.find((item) => item.path === location.pathname)
              ?.label || "Dashboard"}
          </h1>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
