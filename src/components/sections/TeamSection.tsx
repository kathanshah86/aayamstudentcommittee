import { TeamMember } from "@/types";
import TeamCard from "@/components/TeamCard";

interface TeamSectionProps {
  teamData: TeamMember[];
  departments: string[];
}

// Role order for sorting within departments
const roleOrder = ["Head", "Vice Head", "Secretary", "Vice Secretary"];

// Department display order
const DEPARTMENT_ORDER = [
  "Advisory",
  "Management Department",
  "Media Department",
  "Sports & Cultural Head",
  "Sports Department",
  "Cultural Department",
  "Technical"
];

const getRoleOrder = (role: string): number => {
  const index = roleOrder.findIndex(r => role.toLowerCase().includes(r.toLowerCase()));
  return index === -1 ? 999 : index;
};

const getDepartmentOrder = (dept: string): number => {
  const index = DEPARTMENT_ORDER.indexOf(dept);
  return index === -1 ? 999 : index;
};

const TeamSection = ({ teamData, departments }: TeamSectionProps) => {
  // Get Core members (President/VP)
  const coreMembers = teamData.filter(m => m.dept === "Core");
  const president = coreMembers.find(m => m.role.includes("President") && !m.role.includes("Vice"));
  const vicePresident = coreMembers.find(m => m.role.includes("Vice President"));

  // Get Advisory members
  const advisoryMembers = teamData.filter(m => m.dept === "Advisory");

  // Filter out Core and Advisory from regular departments and sort by order
  const regularDepartments = departments
    .filter(d => d !== "Core" && d !== "Advisory")
    .sort((a, b) => getDepartmentOrder(a) - getDepartmentOrder(b));

  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-3xl font-black text-primary mb-8">Organizing Team</h2>
      
      {/* Core Team - Side by Side */}
      {(president || vicePresident) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-[700px] mx-auto mb-10">
          {president && <TeamCard member={president} />}
          {vicePresident && <TeamCard member={vicePresident} />}
        </div>
      )}

      {/* Advisory Section - right after Organizing Team */}
      {advisoryMembers.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl text-muted-foreground font-semibold border-b-2 border-accent pb-2 mb-5 inline-block">
            Advisory
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
            {advisoryMembers.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Other Departments - sorted by defined order, then by role order */}
      {regularDepartments.map((dept) => {
        const members = teamData
          .filter(m => m.dept === dept)
          .sort((a, b) => getRoleOrder(a.role) - getRoleOrder(b.role));
        
        if (members.length === 0) return null;
        
        return (
          <div key={dept} className="mb-8">
            <h3 className="text-xl text-muted-foreground font-semibold border-b-2 border-accent pb-2 mb-5 inline-block">
              {dept}
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
              {members.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamSection;
