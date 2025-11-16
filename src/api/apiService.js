const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};

// Helper for multipart/form-data requests
const getMultipartAuthHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
    Accept: "application/json",
  };
};

// Generic fetch wrapper with 401 handling
const apiFetch = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, options);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};

// Authentication
export const authService = {
  async register(data) {
    const response = await apiFetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async login(email, password) {
    const response = await apiFetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  },

  async logout() {
    const response = await apiFetch("/logout", {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getProfile() {
    const response = await apiFetch("/profile", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },
};

// Export utility functions
export { apiFetch, getAuthHeaders };

// Users
export const usersService = {
  async getAll(role = null) {
    let url = "/users";
    if (role) {
      url += `?role=${encodeURIComponent(role)}`;
    }

    const response = await apiFetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getById(id) {
    const response = await apiFetch(`/users/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async create(data) {
    const response = await apiFetch("/users", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async update(id, data) {
    const response = await apiFetch(`/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async delete(id) {
    const response = await apiFetch(`/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  // Assignment methods
  async assignToGroup(userId, groupeId) {
    const response = await apiFetch(`/users/${userId}/assign-group`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ groupe_id: groupeId }),
    });
    return await response.json();
  },

  async removeFromGroup(userId, groupeId) {
    const response = await apiFetch(`/users/${userId}/remove-group`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ groupe_id: groupeId }),
    });
    return await response.json();
  },

  async assignToFiliere(userId, filiereId) {
    const response = await apiFetch(`/users/${userId}/assign-filiere`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ filiere_id: filiereId }),
    });
    return await response.json();
  },

  async removeFromFiliere(userId, filiereId) {
    const response = await apiFetch(`/users/${userId}/remove-filiere`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ filiere_id: filiereId }),
    });
    return await response.json();
  },

  async getUserGroups(userId) {
    const response = await apiFetch(`/users/${userId}/groups`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getUserFilieres(userId) {
    const response = await apiFetch(`/users/${userId}/filieres`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getMyGroups() {
    const response = await apiFetch("/my-groups", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getMyFilieres() {
    const response = await apiFetch("/my-filieres", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },
};

// Courses
export const coursesService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.per_page) queryParams.append("per_page", params.per_page);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString ? `/courses?${queryString}` : "/courses";

    const response = await apiFetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getCount() {
    const response = await apiFetch("/courses-count", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getTeacherCourses(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.per_page) queryParams.append("per_page", params.per_page);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/courses/teacher?${queryString}`
      : "/courses/teacher";

    const response = await apiFetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getById(id) {
    const response = await apiFetch(`/courses/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async create(formData) {
    const response = await apiFetch("/courses", {
      method: "POST",
      headers: getMultipartAuthHeaders(),
      body: formData,
    });
    return await response.json();
  },

  async update(id, formData) {
    const response = await apiFetch(`/courses/${id}`, {
      method: "POST",
      headers: getMultipartAuthHeaders(),
      body: formData,
    });
    return await response.json();
  },

  async delete(id) {
    const response = await apiFetch(`/courses/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async download(id) {
    try {
      const token = getAuthToken();
      const response = await apiFetch(`/courses/${id}/download`, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        const ct = response.headers.get("Content-Type") || "";
        if (ct.includes("application/json")) {
          const data = await response.json();
          const msg = data?.message || `Download failed: ${response.status}`;
          throw new Error(msg);
        }
        throw new Error(`Download failed: ${response.status}`);
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `course_${id}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  },
};

// Filieres
export const filieresService = {
  async getAll() {
    const response = await apiFetch("/filieres", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getById(id) {
    const response = await apiFetch(`/filieres/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async create(data) {
    const response = await apiFetch("/filieres", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async update(id, data) {
    const response = await apiFetch(`/filieres/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async delete(id) {
    const response = await apiFetch(`/filieres/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async assignTeachers(filiereId, teacherIds) {
    const response = await apiFetch(`/filieres/${filiereId}/assign-teachers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ teacher_ids: teacherIds }),
    });
    return await response.json();
  },

  async getTeachers(filiereId) {
    const response = await apiFetch(`/filieres/${filiereId}/teachers`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async removeTeachers(filiereId, teacherIds) {
    const response = await apiFetch(`/filieres/${filiereId}/remove-teachers`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ teacher_ids: teacherIds }),
    });
    return await response.json();
  },
};

// Groupes
export const groupesService = {
  async getAll() {
    const response = await apiFetch("/groupes", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async getById(id) {
    const response = await apiFetch(`/groupes/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  async create(data) {
    const response = await apiFetch("/groupes", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async update(id, data) {
    const response = await apiFetch(`/groupes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async delete(id) {
    const response = await apiFetch(`/groupes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },
};
