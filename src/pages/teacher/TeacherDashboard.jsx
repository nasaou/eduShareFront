import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Upload, FolderOpen, Users, GraduationCap } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import MyAssignments from '../../components/MyAssignments';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: {
      total: 0,
      recent: 0,
    },
    filieres: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await dashboardService.getTeacherMetrics();
        
        if (response.success) {
          setStats(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch teacher metrics');
        }
      } catch (error) {
        console.error('Failed to fetch teacher metrics:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                <p className="text-red-700">Error loading dashboard data: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.courses.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.courses.recent} added this month
              </p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Filières</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.filieres}
              </div>
              <p className="text-xs text-muted-foreground">Assigned programs</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.students}
              </div>
              <p className="text-xs text-muted-foreground">Students in my programs</p>
            </CardContent>
          </Card>
        </div>

        <MyAssignments userRole="teacher" />

        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              Manage your educational materials and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the "My Courses" section to upload, edit, and manage your course materials.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">Upload Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Share PDFs, documents, and other educational materials with students.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <FolderOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">Organize Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    Structure your courses by modules and student groups.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">Track Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor how students interact with your course materials.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
