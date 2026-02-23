import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, Bell, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>
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
