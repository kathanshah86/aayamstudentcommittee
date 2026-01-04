import { useState } from "react";
import { EventData } from "@/types";
import EventCard from "@/components/EventCard";
import EventDetail from "@/components/EventDetail";

interface EventsSectionProps {
  events: EventData[];
  onImageClick: (src: string) => void;
}

const EventsSection = ({ events, onImageClick }: EventsSectionProps) => {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const pastEvents = events.filter(e => e.type === 'past');
  const upcomingEvents = events.filter(e => e.type === 'upcoming');

  if (selectedEvent) {
    return (
      <EventDetail 
        event={selectedEvent} 
        onBack={() => setSelectedEvent(null)} 
        onImageClick={onImageClick}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-3xl font-black text-primary mb-8">Events Dashboard</h2>
      
      <div className="flex flex-wrap gap-10 mt-5">
        {/* Past Events Column */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-center bg-muted p-2.5 rounded-lg text-primary font-semibold mb-2">
            Past Events
          </h3>
          <p className="text-center text-xs text-muted-foreground mb-4">(Click cards for details)</p>
          
          {pastEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => setSelectedEvent(event)} 
            />
          ))}
        </div>

        {/* Upcoming Events Column */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-center bg-muted p-2.5 rounded-lg text-primary font-semibold mb-2">
            Upcoming Events
          </h3>
          <p className="text-center text-xs text-muted-foreground mb-4">&nbsp;</p>
          
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
