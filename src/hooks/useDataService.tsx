import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, EventData, GalleryImage } from '@/types';
import { toast } from 'sonner';

export interface DbTeamMember {
  id: string;
  name: string;
  role: string;
  department_id: string | null;
  image_url: string | null;
  sort_order: number | null;
}

export interface DbEvent {
  id: string;
  title: string;
  date: string;
  description: string | null;
  full_description: string | null;
  hero_image: string | null;
  gallery: string[] | null;
  status: string;
}

export interface DbGalleryImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number | null;
}

export interface DbDepartment {
  id: string;
  name: string;
  sort_order: number | null;
}

export const useDataService = () => {
  const [aboutText, setAboutText] = useState('');
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchAboutText(),
      fetchTeam(),
      fetchDepartments(),
      fetchEvents(),
      fetchGallery()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAboutText = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 'about_text')
      .maybeSingle();
    
    if (data) {
      setAboutText(data.content);
    } else {
      setAboutText("AAYAM Committee is a student-led college committee organizing cultural, sports, and management activities to build leadership, teamwork, and creativity.");
    }
  };

  const saveAboutText = async (text: string) => {
    const { error } = await supabase
      .from('site_content')
      .upsert({ id: 'about_text', content: text, updated_at: new Date().toISOString() });
    
    if (error) {
      toast.error('Failed to save content');
      return false;
    }
    setAboutText(text);
    toast.success('Home content saved!');
    return true;
  };

  const fetchDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (data) {
      setDepartments(data.map(d => ({ id: d.id, name: d.name })));
    }
  };

  const addDepartment = async (name: string) => {
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, sort_order: departments.length })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add department');
      return false;
    }
    await fetchDepartments();
    toast.success('Department added!');
    return true;
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete department');
      return false;
    }
    await fetchDepartments();
    toast.success('Department deleted!');
    return true;
  };

  const fetchTeam = async () => {
    const { data: deptData } = await supabase
      .from('departments')
      .select('*');
    
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (data && deptData) {
      const deptMap = new Map(deptData.map(d => [d.id, d.name]));
      setTeamData(data.map((m, index) => ({
        id: index + 1,
        dbId: m.id,
        name: m.name,
        role: m.role,
        dept: m.department_id ? deptMap.get(m.department_id) || 'Unknown' : 'Unknown',
        img: m.image_url || `https://placehold.co/115x115?text=${m.name.charAt(0)}`
      })));
    }
  };

  const addTeamMember = async (name: string, role: string, departmentId: string, imageFile?: File) => {
    let imageUrl = null;
    
    if (imageFile) {
      const fileName = `team/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, imageFile);
      
      if (uploadError) {
        toast.error('Failed to upload image');
        return false;
      }
      
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);
      
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('team_members')
      .insert({ 
        name, 
        role, 
        department_id: departmentId, 
        image_url: imageUrl,
        sort_order: teamData.length
      });
    
    if (error) {
      toast.error('Failed to add team member');
      return false;
    }
    await fetchTeam();
    toast.success('Team member added!');
    return true;
  };

  const updateTeamMember = async (id: string, name: string, role: string, departmentId: string, imageFile?: File) => {
    let updateData: Record<string, unknown> = { name, role, department_id: departmentId };
    
    if (imageFile) {
      const fileName = `team/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, imageFile);
      
      if (uploadError) {
        toast.error('Failed to upload image');
        return false;
      }
      
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);
      
      updateData.image_url = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update team member');
      return false;
    }
    await fetchTeam();
    toast.success('Team member updated!');
    return true;
  };

  const deleteTeamMember = async (id: string) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete team member');
      return false;
    }
    await fetchTeam();
    toast.success('Team member deleted!');
    return true;
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setEvents(data.map((e, index) => ({
        id: index + 1,
        dbId: e.id,
        title: e.title,
        date: e.date,
        heroImage: e.hero_image || '',
        gallery: e.gallery || [],
        description: e.full_description || e.description || '',
        shortDesc: e.description || '',
        type: e.status === 'past' ? 'past' : 'upcoming' as const
      })));
    }
  };

  const addEvent = async (
    title: string, 
    date: string, 
    description: string, 
    fullDescription: string,
    status: string,
    heroImageFile?: File,
    galleryFiles?: File[]
  ) => {
    let heroImageUrl = null;
    const galleryUrls: string[] = [];
    
    if (heroImageFile) {
      const fileName = `events/${Date.now()}-hero-${heroImageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, heroImageFile);
      
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);
        heroImageUrl = urlData.publicUrl;
      }
    }

    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const fileName = `events/${Date.now()}-gallery-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);
          galleryUrls.push(urlData.publicUrl);
        }
      }
    }

    const { error } = await supabase
      .from('events')
      .insert({ 
        title, 
        date, 
        description,
        full_description: fullDescription,
        hero_image: heroImageUrl,
        gallery: galleryUrls,
        status
      });
    
    if (error) {
      toast.error('Failed to add event');
      return false;
    }
    await fetchEvents();
    toast.success('Event added!');
    return true;
  };

  const updateEvent = async (
    id: string,
    title: string, 
    date: string, 
    description: string, 
    fullDescription: string,
    status: string,
    heroImageFile?: File,
    galleryFiles?: File[],
    existingGallery?: string[]
  ) => {
    const updateData: Record<string, unknown> = { 
      title, 
      date, 
      description,
      full_description: fullDescription,
      status
    };
    
    if (heroImageFile) {
      const fileName = `events/${Date.now()}-hero-${heroImageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, heroImageFile);
      
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);
        updateData.hero_image = urlData.publicUrl;
      }
    }

    const galleryUrls: string[] = existingGallery || [];
    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const fileName = `events/${Date.now()}-gallery-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);
          galleryUrls.push(urlData.publicUrl);
        }
      }
    }
    updateData.gallery = galleryUrls;

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update event');
      return false;
    }
    await fetchEvents();
    toast.success('Event updated!');
    return true;
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete event');
      return false;
    }
    await fetchEvents();
    toast.success('Event deleted!');
    return true;
  };

  const fetchGallery = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (data) {
      setGalleryImages(data.map((g, index) => ({
        id: index + 1,
        dbId: g.id,
        src: g.url,
        alt: g.alt || 'Gallery image'
      })));
    }
  };

  const addGalleryImage = async (file: File, alt?: string) => {
    const fileName = `gallery/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);
    
    if (uploadError) {
      toast.error('Failed to upload image');
      return false;
    }
    
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from('gallery_images')
      .insert({ 
        url: urlData.publicUrl, 
        alt: alt || 'Gallery image',
        sort_order: galleryImages.length
      });
    
    if (error) {
      toast.error('Failed to add to gallery');
      return false;
    }
    await fetchGallery();
    toast.success('Image added to gallery!');
    return true;
  };

  const deleteGalleryImage = async (id: string) => {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete image');
      return false;
    }
    await fetchGallery();
    toast.success('Image deleted!');
    return true;
  };

  return {
    aboutText,
    teamData,
    departments,
    events,
    galleryImages,
    loading,
    fetchAll,
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
  };
};
