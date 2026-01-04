interface FooterProps {
  onAdminClick: () => void;
  showAdminLink: boolean;
}

const Footer = ({ onAdminClick, showAdminLink }: FooterProps) => {
  return (
    <footer className="gradient-footer text-white text-center py-5 mt-12">
      <p className="text-sm">
        © 2025 AAYAM Committee | Designed with ❤️
        {showAdminLink && (
          <button 
            onClick={onAdminClick}
            className="ml-2.5 text-white/60 text-xs hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            Admin Panel
          </button>
        )}
      </p>
    </footer>
  );
};

export default Footer;
