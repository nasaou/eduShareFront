import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, Shield, Users } from "lucide-react";
import { validateCourseList, getUserGroups, createValidationReport } from "../utils/courseValidation";

const CourseValidationIndicator = ({ courses = [], showDetails = false, className = "" }) => {
  const [validation, setValidation] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateCourses = async () => {
      try {
        setLoading(true);
        const groups = await getUserGroups();
        setUserGroups(groups);
        
        const validationResult = validateCourseList(courses, groups);
        setValidation(validationResult);

        // Log validation report for debugging (only in development)
        if (import.meta.env.DEV) {
          const report = createValidationReport(courses, groups);
          console.log('Course Validation Report:', report);
        }
      } catch (error) {
        console.error('Error validating courses:', error);
        setValidation({
          isValid: false,
          message: 'Error validating course access',
          totalCourses: courses.length,
          accessibleCourses: 0,
          restrictedCourses: courses.length
        });
      } finally {
        setLoading(false);
      }
    };

    if (courses.length > 0) {
      validateCourses();
    } else {
      setLoading(false);
      setValidation({
        isValid: true,
        message: 'No courses to validate',
        totalCourses: 0,
        accessibleCourses: 0,
        restrictedCourses: 0
      });
    }
  }, [courses]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Shield className="h-4 w-4 animate-pulse" />
        <span>Validating course access...</span>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  const getStatusIcon = () => {
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (validation.restrictedCourses > 0) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    if (validation.isValid) return "success";
    if (validation.restrictedCourses > 0) return "destructive";
    return "warning";
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        {getStatusIcon()}
        <span className={validation.isValid ? "text-green-700" : "text-red-700"}>
          {validation.message}
        </span>
        {validation.totalCourses > 0 && (
          <Badge variant="outline" className="text-xs">
            {validation.accessibleCourses}/{validation.totalCourses} accessible
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4" />
          Course Access Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert variant={getStatusColor()}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription>{validation.message}</AlertDescription>
          </div>
        </Alert>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="font-semibold text-lg">{validation.totalCourses}</div>
            <div className="text-muted-foreground">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-green-600">{validation.accessibleCourses}</div>
            <div className="text-muted-foreground">Accessible</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg text-red-600">{validation.restrictedCourses}</div>
            <div className="text-muted-foreground">Restricted</div>
          </div>
        </div>

        {userGroups.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span>Your Groups:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {userGroups.map(groupId => (
                <Badge key={groupId} variant="secondary" className="text-xs">
                  Group {groupId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {validation.restrictedCourses > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some courses are visible that should be restricted. This may indicate a filtering issue.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseValidationIndicator;