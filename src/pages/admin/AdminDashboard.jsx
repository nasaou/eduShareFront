import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, UsersRound, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { dashboardService } from '@/api/dashboardService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      students: 0,
      teachers: 0,
      admins: 0,
    },
    courses: {
      total: 0,
      recent: 0,
    },
    filieres: 0,
    groupes: 0,
    modules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await dashboardService.getAdminMetrics();
        
        if (response.success) {
          setStats(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch admin metrics');
        }
      } catch (error) {
        console.error('Failed to fetch admin metrics:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      description: `${stats.users.students} students, ${stats.users.teachers} teachers, ${stats.users.admins} admins`,
      icon: Users,
    },
    {
      title: 'Filieres',
      value: stats.filieres,
      description: 'Academic programs',
      icon: GraduationCap,
    },
    {
      title: 'Groupes',
      value: stats.groupes,
      description: 'Student groups',
      icon: UsersRound,
    },
    {
      title: 'Courses',
      value: stats.courses.total,
      description: `${stats.courses.recent} added this month`,
      icon: BookOpen,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of the educational platform statistics
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="transition-smooth hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Edushare</CardTitle>
            <CardDescription>
              Manage your educational platform from this admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the navigation menu to manage users, filieres, groupes, and monitor platform activity.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Create, edit, and manage user accounts with different roles.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 font-semibold">Academic Programs</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize filieres and groupes for structured learning.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 font-semibold">Platform Oversight</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor activity and ensure smooth operations.
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

export default AdminDashboard;
