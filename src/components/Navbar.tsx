import { cn } from "@/lib/utils";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'team', label: 'Team' },
  { id: 'events', label: 'Events' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
];

const Navbar = ({ activeSection, onNavigate }: NavbarProps) => {
  return (
    <nav className="gradient-nav text-center py-3.5 sticky top-0 z-50">
      <div className="flex flex-wrap justify-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-foreground",
              "hover:bg-secondary hover:text-secondary-foreground",
              activeSection === item.id && "bg-secondary text-secondary-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
