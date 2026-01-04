import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember } from "@/types";
import { cn } from "@/lib/utils";

interface AdminSectionProps {
  aboutText: string;
  onAboutTextChange: (text: string) => void;
  teamData: TeamMember[];
  departments: string[];
  onTeamUpdate: (team: TeamMember[]) => void;
  onDepartmentsUpdate: (depts: string[]) => void;
  onLogout: () => void;
}

type AdminTab = 'home' | 'events' | 'gallery' | 'team';

const AdminSection = ({ 
  aboutText, 
  onAboutTextChange, 
  teamData, 
  departments, 
  onTeamUpdate, 
  onDepartmentsUpdate,
  onLogout 
}: AdminSectionProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [editAboutText, setEditAboutText] = useState(aboutText);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showDeptManager, setShowDeptManager] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [memberForm, setMemberForm] = useState({ name: '', role: '', dept: '' });

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    onLogout();
  };

  const saveHomeContent = () => {
    onAboutTextChange(editAboutText);
    alert('Home page content updated successfully!');
  };

  const addDepartment = () => {
    if (newDeptName.trim() && !departments.includes(newDeptName.trim())) {
      onDepartmentsUpdate([...departments, newDeptName.trim()]);
      setNewDeptName('');
      alert('Department Added');
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
      alert('Name and Role required');
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
    alert('Member Saved!');
  };

  const navItems = [
    { id: 'home' as const, label: 'Edit Home' },
    { id: 'events' as const, label: 'Manage Events' },
    { id: 'gallery' as const, label: 'Manage Gallery' },
    { id: 'team' as const, label: 'Manage Team' },
  ];

  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-center text-3xl font-black text-primary mb-8">Admin Panel</h2>
        <div className="max-w-[400px] mx-auto">
          <div className="bg-card p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-center mb-6">Restricted Access</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-user">Username</Label>
                <Input 
                  id="admin-user" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
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
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
              {loginError && (
                <p className="text-destructive text-sm text-center">Invalid Credentials</p>
              )}
            </div>
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
        <div className="w-[250px] bg-sidebar text-sidebar-foreground p-5">
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
            <button
              onClick={handleLogout}
              className="block w-full text-left p-3 rounded-md hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-muted/20">
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
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
