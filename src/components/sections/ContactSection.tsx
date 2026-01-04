import { Mail } from "lucide-react";

const ContactSection = () => {
  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-3xl font-black text-primary mb-8">Contact</h2>
      
      <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground mb-4">
        <Mail className="w-5 h-5 text-secondary" />
        <a 
          href="mailto:aayamcommittee@gmail.com" 
          className="hover:text-primary transition-colors"
        >
          aayamcommittee@gmail.com
        </a>
      </div>
      
      <p className="text-muted-foreground">
        Follow us on social media for updates!
      </p>
    </div>
  );
};

export default ContactSection;
