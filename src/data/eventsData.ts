import { EventData } from "@/types";

export const eventsData: EventData[] = [
  {
    id: 1,
    title: "Exclusive Watch Party with S8UL Sports",
    date: "17 September 2025",
    heroImage: "/images/image1.png",
    gallery: [
      "/images/image2.png",
      "/images/image3.png",
      "/images/image4.png",
      "https://placehold.co/300x300/b08968/fff?text=Awards"
    ],
    description: `The amphitheatre at Karnavati University turned into a hub of excitement as students gathered for an exclusive watch party featuring S8UL, India's leading esports community. The event showcased thrilling gaming competitions and brought together esports enthusiasts from across the campus.

Highlights included:
• Live streaming of professional esports matches
• Interactive Q&A sessions with gaming experts
• Prize giveaways for attendees
• Networking opportunities with fellow gaming enthusiasts`,
    shortDesc: "India's leading esports community.",
    type: 'past'
  },
  {
    id: 2,
    title: "Inter-College Cricket Cup",
    date: "November 10, 2024",
    heroImage: "https://placehold.co/1000x500/6f4e37/ffffff?text=Cricket+Cup+Finals",
    gallery: [
      "https://placehold.co/300x300/a3c2a3/333?text=Toss",
      "https://placehold.co/300x300/6f4e37/fff?text=Match",
      "https://placehold.co/300x300/b08968/fff?text=Victory"
    ],
    description: `Our college cricket team showcased exceptional skill and sportsmanship in the Inter-College Cricket Cup. After intense matches against top competitors, our team secured the runner-up position, demonstrating remarkable talent and teamwork.

Key Highlights:
• Outstanding batting performances
• Strategic bowling that restricted opponents
• Brilliant fielding saves
• Team spirit that inspired the entire college`,
    shortDesc: "Our college team secured the runner-up position...",
    type: 'past'
  },
  {
    id: 3,
    title: "Management Summit",
    date: "February 05, 2025",
    heroImage: "https://placehold.co/1000x500/6f4e37/ffffff?text=Management+Summit",
    gallery: [],
    description: "An interactive workshop featuring industry leaders discussing future trends in business management.",
    shortDesc: "An interactive workshop featuring industry leaders discussing future trends in business management.",
    type: 'upcoming'
  },
  {
    id: 4,
    title: "Tech & Innovation Expo",
    date: "March 20, 2025",
    heroImage: "https://placehold.co/1000x500/6f4e37/ffffff?text=Tech+Expo",
    gallery: [],
    description: "Showcase your projects and startups. Registration is open for all departments until March 1st.",
    shortDesc: "Showcase your projects and startups. Registration is open for all departments until March 1st.",
    type: 'upcoming'
  }
];
