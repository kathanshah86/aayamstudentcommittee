import { TeamMember } from "@/types";

export const departments = [
  "Core",
  "Management Department",
  "Media Department",
  "Sports & Cultural Head",
  "Sports Department",
  "Cultural Department"
];

export const teamData: TeamMember[] = [
  { id: 1, name: "Sumantu Ahir", role: "President", dept: "Core", img: "images/sumantu.jpg" },
  { id: 2, name: "Jenil Sorathiya", role: "Vice President", dept: "Core", img: "images/jenil.jpg.jpg" },
  { id: 3, name: "Vrushti Patel", role: "Head", dept: "Management Department", img: "images/vrushti.jpg.jpg" },
  { id: 4, name: "Varun Patel", role: "Vice Head", dept: "Management Department", img: "https://placehold.co/115x115?text=VP" },
  { id: 5, name: "Yashan Oswal", role: "Secretary", dept: "Management Department", img: "https://placehold.co/115x115?text=YO" },
  { id: 6, name: "Jaimin Vedant", role: "Vice Secretary", dept: "Management Department", img: "https://placehold.co/115x115?text=JV" },
  { id: 7, name: "Muskan Khokhr", role: "Head", dept: "Media Department", img: "/images/muskan.jpg.jpg" },
  { id: 8, name: "Aarya Maru", role: "Head", dept: "Sports & Cultural Head", img: "images/aarya.jpg.jpg" }
];
