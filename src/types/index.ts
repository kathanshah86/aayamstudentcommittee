export interface TeamMember {
  id: number;
  name: string;
  role: string;
  dept: string;
  img: string;
}

export interface EventData {
  id: number;
  title: string;
  date: string;
  heroImage: string;
  gallery: string[];
  description: string;
  shortDesc: string;
  type: 'past' | 'upcoming';
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}
