import { EventData } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventDetailProps {
  event: EventData;
  onBack: () => void;
  onImageClick: (src: string) => void;
}

const EventDetail = ({ event, onBack, onImageClick }: EventDetailProps) => {
  return (
    <div className="animate-slide-up">
      <div className="p-2.5">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Hero Image */}
        <div 
          className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-8 shadow-xl bg-accent cursor-zoom-in group"
          onClick={() => onImageClick(event.heroImage)}
          title="Click to view full screen"
        >
          <img 
            src={event.heroImage} 
            alt={event.title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        {/* Header Info */}
        <div className="mb-6 border-b border-border pb-5">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 leading-tight">
            {event.title}
          </h2>
          <span className="inline-block bg-muted text-primary px-4 py-2 rounded-full font-semibold text-sm tracking-wide">
            {event.date}
          </span>
        </div>

        {/* Description */}
        <div className="text-base leading-relaxed text-muted-foreground mb-10 px-2.5 whitespace-pre-line">
          {event.description}
        </div>

        {/* Gallery */}
        {event.gallery && event.gallery.length > 0 && (
          <>
            <h3 className="text-xl font-bold text-primary mb-5 pl-4 border-l-4 border-secondary">
              Event Highlights
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {event.gallery.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-[120px] object-contain bg-accent rounded-lg cursor-pointer border-2 border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-secondary"
                  onClick={() => onImageClick(img)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
