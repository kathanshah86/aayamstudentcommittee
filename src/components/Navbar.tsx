import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { User, LogIn } from "lucide-react";

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
  const { user, isAdmin } = useAuth();

  return (
    <nav className="gradient-nav text-center py-3.5 sticky top-0 z-50">
      <div className="flex flex-wrap justify-center items-center gap-2">
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
        
        {/* Auth Button */}
        <button
          onClick={() => onNavigate('auth')}
          className={cn(
            "px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-foreground flex items-center gap-2",
            "hover:bg-secondary hover:text-secondary-foreground",
            activeSection === 'auth' && "bg-secondary text-secondary-foreground"
          )}
        >
          {user ? (
            <>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </>
          )}
        </button>

        {/* Admin Button - Only visible to admins */}
        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-foreground",
              "hover:bg-primary hover:text-primary-foreground",
              "bg-primary/20 border border-primary/30",
              activeSection === 'admin' && "bg-primary text-primary-foreground"
            )}
          >
            Admin
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
