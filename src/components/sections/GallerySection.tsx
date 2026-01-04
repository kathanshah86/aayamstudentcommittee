import { GalleryImage } from "@/types";

interface GallerySectionProps {
  images: GalleryImage[];
  onImageClick: (src: string) => void;
}

const GallerySection = ({ images, onImageClick }: GallerySectionProps) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-3xl font-black text-primary mb-4">Gallery</h2>
      <p className="text-center text-muted-foreground mb-6">Memorable Moments & Activities</p>
      
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
        {images.map((image) => (
          <div 
            key={image.id}
            className="h-[250px] rounded-xl overflow-hidden shadow-lg bg-accent cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
            onClick={() => onImageClick(image.src)}
          >
            <img 
              src={image.src} 
              alt={image.alt}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GallerySection;
