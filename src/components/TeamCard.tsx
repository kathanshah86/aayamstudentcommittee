import { TeamMember } from "@/types";

interface TeamCardProps {
  member: TeamMember;
}

const TeamCard = ({ member }: TeamCardProps) => {
  return (
    <div className="text-center p-4 bg-card rounded-xl transition-transform duration-300 hover:-translate-y-1">
      <img
        src={member.img}
        alt={member.name}
        className="w-28 h-28 object-cover object-top rounded-full mx-auto mb-3 border-4 border-accent"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/115x115?text=${member.name.charAt(0)}`;
        }}
      />
      <div className="text-xs font-extrabold text-primary uppercase mb-1">
        {member.role}
      </div>
      <div className="text-foreground font-medium">
        {member.name}
      </div>
    </div>
  );
};

export default TeamCard;
