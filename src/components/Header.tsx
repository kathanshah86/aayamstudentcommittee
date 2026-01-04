import logo from "@/assets/logo.jpg";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={`gradient-header flex items-center px-6 py-5 shadow-lg md:px-10 ${className || ''}`}>
      <img 
        src={logo} 
        alt="AAYAM Logo" 
        className="w-16 h-16 object-contain rounded-full"
      />
      <div className="ml-4">
        <h1 className="text-2xl md:text-3xl font-black text-primary">
          AAYAM COMMITTEE
        </h1>
        <p className="text-sm text-muted-foreground">
          Official College Committee Website
        </p>
      </div>
    </header>
  );
};

export default Header;
