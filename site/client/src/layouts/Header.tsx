import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, Building2, Users, FileText, Hash } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Organization } from '../types';
import { getOrganizationById } from '../services/firestore';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [showOrgPopover, setShowOrgPopover] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const userInitialRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (showOrgPopover && currentUser?.organizationId && !organization) {
      setLoadingOrg(true);
      getOrganizationById(currentUser.organizationId)
        .then(setOrganization)
        .catch(console.error)
        .finally(() => setLoadingOrg(false));
    }
  }, [showOrgPopover, currentUser, organization]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        userInitialRef.current &&
        !userInitialRef.current.contains(event.target as Node)
      ) {
        setShowOrgPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const toggleOrgPopover = () => {
    if (currentUser?.organizationId) {
      setShowOrgPopover((prev) => !prev);
    }
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-md">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
          {currentUser?.role === 'admin' ? 'Espace Administrateur' : 'Espace Client'}
        </h2>
      </div>

      <div className="flex items-center gap-4">

        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
          </div>
          <div 
            ref={userInitialRef}
            className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 cursor-pointer"
            onClick={toggleOrgPopover}
          >
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>

          {showOrgPopover && currentUser?.organizationId && ( 
            <div 
              ref={popoverRef}
              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-20 top-full border border-gray-100"
            >
              <div className="px-4 py-2 text-sm font-semibold text-gray-800 border-b border-gray-100">
                Détails de l'Organisation
              </div>
              {loadingOrg ? (
                <div className="px-4 py-2 text-sm text-gray-600">Chargement...</div>
              ) : organization ? (
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium">{organization.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Employés: {organization.employeeCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Hash className="w-4 h-4" />
                    <span>Numéro de TVA: {organization.vatNumber}</span>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2 text-sm text-red-600">Impossible de charger les détails de l'organisation.</div>
              )}
            </div>
          )}

          <button 
            onClick={logout} 
            className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
