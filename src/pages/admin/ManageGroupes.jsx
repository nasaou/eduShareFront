import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { groupesService, filieresService } from '../../api/apiService';
import { toast } from 'sonner';

const ManageGroupes = () => {
  const [groupes, setGroupes] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    filiere_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupesRes, filieresRes] = await Promise.all([
        groupesService.getAll(),
        filieresService.getAll(),
      ]);
      
      if (groupesRes.success) {
        setGroupes(groupesRes.data || []);
      }
      if (filieresRes.success) {
        setFilieres(filieresRes.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (groupe = null) => {
    if (groupe) {
      setEditingGroupe(groupe);
      setFormData({
        name: groupe.name,
        filiere_id: groupe.filiere_id.toString(),
      });
    } else {
      setEditingGroupe(null);
      setFormData({
        name: '',
        filiere_id: filieres.length > 0 ? filieres[0].id.toString() : '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      name: formData.name,
      filiere_id: parseInt(formData.filiere_id),
    };
    
    try {
      if (editingGroupe) {
        const response = await groupesService.update(editingGroupe.id, submitData);
        if (response.success) {
          toast.success('Groupe updated successfully');
          fetchData();
          setDialogOpen(false);
        } else {
          toast.error(response.message || 'Failed to update groupe');
        }
      } else {
        const response = await groupesService.create(submitData);
        if (response.success) {
          toast.success('Groupe created successfully');
          fetchData();
          setDialogOpen(false);
        } else {
          toast.error(response.message || 'Failed to create groupe');
        }
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this groupe?')) return;
    
    try {
      const response = await groupesService.delete(id);
      if (response.success) {
        toast.success('Groupe deleted successfully');
        fetchData();
      } else {
        toast.error(response.message || 'Failed to delete groupe');
      }
    } catch (error) {
      toast.error('Failed to delete groupe');
    }
  };

  const getFiliereNameById = (filiereId) => {
    const filiere = filieres.find((f) => f.id === filiereId);
    return filiere ? filiere.name : 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manage Groupes</h2>
            <p className="text-muted-foreground">Student groups within filieres</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="transition-smooth">
                <Plus className="mr-2 h-4 w-4" />
                Add Groupe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGroupe ? 'Edit Groupe' : 'Create New Groupe'}</DialogTitle>
                <DialogDescription>
                  {editingGroupe ? 'Update groupe information' : 'Add a new student groupe'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Groupe Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Group A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filiere">Filiere</Label>
                  <Select
                    value={formData.filiere_id}
                    onValueChange={(value) => setFormData({ ...formData, filiere_id: value })}
                  >
                    <SelectTrigger id="filiere">
                      <SelectValue placeholder="Select a filiere" />
                    </SelectTrigger>
                    <SelectContent>
                      {filieres.map((filiere) => (
                        <SelectItem key={filiere.id} value={filiere.id.toString()}>
                          {filiere.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={filieres.length === 0}>
                    {editingGroupe ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading groupes...</div>
          ) : groupes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No groupes found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Filiere</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupes.map((groupe) => (
                  <TableRow key={groupe.id}>
                    <TableCell className="font-medium">{groupe.name}</TableCell>
                    <TableCell>
                      <span className="inline-block rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {getFiliereNameById(groupe.filiere_id)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(groupe.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(groupe)}
                          className="transition-smooth"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(groupe.id)}
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
    </DashboardLayout>
  );
};

export default ManageGroupes;
