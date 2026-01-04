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
import { teamData as initialTeamData, departments as initialDepartments } from "@/data/teamData";
import { eventsData } from "@/data/eventsData";
import { galleryData } from "@/data/galleryData";
import { TeamMember } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [aboutText, setAboutText] = useState(
    "AAYAM Committee is a student-led college committee organizing cultural, sports, and management activities to build leadership, teamwork, and creativity."
  );
  const [teamData, setTeamData] = useState<TeamMember[]>(initialTeamData);
  const [departments, setDepartments] = useState<string[]>(initialDepartments);

  const handleNavigate = (section: string) => {
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

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection aboutText={aboutText} />;
      case 'team':
        return <TeamSection teamData={teamData} departments={departments} />;
      case 'events':
        return <EventsSection events={eventsData} onImageClick={openLightbox} />;
      case 'gallery':
        return <GallerySection images={galleryData} onImageClick={openLightbox} />;
      case 'contact':
        return <ContactSection />;
      case 'admin':
        return (
          <AdminSection 
            aboutText={aboutText}
            onAboutTextChange={setAboutText}
            teamData={teamData}
            departments={departments}
            onTeamUpdate={setTeamData}
            onDepartmentsUpdate={setDepartments}
            onLogout={handleAdminLogout}
          />
        );
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
