interface HomeSectionProps {
  aboutText: string;
}

const HomeSection = ({ aboutText }: HomeSectionProps) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-3xl font-black text-primary mb-8">About Us</h2>
      <p className="text-center max-w-[850px] mx-auto text-lg leading-relaxed text-muted-foreground">
        {aboutText}
      </p>
    </div>
  );
};

export default HomeSection;
