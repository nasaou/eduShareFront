import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen } from "lucide-react";
import { usersService } from "../api/apiService";
import { toast } from "sonner";

const MyAssignments = ({ userRole }) => {
  const [groups, setGroups] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAssignments();
  }, [userRole]);

  const fetchMyAssignments = async () => {
    try {
      setLoading(true);
      
      if (userRole === 'student') {
        const response = await usersService.getMyGroups();
        if (response.success) {
          setGroups(response.data || []);
        }
      } else if (userRole === 'teacher') {
        const response = await usersService.getMyFilieres();
        if (response.success) {
          setFilieres(response.data || []);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  if (userRole === 'admin') {
    return null; // Admins don't have assignments
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {userRole === 'student' ? (
            <>
              <Users className="h-5 w-5" />
              My Groups
            </>
          ) : (
            <>
              <BookOpen className="h-5 w-5" />
              My Filières
            </>
          )}
        </CardTitle>
        <CardDescription>
          {userRole === 'student' 
            ? "Groups you are assigned to" 
            : "Filières you are teaching in"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading assignments...
          </div>
        ) : (
          <div className="space-y-4">
            {userRole === 'student' && (
              <div>
                {groups.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    You are not assigned to any groups yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group) => (
                      <Badge key={group.id} variant="secondary" className="text-sm">
                        {group.name}
                        {group.filiere && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({group.filiere.name})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {userRole === 'teacher' && (
              <div>
                {filieres.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    You are not assigned to any filières yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {filieres.map((filiere) => (
                      <Badge key={filiere.id} variant="secondary" className="text-sm">
                        {filiere.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyAssignments;