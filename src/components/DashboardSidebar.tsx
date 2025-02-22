
import { CalendarDays, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-2 text-left text-sm font-medium rounded-lg",
      active 
        ? "bg-green-50 text-green-700" 
        : "text-gray-500 hover:bg-gray-50"
    )}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

interface DashboardSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function DashboardSidebar({ activeView, onViewChange }: DashboardSidebarProps) {
  return (
    <div className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Agency A's Dashboard</h1>
      </div>
      <nav className="space-y-2">
        <SidebarItem 
          icon={CalendarDays} 
          label="Upcoming Calls" 
          active={activeView === 'calls'}
          onClick={() => onViewChange('calls')}
        />
        <SidebarItem 
          icon={LayoutGrid} 
          label="Project Boards" 
          active={activeView === 'boards'}
          onClick={() => onViewChange('boards')}
        />
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          active={activeView === 'settings'}
          onClick={() => onViewChange('settings')}
        />
      </nav>
    </div>
  );
}
