import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, GraduationCap } from 'lucide-react';
import { filieresService, usersService } from '../../api/apiService';
import { toast } from 'sonner';

const ManageFiliereAssignments = () => {
  const [filieres, setFilieres] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [filiereTeachers, setFiliereTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filieresResponse, teachersResponse] = await Promise.all([
        filieresService.getAll(),
        usersService.getAll()
      ]);

      if (filieresResponse.success) {
        setFilieres(filieresResponse.data);
      }

      if (teachersResponse.success) {
        // Filter only teachers/professors
        const teacherUsers = teachersResponse.data.filter(
          user => user.role === 'teacher' || user.role === 'professor'
        );
        setTeachers(teacherUsers);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiliereTeachers = async (filiereId) => {
    try {
      const response = await filieresService.getTeachers(filiereId);
      if (response.success) {
        setFiliereTeachers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch filière teachers:', error);
      toast.error('Failed to load filière teachers');
    }
  };

  const handleFiliereSelect = (filiere) => {
    setSelectedFiliere(filiere);
    fetchFiliereTeachers(filiere.id);
  };

  const handleAssignTeacher = async () => {
    if (!selectedFiliere || !selectedTeacher) {
      toast.error('Please select a teacher');
      return;
    }

    try {
      const response = await filieresService.assignTeachers(selectedFiliere.id, [selectedTeacher]);
      if (response.success) {
        toast.success('Teacher assigned successfully');
        fetchFiliereTeachers(selectedFiliere.id);
        setAssignDialogOpen(false);
        setSelectedTeacher('');
      } else {
        toast.error(response.message || 'Failed to assign teacher');
      }
    } catch (error) {
      console.error('Failed to assign teacher:', error);
      toast.error('Failed to assign teacher');
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!selectedFiliere) return;

    try {
      const response = await filieresService.removeTeachers(selectedFiliere.id, [teacherId]);
      if (response.success) {
        toast.success('Teacher removed successfully');
        fetchFiliereTeachers(selectedFiliere.id);
      } else {
        toast.error(response.message || 'Failed to remove teacher');
      }
    } catch (error) {
      console.error('Failed to remove teacher:', error);
      toast.error('Failed to remove teacher');
    }
  };

  const getAvailableTeachers = () => {
    const assignedTeacherIds = filiereTeachers.map(teacher => teacher.id);
    return teachers.filter(teacher => !assignedTeacherIds.includes(teacher.id));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Filière Assignments</h2>
          <p className="text-muted-foreground">
            Assign teachers to filières to control their access to groups
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Filières List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Filières
              </CardTitle>
              <CardDescription>
                Select a filière to manage teacher assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filieres.map((filiere) => (
                  <div
                    key={filiere.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFiliere?.id === filiere.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleFiliereSelect(filiere)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{filiere.name}</span>
                      <Badge variant="secondary">
                        {filiere.groupes?.length || 0} groups
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teachers Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Teachers
                {selectedFiliere && (
                  <span className="text-sm font-normal text-muted-foreground">
                    - {selectedFiliere.name}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {selectedFiliere
                  ? 'Teachers assigned to this filière'
                  : 'Select a filière to view assigned teachers'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFiliere ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {filiereTeachers.length} teacher(s) assigned
                    </span>
                    <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={getAvailableTeachers().length === 0}>
                          <Plus className="h-4 w-4 mr-2" />
                          Assign Teacher
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Teacher to {selectedFiliere.name}</DialogTitle>
                          <DialogDescription>
                            Select a teacher to assign to this filière
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="teacher-select">Teacher</Label>
                            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableTeachers().map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                    {teacher.name} ({teacher.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setAssignDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAssignTeacher}>
                              Assign Teacher
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {filiereTeachers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filiereTeachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell className="font-medium">{teacher.name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {teacher.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTeacher(teacher.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No teachers assigned to this filière
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a filière to manage teacher assignments
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageFiliereAssignments;