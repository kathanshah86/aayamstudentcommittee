import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDataService } from "@/hooks/useDataService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Upload, X } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
}

interface AdminSectionProps {
  onLogout: () => void;
}

type AdminTab = 'home' | 'events' | 'gallery' | 'team' | 'users';

const AdminSection = ({ onLogout }: AdminSectionProps) => {
  const { user, isAdmin, signIn, signOut, loading: authLoading } = useAuth();
  const {
    aboutText,
    teamData,
    departments,
    events,
    galleryImages,
    loading: dataLoading,
    saveAboutText,
    addDepartment,
    deleteDepartment,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addEvent,
    updateEvent,
    deleteEvent,
    addGalleryImage,
    deleteGalleryImage
  } = useDataService();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [editAboutText, setEditAboutText] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showDeptManager, setShowDeptManager] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [memberForm, setMemberForm] = useState({ name: '', role: '', deptId: '', imageFile: null as File | null });
  const [users, setUsers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    shortDesc: '',
    fullDesc: '',
    status: 'upcoming',
    heroFile: null as File | null,
    galleryFiles: [] as File[],
    existingGallery: [] as string[]
  });

  // Gallery form state
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryAlt, setGalleryAlt] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memberImageRef = useRef<HTMLInputElement>(null);
  const eventHeroRef = useRef<HTMLInputElement>(null);
  const eventGalleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditAboutText(aboutText);
  }, [aboutText]);

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

  const handleSaveHomeContent = async () => {
    await saveAboutText(editAboutText);
  };

  const handleAddDepartment = async () => {
    if (newDeptName.trim()) {
      await addDepartment(newDeptName.trim());
      setNewDeptName('');
    }
  };

  const showAddMemberFormHandler = () => {
    setEditingMemberId(null);
    setMemberForm({ name: '', role: '', deptId: departments[0]?.id || '', imageFile: null });
    setShowMemberForm(true);
  };

  const editMember = (member: typeof teamData[0]) => {
    setEditingMemberId(member.dbId || null);
    const dept = departments.find(d => d.name === member.dept);
    setMemberForm({ 
      name: member.name, 
      role: member.role, 
      deptId: dept?.id || '', 
      imageFile: null 
    });
    setShowMemberForm(true);
  };

  const handleSaveMember = async () => {
    if (!memberForm.name || !memberForm.role || !memberForm.deptId) {
      toast.error('Name, Role and Department are required');
      return;
    }

    if (editingMemberId) {
      await updateTeamMember(
        editingMemberId,
        memberForm.name,
        memberForm.role,
        memberForm.deptId,
        memberForm.imageFile || undefined
      );
    } else {
      await addTeamMember(
        memberForm.name,
        memberForm.role,
        memberForm.deptId,
        memberForm.imageFile || undefined
      );
    }
    setShowMemberForm(false);
  };

  const handleDeleteMember = async (member: typeof teamData[0]) => {
    if (member.dbId && confirm('Are you sure you want to delete this member?')) {
      await deleteTeamMember(member.dbId);
    }
  };

  // Event handlers
  const showAddEventFormHandler = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      date: '',
      shortDesc: '',
      fullDesc: '',
      status: 'upcoming',
      heroFile: null,
      galleryFiles: [],
      existingGallery: []
    });
    setShowEventForm(true);
  };

  const editEvent = (event: typeof events[0]) => {
    setEditingEventId(event.dbId || null);
    setEventForm({
      title: event.title,
      date: event.date,
      shortDesc: event.shortDesc,
      fullDesc: event.description,
      status: event.type,
      heroFile: null,
      galleryFiles: [],
      existingGallery: event.gallery
    });
    setShowEventForm(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date) {
      toast.error('Title and Date are required');
      return;
    }

    if (editingEventId) {
      await updateEvent(
        editingEventId,
        eventForm.title,
        eventForm.date,
        eventForm.shortDesc,
        eventForm.fullDesc,
        eventForm.status,
        eventForm.heroFile || undefined,
        eventForm.galleryFiles.length > 0 ? eventForm.galleryFiles : undefined,
        eventForm.existingGallery
      );
    } else {
      await addEvent(
        eventForm.title,
        eventForm.date,
        eventForm.shortDesc,
        eventForm.fullDesc,
        eventForm.status,
        eventForm.heroFile || undefined,
        eventForm.galleryFiles.length > 0 ? eventForm.galleryFiles : undefined
      );
    }
    setShowEventForm(false);
  };

  const handleDeleteEvent = async (event: typeof events[0]) => {
    if (event.dbId && confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(event.dbId);
    }
  };

  const removeGalleryFromEvent = (index: number) => {
    setEventForm({
      ...eventForm,
      existingGallery: eventForm.existingGallery.filter((_, i) => i !== index)
    });
  };

  // Gallery handlers
  const handleAddGalleryImage = async () => {
    if (!galleryFile) {
      toast.error('Please select an image');
      return;
    }
    await addGalleryImage(galleryFile, galleryAlt);
    setGalleryFile(null);
    setGalleryAlt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteGalleryImage = async (image: typeof galleryImages[0]) => {
    if (image.dbId && confirm('Are you sure you want to delete this image?')) {
      await deleteGalleryImage(image.dbId);
    }
  };

  const navItems = [
    { id: 'home' as const, label: 'Edit Home' },
    { id: 'events' as const, label: 'Manage Events' },
    { id: 'gallery' as const, label: 'Manage Gallery' },
    { id: 'team' as const, label: 'Manage Team' },
    { id: 'users' as const, label: 'Manage Admins' },
  ];

  if (authLoading || dataLoading) {
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
                <Button onClick={handleSaveHomeContent}>Save Changes</Button>
              </div>
            </div>
          )}

          {/* Manage Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Manage Events</h3>
                <Button onClick={showAddEventFormHandler}>+ Add New Event</Button>
              </div>

              {/* Event Form */}
              {showEventForm && (
                <div className="bg-card p-5 rounded-lg mb-5 border-2 border-primary">
                  <h4 className="font-semibold mb-3 text-primary">
                    {editingEventId ? 'Edit Event' : 'Add New Event'}
                  </h4>
                  <div className="grid gap-4">
                    <div>
                      <Label>Event Type</Label>
                      <Select value={eventForm.status} onValueChange={(v) => setEventForm({ ...eventForm, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="past">Past</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Event Title</Label>
                      <Input 
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        placeholder="e.g. Sports Meet 2025"
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input 
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        placeholder="e.g. March 15, 2025"
                      />
                    </div>
                    <div>
                      <Label>Event Image</Label>
                      <Input 
                        type="file"
                        accept="image/*"
                        ref={eventHeroRef}
                        onChange={(e) => setEventForm({ ...eventForm, heroFile: e.target.files?.[0] || null })}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Upload an image (jpg, png)</p>
                    </div>
                    <div>
                      <Label>Short Description</Label>
                      <Textarea 
                        value={eventForm.shortDesc}
                        onChange={(e) => setEventForm({ ...eventForm, shortDesc: e.target.value })}
                        placeholder="Brief summary for the card..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Full Description (for past events)</Label>
                      <Textarea 
                        value={eventForm.fullDesc}
                        onChange={(e) => setEventForm({ ...eventForm, fullDesc: e.target.value })}
                        placeholder="Detailed description..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Gallery Images (for past events)</Label>
                      <Input 
                        type="file"
                        accept="image/*"
                        multiple
                        ref={eventGalleryRef}
                        onChange={(e) => setEventForm({ 
                          ...eventForm, 
                          galleryFiles: Array.from(e.target.files || [])
                        })}
                        className="mt-1"
                      />
                      {eventForm.existingGallery.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-2">Existing gallery images:</p>
                          <div className="flex flex-wrap gap-2">
                            {eventForm.existingGallery.map((url, i) => (
                              <div key={i} className="relative">
                                <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                                <button 
                                  onClick={() => removeGalleryFromEvent(i)}
                                  className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEvent}>
                        {editingEventId ? 'Update Event' : 'Add Event'}
                      </Button>
                      <Button variant="destructive" onClick={() => setShowEventForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Events List */}
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                    {event.heroImage && (
                      <img src={event.heroImage} alt="" className="w-20 h-14 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.date} • {event.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => editEvent(event)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No events yet. Add your first event!</p>
                )}
              </div>
            </div>
          )}

          {/* Manage Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">Add to Gallery</h3>
              
              <div className="bg-card p-5 rounded-lg mb-6 border">
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold text-primary">Upload Photo</Label>
                    <Input 
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Selected image will be added to the gallery grid.</p>
                  </div>
                  <div>
                    <Label>Alt Text (optional)</Label>
                    <Input 
                      value={galleryAlt}
                      onChange={(e) => setGalleryAlt(e.target.value)}
                      placeholder="Describe the image..."
                    />
                  </div>
                  <Button onClick={handleAddGalleryImage} className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Add Photo to Gallery
                  </Button>
                </div>
              </div>

              {/* Gallery Grid */}
              <h4 className="font-semibold mb-3">Current Gallery ({galleryImages.length} images)</h4>
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button 
                      onClick={() => handleDeleteGalleryImage(image)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {galleryImages.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No gallery images yet.</p>
              )}
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
                    <Button onClick={handleAddDepartment}>Add</Button>
                  </div>
                  {departments.filter(d => d.name !== 'Core').map((dept) => (
                    <div key={dept.id} className="flex justify-between items-center p-2 bg-card border-b">
                      <span>{dept.name}</span>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteDepartment(dept.id)}
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
                    {editingMemberId ? 'Edit Member' : 'Add New Member'}
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
                        value={memberForm.deptId} 
                        onValueChange={(v) => setMemberForm({ ...memberForm, deptId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Photo</Label>
                      <Input 
                        type="file"
                        accept="image/*"
                        ref={memberImageRef}
                        onChange={(e) => setMemberForm({ ...memberForm, imageFile: e.target.files?.[0] || null })}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Upload member photo (jpg, png)</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveMember}>Save Member</Button>
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
                              onClick={() => handleDeleteMember(member)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {teamData.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No team members yet.</p>
                )}
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
                      {users.filter(u => !admins.includes(u.id)).map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={grantAdminAccess}>Grant Admin</Button>
                </div>
              </div>

              {/* Current Admins */}
              <div className="bg-card p-5 rounded-lg border">
                <h4 className="font-semibold mb-3">Current Admins</h4>
                {admins.length > 0 ? (
                  <div className="space-y-2">
                    {admins.map((adminId) => {
                      const adminUser = users.find(u => u.id === adminId);
                      return (
                        <div key={adminId} className="flex justify-between items-center p-3 bg-muted rounded">
                          <span>{adminUser?.email || adminId}</span>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => revokeAdminAccess(adminId)}
                            disabled={adminId === user?.id}
                          >
                            {adminId === user?.id ? 'You' : 'Revoke'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No admins found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
