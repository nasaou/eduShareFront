import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube, Play, CheckCircle, XCircle } from "lucide-react";
import { 
  validateCourseAccess, 
  filterCoursesByAccess, 
  validateCourseList, 
  getUserGroups,
  createValidationReport 
} from "../utils/courseValidation";
import { coursesService } from "../api/apiService";

const CourseValidationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    // Load user groups on component mount
    const loadUserGroups = async () => {
      try {
        const groups = await getUserGroups();
        setUserGroups(groups);
      } catch (error) {
        console.error('Error loading user groups:', error);
      }
    };
    loadUserGroups();
  }, []);

  const runValidationTests = async () => {
    setIsRunning(true);
    const results = [];

    try {
      // Test 1: Validate individual course access
      const testCourse1 = { id: 1, title: "Test Course 1", groupe_id: 1 };
      const testCourse2 = { id: 2, title: "Test Course 2", groupe_id: 999 }; // Non-existent group
      
      const access1 = validateCourseAccess(testCourse1, userGroups);
      const access2 = validateCourseAccess(testCourse2, userGroups);
      
      results.push({
        test: "Individual Course Access Validation",
        passed: access1.isValid === userGroups.includes(1) && !access2.isValid,
        details: `Course 1 (Group 1): ${access1.message}, Course 2 (Group 999): ${access2.message}`
      });

      // Test 2: Filter courses by access
      const testCourses = [
        { id: 1, title: "Accessible Course", groupe_id: userGroups[0] || 1 },
        { id: 2, title: "Restricted Course", groupe_id: 999 }
      ];
      
      const filteredCourses = filterCoursesByAccess(testCourses, userGroups);
      const expectedCount = userGroups.includes(testCourses[0].groupe_id) ? 1 : 0;
      
      results.push({
        test: "Course Filtering",
        passed: filteredCourses.length === expectedCount,
        details: `Filtered ${filteredCourses.length} courses from ${testCourses.length} total`
      });

      // Test 3: Validate course list
      const validation = validateCourseList(testCourses, userGroups);
      
      results.push({
        test: "Course List Validation",
        passed: validation.restrictedCourses === 1, // Should detect 1 restricted course
        details: `${validation.accessibleCourses} accessible, ${validation.restrictedCourses} restricted`
      });

      // Test 4: Fetch real courses and validate
      try {
        const response = await coursesService.getAll({ per_page: 5 });
        if (response.success && response.data?.data) {
          const realValidation = validateCourseList(response.data.data, userGroups);
          
          results.push({
            test: "Real Course Data Validation",
            passed: realValidation.isValid,
            details: `${realValidation.totalCourses} total courses, ${realValidation.restrictedCourses} should be restricted`
          });

          // Generate validation report
          const report = createValidationReport(response.data.data, userGroups);
          console.log('Validation Report:', report);
        }
      } catch (error) {
        results.push({
          test: "Real Course Data Validation",
          passed: false,
          details: `Error fetching courses: ${error.message}`
        });
      }

    } catch (error) {
      results.push({
        test: "Test Execution",
        passed: false,
        details: `Error running tests: ${error.message}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Course Validation Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            User Groups: {userGroups.length > 0 ? userGroups.join(", ") : "None"}
          </div>
          <Button 
            onClick={runValidationTests} 
            disabled={isRunning}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run Tests"}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <Alert key={index} variant={result.passed ? "default" : "destructive"}>
                <div className="flex items-start gap-2">
                  {result.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <AlertDescription className="mt-1">
                      {result.details}
                    </AlertDescription>
                  </div>
                  <Badge variant={result.passed ? "success" : "destructive"}>
                    {result.passed ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <AlertDescription>
            This test component validates that course filtering is working correctly for students.
            It should only be visible in development mode.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CourseValidationTest;