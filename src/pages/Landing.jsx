import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground">
            Edushare
          </h1>
          <p className="mb-12 text-xl text-muted-foreground">
            The modern platform for educational resource sharing. Connect students, teachers, and administrators in one elegant space.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="transition-smooth">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="transition-smooth">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">For Students</h3>
              <p className="text-muted-foreground">
                Access course materials, download resources, and stay connected with your learning journey.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">For Teachers</h3>
              <p className="text-muted-foreground">
                Upload and manage course content, organize materials, and share knowledge effortlessly.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">For Admins</h3>
              <p className="text-muted-foreground">
                Manage users, organize programs, and maintain a structured educational environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Edushare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
