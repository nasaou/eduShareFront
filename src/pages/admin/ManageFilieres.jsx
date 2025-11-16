import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { filieresService } from '../../api/apiService';
import { toast } from 'sonner';

const ManageFilieres = () => {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    try {
      const response = await filieresService.getAll();
      if (response.success) {
        setFilieres(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch filieres');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (filiere = null) => {
    if (filiere) {
      setEditingFiliere(filiere);
      setFormData({ name: filiere.name });
    } else {
      setEditingFiliere(null);
      setFormData({ name: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingFiliere) {
        const response = await filieresService.update(editingFiliere.id, formData);
        if (response.success) {
          toast.success('Filiere updated successfully');
          fetchFilieres();
          setDialogOpen(false);
        } else {
          toast.error(response.message || 'Failed to update filiere');
        }
      } else {
        const response = await filieresService.create(formData);
        if (response.success) {
          toast.success('Filiere created successfully');
          fetchFilieres();
          setDialogOpen(false);
        } else {
          toast.error(response.message || 'Failed to create filiere');
        }
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this filiere?')) return;
    
    try {
      const response = await filieresService.delete(id);
      if (response.success) {
        toast.success('Filiere deleted successfully');
        fetchFilieres();
      } else {
        toast.error(response.message || 'Failed to delete filiere');
      }
    } catch (error) {
      toast.error('Failed to delete filiere');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manage Filieres</h2>
            <p className="text-muted-foreground">Academic programs and departments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="transition-smooth">
                <Plus className="mr-2 h-4 w-4" />
                Add Filiere
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFiliere ? 'Edit Filiere' : 'Create New Filiere'}</DialogTitle>
                <DialogDescription>
                  {editingFiliere ? 'Update filiere information' : 'Add a new academic program'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Filiere Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Computer Science"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingFiliere ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading filieres...</div>
          ) : filieres.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No filieres found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filieres.map((filiere) => (
                  <TableRow key={filiere.id}>
                    <TableCell className="font-medium">{filiere.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(filiere.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(filiere)}
                          className="transition-smooth"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(filiere.id)}
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

export default ManageFilieres;
