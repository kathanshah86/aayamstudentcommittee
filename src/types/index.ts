export interface TeamMember {
  id: number;
  dbId?: string;
  name: string;
  role: string;
  dept: string;
  img: string;
}

export interface EventData {
  id: number;
  dbId?: string;
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
  dbId?: string;
  src: string;
  alt: string;
}
