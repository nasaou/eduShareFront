import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, FileText, Search } from "lucide-react";
import { coursesService, groupesService } from "../../api/apiService";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import Pagination from "../../components/ui/pagination";

const TeacherCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pdf",
    module_id: "1",
    groupe_id: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user, currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, groupesRes] = await Promise.all([
        coursesService.getTeacherCourses({
          page: currentPage,
          per_page: 10,
          search: searchTerm,
        }),
        groupesService.getAll(),
      ]);

      if (coursesRes.success) {
        setCourses(coursesRes.data || []);
        
        // Set pagination from the API response
        const pagination = coursesRes.pagination;
        if (pagination) {
          setTotalPages(pagination.last_page || 1);
        }
      }
      if (groupesRes.success) {
        setGroupes(groupesRes.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        type: course.type,
        module_id: course.module_id.toString(),
        groupe_id: course.groupe_id.toString(),
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        type: "cours",
        module_id: "1",
        groupe_id: groupes.length > 0 ? groupes[0].id.toString() : "",
      });
    }
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingCourse && !selectedFile) {
      toast.error("Please select a file");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("type", formData.type);
    formDataToSend.append("module_id", formData.module_id);
    formDataToSend.append("groupe_id", formData.groupe_id);

    if (selectedFile) {
      formDataToSend.append("file", selectedFile);
    }

    if (editingCourse) {
      formDataToSend.append("_method", "PUT");
    }

    try {
      let response;
      if (editingCourse) {
        response = await coursesService.update(
          editingCourse.id,
          formDataToSend
        );
      } else {
        response = await coursesService.create(formDataToSend);
      }

      if (response.success) {
        toast.success(
          editingCourse
            ? "Course updated successfully"
            : "Course created successfully"
        );
        fetchData();
        setDialogOpen(false);
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await coursesService.delete(id);
      if (response.success) {
        toast.success("Course deleted successfully");
        fetchData();
      } else {
        toast.error(response.message || "Failed to delete course");
      }
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getGroupeNameById = (groupeId) => {
    const groupe = groupes.find((g) => g.id === groupeId);
    return groupe ? groupe.name : "Unknown";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
            <p className="text-muted-foreground">
              Upload and manage your course materials
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-64"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="transition-smooth"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? "Edit Course" : "Upload New Course"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCourse
                      ? "Update course information"
                      : "Add a new course material"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Introduction to Programming"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the course content"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Course Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cours">Cours</SelectItem>
                          <SelectItem value="TD">TD (Travaux Dirigés)</SelectItem>
                          <SelectItem value="TP">TP (Travaux Pratiques)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupe">Groupe</Label>
                      <Select
                        value={formData.groupe_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, groupe_id: value })
                        }
                      >
                        <SelectTrigger id="groupe">
                          <SelectValue placeholder="Select groupe" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupes.map((groupe) => (
                            <SelectItem
                              key={groupe.id}
                              value={groupe.id.toString()}
                            >
                              {groupe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">
                      Course File {editingCourse && "(optional)"}
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      required={!editingCourse}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={groupes.length === 0}>
                      {editingCourse ? "Update" : "Upload"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm
                ? "No courses found matching your search"
                : "No courses uploaded yet"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {course.title}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {course.description}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block rounded-full bg-muted px-2 py-1 text-xs font-medium uppercase">
                          {course.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getGroupeNameById(course.groupe_id)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(course)}
                            className="transition-smooth"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(course.id)}
                            className="transition-smooth"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="p-4 border-t">
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
      </div>
    </DashboardLayout>
  );
};

export default TeacherCourses;
