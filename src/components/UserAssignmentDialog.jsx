import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import {
  usersService,
  groupesService,
  filieresService,
} from "../api/apiService";
import { toast } from "sonner";

const UserAssignmentDialog = ({ user, open, onOpenChange }) => {
  const [userGroups, setUserGroups] = useState([]);
  const [userFilieres, setUserFilieres] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableFilieres, setAvailableFilieres] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUserAssignments();
      fetchAvailableOptions();
    }
  }, [open, user]);

  const fetchUserAssignments = async () => {
    try {
      setLoading(true);

      // Fetch user's current groups
      const groupsResponse = await usersService.getUserGroups(user.id);
      if (groupsResponse.success) {
        setUserGroups(groupsResponse.data || []);
      }

      // Fetch user's current filières (only for teachers)
      if (user.role === "teacher") {
        const filieresResponse = await usersService.getUserFilieres(user.id);
        if (filieresResponse.success) {
          setUserFilieres(filieresResponse.data || []);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch user assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOptions = async () => {
    try {
      // Fetch all groups (for students)
      if (user.role === "student") {
        const groupsResponse = await groupesService.getAll();
        if (groupsResponse.success) {
          setAvailableGroups(groupsResponse.data || []);
        }
      }

      // Fetch all filières (for teachers)
      if (user.role === "teacher") {
        const filieresResponse = await filieresService.getAll();
        if (filieresResponse.success) {
          setAvailableFilieres(filieresResponse.data || []);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch available options");
    }
  };

  const handleAssignGroup = async () => {
    if (!selectedGroup) {
      toast.error("Please select a group to assign");
      return;
    }

    // Validation: Check if student is already assigned to this group
    const isAlreadyAssigned = userGroups.some(
      (group) => group.id === parseInt(selectedGroup)
    );
    
    if (isAlreadyAssigned) {
      toast.error("Student is already assigned to this group");
      return;
    }

    // Validation: Check if user role is student
    if (user.role !== "student") {
      toast.error("Only students can be assigned to groups");
      return;
    }

    try {
      setLoading(true);
      const response = await usersService.assignToGroup(user.id, selectedGroup);
      if (response.success) {
        toast.success("Student assigned to group successfully");
        setSelectedGroup("");
        fetchUserAssignments();
      } else {
        toast.error(response.message || "Failed to assign student to group");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error.response?.data?.message || "Failed to assign student to group");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGroup = async (groupId) => {
    if (!groupId) {
      toast.error("Invalid group ID");
      return;
    }

    // Confirmation before removal
    if (!window.confirm("Are you sure you want to remove this student from the group?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await usersService.removeFromGroup(user.id, groupId);
      if (response.success) {
        toast.success("Student removed from group successfully");
        fetchUserAssignments();
      } else {
        toast.error(response.message || "Failed to remove student from group");
      }
    } catch (error) {
      console.error("Removal error:", error);
      toast.error(error.response?.data?.message || "Failed to remove student from group");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFiliere = async () => {
    if (!selectedFiliere) {
      toast.error("Please select a filière to assign");
      return;
    }

    // Validation: Check if teacher is already assigned to this filière
    const isAlreadyAssigned = userFilieres.some(
      (filiere) => filiere.id === parseInt(selectedFiliere)
    );
    
    if (isAlreadyAssigned) {
      toast.error("Teacher is already assigned to this filière");
      return;
    }

    // Validation: Check if user role is teacher
    if (user.role !== "teacher") {
      toast.error("Only teachers can be assigned to filières");
      return;
    }

    try {
      setLoading(true);
      const response = await usersService.assignToFiliere(
        user.id,
        selectedFiliere
      );
      if (response.success) {
        toast.success("Teacher assigned to filière successfully");
        setSelectedFiliere("");
        fetchUserAssignments();
      } else {
        toast.error(response.message || "Failed to assign teacher to filière");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error.response?.data?.message || "Failed to assign teacher to filière");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFiliere = async (filiereId) => {
    if (!filiereId) {
      toast.error("Invalid filière ID");
      return;
    }

    // Confirmation before removal
    if (!window.confirm("Are you sure you want to remove this teacher from the filière?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await usersService.removeFromFiliere(user.id, filiereId);
      if (response.success) {
        toast.success("Teacher removed from filière successfully");
        fetchUserAssignments();
      } else {
        toast.error(
          response.message || "Failed to remove teacher from filière"
        );
      }
    } catch (error) {
      console.error("Removal error:", error);
      toast.error(error.response?.data?.message || "Failed to remove teacher from filière");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Assignments - {user.name}</DialogTitle>
          <DialogDescription>
            Assign {user.role === "student" ? "groups" : "filières"} to this{" "}
            {user.role}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-4">Loading assignments...</div>
          ) : (
            <>
              {/* Student Groups Section */}
              {user.role === "student" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Groups</h3>

                  {/* Current Groups */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Current Groups:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {userGroups.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          No groups assigned
                        </span>
                      ) : (
                        userGroups.map((group) => (
                          <Badge
                            key={group.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {group.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveGroup(group.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add New Group */}
                  <div className="flex gap-2">
                    <Select
                      value={selectedGroup}
                      onValueChange={setSelectedGroup}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a group to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGroups
                          .filter(
                            (group) =>
                              !userGroups.some((ug) => ug.id === group.id)
                          )
                          .map((group) => (
                            <SelectItem
                              key={group.id}
                              value={group.id.toString()}
                            >
                              {group.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAssignGroup}
                      disabled={!selectedGroup}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  </div>
                </div>
              )}

              {/* Teacher Filières Section */}
              {user.role === "teacher" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Filières</h3>

                  {/* Current Filières */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Current Filières:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {userFilieres.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          No filières assigned
                        </span>
                      ) : (
                        userFilieres.map((filiere) => (
                          <Badge
                            key={filiere.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {filiere.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveFiliere(filiere.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add New Filière */}
                  <div className="flex gap-2">
                    <Select
                      value={selectedFiliere}
                      onValueChange={setSelectedFiliere}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a filière to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFilieres
                          .filter(
                            (filiere) =>
                              !userFilieres.some((uf) => uf.id === filiere.id)
                          )
                          .map((filiere) => (
                            <SelectItem
                              key={filiere.id}
                              value={filiere.id.toString()}
                            >
                              {filiere.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAssignFiliere}
                      disabled={!selectedFiliere}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin users don't have assignments */}
              {user.role === "admin" && (
                <div className="text-center py-8 text-muted-foreground">
                  Administrators don't have group or filière assignments.
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserAssignmentDialog;
