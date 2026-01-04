import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string | null;
}

interface AdminSectionProps {
  aboutText: string;
  onAboutTextChange: (text: string) => void;
  teamData: TeamMember[];
  departments: string[];
  onTeamUpdate: (team: TeamMember[]) => void;
  onDepartmentsUpdate: (depts: string[]) => void;
  onLogout: () => void;
}

type AdminTab = 'home' | 'events' | 'gallery' | 'team' | 'users';

const AdminSection = ({ 
  aboutText, 
  onAboutTextChange, 
  teamData, 
  departments, 
  onTeamUpdate, 
  onDepartmentsUpdate,
  onLogout 
}: AdminSectionProps) => {
  const { user, isAdmin, signIn, signOut, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [editAboutText, setEditAboutText] = useState(aboutText);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showDeptManager, setShowDeptManager] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [memberForm, setMemberForm] = useState({ name: '', role: '', dept: '' });
  const [users, setUsers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAdmins();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email');
    
    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (!error && data) {
      setAdmins(data.map(r => r.user_id));
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    const { error } = await signIn(email, password);
    if (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setEmail('');
    setPassword('');
    onLogout();
  };

  const grantAdminAccess = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: selectedUserId, role: 'admin' });

    if (error) {
      if (error.code === '23505') {
        toast.error('User already has admin access');
      } else {
        toast.error('Failed to grant admin access');
      }
    } else {
      toast.success('Admin access granted successfully');
      fetchAdmins();
      setSelectedUserId('');
    }
  };

  const revokeAdminAccess = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot revoke your own admin access");
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) {
      toast.error('Failed to revoke admin access');
    } else {
      toast.success('Admin access revoked');
      fetchAdmins();
    }
  };

  const saveHomeContent = () => {
    onAboutTextChange(editAboutText);
    toast.success('Home page content updated successfully!');
  };

  const addDepartment = () => {
    if (newDeptName.trim() && !departments.includes(newDeptName.trim())) {
      onDepartmentsUpdate([...departments, newDeptName.trim()]);
      setNewDeptName('');
      toast.success('Department Added');
    }
  };

  const deleteDepartment = (name: string) => {
    if (confirm(`Delete department: ${name}?`)) {
      onDepartmentsUpdate(departments.filter(d => d !== name));
    }
  };

  const showAddMemberFormHandler = () => {
    setEditingMember(null);
    setMemberForm({ name: '', role: '', dept: departments[0] || '' });
    setShowMemberForm(true);
  };

  const editMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({ name: member.name, role: member.role, dept: member.dept });
    setShowMemberForm(true);
  };

  const deleteMember = (id: number) => {
    if (confirm('Are you sure?')) {
      onTeamUpdate(teamData.filter(m => m.id !== id));
    }
  };

  const saveMember = () => {
    if (!memberForm.name || !memberForm.role) {
      toast.error('Name and Role required');
      return;
    }

    if (editingMember) {
      onTeamUpdate(teamData.map(m => 
        m.id === editingMember.id 
          ? { ...m, name: memberForm.name, role: memberForm.role, dept: memberForm.dept }
          : m
      ));
    } else {
      const newId = teamData.length > 0 ? Math.max(...teamData.map(m => m.id)) + 1 : 1;
      onTeamUpdate([...teamData, {
        id: newId,
        name: memberForm.name,
        role: memberForm.role,
        dept: memberForm.dept,
        img: `https://placehold.co/115x115?text=${memberForm.name.charAt(0)}`
      }]);
    }
    setShowMemberForm(false);
    toast.success('Member Saved!');
  };

  const navItems = [
    { id: 'home' as const, label: 'Edit Home' },
    { id: 'events' as const, label: 'Manage Events' },
    { id: 'gallery' as const, label: 'Manage Gallery' },
    { id: 'team' as const, label: 'Manage Team' },
    { id: 'users' as const, label: 'Manage Admins' },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not logged in OR not admin
  if (!user || !isAdmin) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-center text-3xl font-black text-primary mb-8">Admin Panel</h2>
        <div className="max-w-[400px] mx-auto">
          <div className="bg-card p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-center mb-6">Restricted Access</h3>
            {user && !isAdmin ? (
              <div className="text-center space-y-4">
                <p className="text-destructive">You do not have admin privileges.</p>
                <Button onClick={handleLogout} variant="outline">Sign Out</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Email</Label>
                  <Input 
                    id="admin-email" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-pass">Password</Label>
                  <Input 
                    id="admin-pass" 
                    type="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
                {loginError && (
                  <p className="text-destructive text-sm text-center">{loginError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-3xl font-black text-primary mb-8">Admin Panel</h2>
      
      <div className="flex min-h-[600px] bg-card rounded-2xl overflow-hidden shadow-xl">
        {/* Sidebar */}
        <div className="w-[250px] bg-sidebar text-sidebar-foreground p-5 flex flex-col">
          <h3 className="text-accent border-b border-sidebar-border pb-4 mb-5 font-semibold">
            Dashboard
          </h3>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "block w-full text-left p-3 rounded-md mb-1 transition-colors",
                "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                activeTab === item.id && "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
          <div className="mt-auto pt-5 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/60 mb-2 truncate">{user.email}</p>
            <button
              onClick={handleLogout}
              className="block w-full text-left p-3 rounded-md hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-muted/20 overflow-auto">
          {/* Edit Home Tab */}
          {activeTab === 'home' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Edit Homepage</h3>
              <div className="space-y-4">
                <div>
                  <Label>About Us Description</Label>
                  <Textarea 
                    value={editAboutText}
                    onChange={(e) => setEditAboutText(e.target.value)}
                    rows={8}
                    className="mt-1"
                  />
                </div>
                <Button onClick={saveHomeContent}>Save Changes</Button>
              </div>
            </div>
          )}

          {/* Manage Events Tab */}
          {activeTab === 'events' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Add New Event</h3>
              <p className="text-muted-foreground">Event management coming soon...</p>
            </div>
          )}

          {/* Manage Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Add to Gallery</h3>
              <p className="text-muted-foreground">Gallery management coming soon...</p>
            </div>
          )}

          {/* Manage Team Tab */}
          {activeTab === 'team' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Manage Team & Departments</h3>
              <div className="flex gap-2 mb-5">
                <Button onClick={showAddMemberFormHandler}>+ Add New Member</Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowDeptManager(!showDeptManager)}
                >
                  Manage Departments
                </Button>
              </div>

              {/* Department Manager */}
              {showDeptManager && (
                <div className="bg-card p-4 rounded-lg mb-5 border">
                  <h4 className="font-semibold mb-3">Manage Departments</h4>
                  <div className="flex gap-2 mb-3">
                    <Input 
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="New Department Name"
                    />
                    <Button onClick={addDepartment}>Add</Button>
                  </div>
                  {departments.filter(d => d !== 'Core').map((dept) => (
                    <div key={dept} className="flex justify-between items-center p-2 bg-card border-b">
                      <span>{dept}</span>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteDepartment(dept)}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Member Form */}
              {showMemberForm && (
                <div className="bg-card p-5 rounded-lg mb-5 border-2 border-primary">
                  <h4 className="font-semibold mb-3">
                    {editingMember ? 'Edit Member' : 'Add New Member'}
                  </h4>
                  <div className="grid gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input 
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input 
                        value={memberForm.role}
                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Select 
                        value={memberForm.dept} 
                        onValueChange={(v) => setMemberForm({ ...memberForm, dept: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveMember}>Save Member</Button>
                      <Button variant="destructive" onClick={() => setShowMemberForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 border text-left text-primary">Photo</th>
                      <th className="p-3 border text-left text-primary">Name</th>
                      <th className="p-3 border text-left text-primary">Role</th>
                      <th className="p-3 border text-left text-primary">Department</th>
                      <th className="p-3 border text-left text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.map((member) => (
                      <tr key={member.id}>
                        <td className="p-3 border">
                          <img 
                            src={member.img} 
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://placehold.co/40x40?text=${member.name.charAt(0)}`;
                            }}
                          />
                        </td>
                        <td className="p-3 border">{member.name}</td>
                        <td className="p-3 border">{member.role}</td>
                        <td className="p-3 border">{member.dept}</td>
                        <td className="p-3 border">
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => editMember(member)}>
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteMember(member.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Manage Admins Tab */}
          {activeTab === 'users' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Manage Admin Access</h3>
              
              {/* Grant Admin Access */}
              <div className="bg-card p-5 rounded-lg mb-6 border">
                <h4 className="font-semibold mb-3">Grant Admin Access</h4>
                <div className="flex gap-2">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a registered user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(u => !admins.includes(u.id))
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.email || 'No email'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={grantAdminAccess}>Grant Access</Button>
                </div>
              </div>

              {/* Current Admins */}
              <div className="bg-card p-5 rounded-lg border">
                <h4 className="font-semibold mb-3">Current Admins</h4>
                <div className="space-y-2">
                  {users
                    .filter(u => admins.includes(u.id))
                    .map((adminUser) => (
                      <div key={adminUser.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span>{adminUser.email || 'No email'}</span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => revokeAdminAccess(adminUser.id)}
                          disabled={adminUser.id === user?.id}
                        >
                          {adminUser.id === user?.id ? 'You' : 'Revoke'}
                        </Button>
                      </div>
                    ))}
                  {admins.length === 0 && (
                    <p className="text-muted-foreground">No admins found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
