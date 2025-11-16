import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, FileText, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { coursesService } from "../../api/apiService";
import { toast } from "sonner";
import Pagination from "../../components/ui/pagination";
import CourseValidationIndicator from "../../components/CourseValidationIndicator";
import { validateCourseList, getUserGroups } from "../../utils/courseValidation";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [validationEnabled, setValidationEnabled] = useState(import.meta.env.DEV || false);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchQuery]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Note: For students, the backend automatically filters courses based on their assigned groups
      // The /courses endpoint for students routes to CourseController::studentCourses
      const response = await coursesService.getAll({
        page: currentPage,
        per_page: 12,
        search: searchQuery,
      });
      if (response.success) {
        setCourses(response.data?.data || []);
        const totalItems = response.data?.total || 0;
        const perPage = response.data?.per_page || 12;
        setTotalPages(Math.ceil(totalItems / perPage));

        // Validate courses in development mode
        if (import.meta.env.DEV) {
          const userGroups = await getUserGroups();
          const validation = validateCourseList(response.data?.data || [], userGroups);
          if (!validation.isValid) {
            console.warn('Course validation failed:', validation);
            toast.warning(`Course filtering issue detected: ${validation.message}`);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDownload = async (course) => {
    try {
      await coursesService.download(course.id);
      toast.success("Download started");
    } catch (error) {
      toast.error(error?.message || "Download failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Browse Courses</h2>
          <p className="text-muted-foreground">
            Access and download course materials
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        {/* Course Validation Indicator - shown in development mode */}
        {validationEnabled && courses.length > 0 && (
          <CourseValidationIndicator 
            courses={courses} 
            showDetails={true}
            className="border-blue-200 bg-blue-50"
          />
        )}

        {/* Quick validation status for all users */}
        {courses.length > 0 && (
          <CourseValidationIndicator 
            courses={courses} 
            showDetails={false}
            className="text-sm"
          />
        )}

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No courses match your search"
              : "No courses available yet"}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="transition-smooth hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">
                          {course.title}
                        </CardTitle>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium uppercase">
                        {course.type}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <p>Module ID: {course.module_id}</p>
                        <p>Group ID: {course.groupe_id}</p>
                      </div>
                      <Button
                        className="w-full transition-smooth"
                        onClick={() => handleDownload(course)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
