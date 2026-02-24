import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Timer, 
  FileText, 
  BarChart3, 
  Award,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const role = currentUser?.role;

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/admin/organizations', icon: Building2, label: 'Organisations' },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/sprints', icon: Timer, label: 'Sprints' },
    { to: '/admin/documents', icon: FileText, label: 'Documents' },
    { to: '/admin/diagnostics', icon: BarChart3, label: 'Diagnostics' },
  ];

  const clientLinks = [
    { to: '/client/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/client/documents', icon: FileText, label: 'Documents' },
    { to: '/client/diagnostics', icon: BarChart3, label: 'Diagnostics' },
    { to: '/client/achievements', icon: Award, label: 'Achievements' },
  ];

  const links = role === 'admin' ? adminLinks : clientLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 xl:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed xl:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? "w-64 translate-x-0" : "-translate-x-full xl:translate-x-0 xl:w-0 xl:border-none xl:overflow-hidden w-64"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 min-w-[16rem]">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Timer className="w-8 h-8" />
            <span>SprintMaster</span>
          </div>
          <button onClick={closeSidebar} className="xl:hidden text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 min-w-[16rem]">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.to);
            
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => window.innerWidth < 1280 && closeSidebar()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-500")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-indigo-900 mb-1">Besoin d'aide ?</h4>
            <p className="text-xs text-indigo-700 mb-3">Contactez le support technique.</p>
            <button className="w-full bg-indigo-600 text-white text-xs font-medium py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Contacter
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
