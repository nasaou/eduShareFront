import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Download, FileText, Users, FolderOpen } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import MyAssignments from '../../components/MyAssignments';
import CourseValidationTest from '../../components/CourseValidationTest';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: {
      available: 0,
      recent: 0,
    },
    groups: 0,
    modules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await dashboardService.getStudentMetrics();
        
        if (response.success) {
          setStats(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch student metrics');
        }
      } catch (error) {
        console.error('Failed to fetch student metrics:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
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
              <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.courses.available}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.courses.recent} added this month
              </p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.groups}
              </div>
              <p className="text-xs text-muted-foreground">Assigned groups</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Modules</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.modules}
              </div>
              <p className="text-xs text-muted-foreground">Available modules</p>
            </CardContent>
          </Card>
        </div>

        <MyAssignments userRole="student" />

        <Card>
          <CardHeader>
            <CardTitle>Your Learning Resources</CardTitle>
            <CardDescription>
              Access course materials and educational content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Browse and download course materials shared by your teachers in the "Browse Courses" section.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">Course Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    Access PDFs, documents, and presentations uploaded by teachers.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <Download className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">Download Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Download materials for offline study and reference.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">Study Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Organized by modules and groups for easy navigation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Validation Test - Development Mode Only */}
        {import.meta.env.DEV && (
          <CourseValidationTest />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
