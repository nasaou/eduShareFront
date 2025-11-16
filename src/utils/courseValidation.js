/**
 * Course validation utilities for ensuring proper access control
 */

/**
 * Validates if a student has access to a specific course based on their group assignments
 * @param {Object} course - The course object
 * @param {Array} userGroups - Array of group IDs the user is assigned to
 * @returns {Object} Validation result with status and message
 */
export const validateCourseAccess = (course, userGroups = []) => {
  if (!course) {
    return {
      isValid: false,
      message: 'Course not found',
      type: 'error'
    };
  }

  if (!course.groupe_id) {
    return {
      isValid: false,
      message: 'Course has no assigned group',
      type: 'warning'
    };
  }

  const hasAccess = userGroups.includes(course.groupe_id);
  
  return {
    isValid: hasAccess,
    message: hasAccess 
      ? 'Access granted' 
      : 'You are not assigned to the group for this course',
    type: hasAccess ? 'success' : 'error',
    groupId: course.groupe_id
  };
};

/**
 * Filters courses based on user's group assignments
 * @param {Array} courses - Array of course objects
 * @param {Array} userGroups - Array of group IDs the user is assigned to
 * @returns {Array} Filtered courses that the user has access to
 */
export const filterCoursesByAccess = (courses, userGroups = []) => {
  if (!Array.isArray(courses) || !Array.isArray(userGroups)) {
    return [];
  }

  return courses.filter(course => {
    const validation = validateCourseAccess(course, userGroups);
    return validation.isValid;
  });
};

/**
 * Validates if courses are properly filtered for a student
 * @param {Array} courses - Array of course objects
 * @param {Array} userGroups - Array of group IDs the user is assigned to
 * @returns {Object} Validation summary
 */
export const validateCourseList = (courses, userGroups = []) => {
  if (!Array.isArray(courses)) {
    return {
      isValid: false,
      message: 'Invalid course list',
      totalCourses: 0,
      accessibleCourses: 0,
      restrictedCourses: 0
    };
  }

  const validationResults = courses.map(course => 
    validateCourseAccess(course, userGroups)
  );

  const accessibleCourses = validationResults.filter(result => result.isValid).length;
  const restrictedCourses = validationResults.filter(result => !result.isValid).length;

  return {
    isValid: restrictedCourses === 0,
    message: restrictedCourses === 0 
      ? 'All courses are properly filtered' 
      : `${restrictedCourses} courses should not be visible to this student`,
    totalCourses: courses.length,
    accessibleCourses,
    restrictedCourses,
    validationResults
  };
};

/**
 * Gets user's group information from localStorage or API
 * @returns {Promise<Array>} Array of group IDs
 */
export const getUserGroups = async () => {
  try {
    // First try to get from localStorage if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.groups && Array.isArray(user.groups)) {
      return user.groups.map(group => group.id);
    }

    // If not available, fetch from API
    const { usersService } = await import('../api/apiService');
    const response = await usersService.getMyGroups();
    
    if (response.success && response.data) {
      return response.data.map(group => group.id);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};

/**
 * Creates a validation report for debugging purposes
 * @param {Array} courses - Array of course objects
 * @param {Array} userGroups - Array of group IDs the user is assigned to
 * @returns {Object} Detailed validation report
 */
export const createValidationReport = (courses, userGroups = []) => {
  const validation = validateCourseList(courses, userGroups);
  
  return {
    timestamp: new Date().toISOString(),
    userGroups,
    validation,
    courseDetails: courses.map(course => ({
      id: course.id,
      title: course.title,
      groupId: course.groupe_id,
      validation: validateCourseAccess(course, userGroups)
    }))
  };
};