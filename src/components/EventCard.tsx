import { EventData } from "@/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventData;
  onClick?: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  const isPast = event.type === 'past';

  return (
    <div 
      className={cn(
        "bg-muted/30 border-l-4 p-5 mb-5 rounded-r-lg shadow-sm transition-all duration-200",
        isPast 
          ? "border-l-secondary cursor-pointer hover:translate-x-1 hover:bg-card" 
          : "border-l-success cursor-default"
      )}
      onClick={isPast ? onClick : undefined}
    >
      {event.heroImage && (
        <img 
          src={event.heroImage} 
          alt={event.title}
          className="w-full h-[250px] object-contain bg-accent rounded-lg mb-4 border border-border"
        />
      )}
      <span className={cn(
        "inline-block px-2 py-1 rounded text-[10px] font-bold text-white mb-2",
        isPast ? "bg-muted-foreground" : "bg-success"
      )}>
        {isPast ? 'Completed' : 'Upcoming'}
      </span>
      <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
        {event.date}
      </div>
      <h4 className="text-lg text-foreground font-semibold mb-2">{event.title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{event.shortDesc}</p>
    </div>
  );
};

export default EventCard;
