import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import UserAssignmentDialog from "../../components/UserAssignmentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Filter, Users } from "lucide-react";
import { usersService } from "../../api/apiService";
import { toast } from "sonner";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [assigningUser, setAssigningUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all"); // New state for role filter
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]); // Add roleFilter as dependency

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll(
        roleFilter === "all" ? null : roleFilter
      );
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
      });
    }
    setDialogOpen(true);
  };

  const handleOpenAssignmentDialog = (user) => {
    setAssigningUser(user);
    setAssignmentDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        const response = await usersService.update(editingUser.id, updateData);
        if (response.success) {
          toast.success("User updated successfully");
          fetchUsers();
          setDialogOpen(false);
        } else {
          toast.error(response.message || "Failed to update user");
        }
      } else {
        const response = await usersService.create(formData);
        if (response.success) {
          toast.success("User created successfully");
          fetchUsers();
          setDialogOpen(false);
        } else {
          toast.error(response.message || "Failed to create user");
        }
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await usersService.delete(id);
      if (response.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manage Users</h2>
            <p className="text-muted-foreground">
              Create, edit, and delete user accounts
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="transition-smooth"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Edit User" : "Create New User"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Update user information"
                    : "Add a new user to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser && "(leave blank to keep current)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="role-filter" className="text-sm font-medium">
              Filter by Role:
            </Label>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger id="role-filter" className="w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-block rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Assignment button - only for students and teachers */}
                        {(user.role === 'student' || user.role === 'teacher') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenAssignmentDialog(user)}
                            className="transition-smooth"
                            title={`Manage ${user.role === 'student' ? 'groups' : 'filières'}`}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(user)}
                          className="transition-smooth"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
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
          )}
        </div>
      </div>

      {/* User Assignment Dialog */}
      <UserAssignmentDialog
        user={assigningUser}
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
      />
    </DashboardLayout>
  );
};

export default ManageUsers;
