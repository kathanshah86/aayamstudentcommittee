import { useEffect } from "react";
import { X } from "lucide-react";

interface LightboxProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
}

const Lightbox = ({ isOpen, imageSrc, onClose }: LightboxProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:right-8 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <X className="w-7 h-7" />
      </button>
      <img 
        src={imageSrc} 
        alt="Full size view" 
        className="max-w-[90%] max-h-[85vh] object-contain rounded shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default Lightbox;
