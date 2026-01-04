import { useState } from "react";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import HomeSection from "@/components/sections/HomeSection";
import TeamSection from "@/components/sections/TeamSection";
import EventsSection from "@/components/sections/EventsSection";
import GallerySection from "@/components/sections/GallerySection";
import ContactSection from "@/components/sections/ContactSection";
import AdminSection from "@/components/sections/AdminSection";
import AuthSection from "@/components/sections/AuthSection";
import { useAuth } from "@/hooks/useAuth";
import { useDataService } from "@/hooks/useDataService";

const Index = () => {
  const { isAdmin } = useAuth();
  const { aboutText, teamData, departments, events, galleryImages, loading } = useDataService();
  const [activeSection, setActiveSection] = useState('home');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleNavigate = (section: string) => {
    if (section === 'admin' && !isAdmin) {
      setActiveSection('auth');
      return;
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLightbox = (src: string) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const handleAdminLogout = () => {
    setActiveSection('home');
  };

  const handleAuthSuccess = () => {
    setActiveSection('home');
  };

  const departmentNames = departments.map(d => d.name);

  const renderSection = () => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'home':
        return <HomeSection aboutText={aboutText} />;
      case 'team':
        return <TeamSection teamData={teamData} departments={departmentNames} />;
      case 'events':
        return <EventsSection events={events} onImageClick={openLightbox} />;
      case 'gallery':
        return <GallerySection images={galleryImages} onImageClick={openLightbox} />;
      case 'contact':
        return <ContactSection />;
      case 'auth':
        return <AuthSection onSuccess={handleAuthSuccess} />;
      case 'admin':
        if (!isAdmin) {
          return <AuthSection onSuccess={handleAuthSuccess} />;
        }
        return <AdminSection onLogout={handleAdminLogout} />;
      default:
        return <HomeSection aboutText={aboutText} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
      
      <main className="flex-1">
        <section className="max-w-[1150px] mx-auto my-14 px-6 py-16 bg-card rounded-2xl shadow-xl">
          {renderSection()}
        </section>
      </main>
      
      <Footer onAdminClick={() => handleNavigate('admin')} showAdminLink={isAdmin} />
      
      <Lightbox 
        isOpen={!!lightboxImage} 
        imageSrc={lightboxImage || ''} 
        onClose={closeLightbox} 
      />
    </div>
  );
};

export default Index;
