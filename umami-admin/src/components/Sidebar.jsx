import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertCircle, 
  LogOut, 
  History 
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const Sidebar = () => {
  const { logout, admin } = useAdmin();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Content Moderation', path: '/content', icon: FileText },
    { name: 'Reports', path: '/reports', icon: AlertCircle },
    { name: 'Activity Logs', path: '/logs', icon: History },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">Umami Admin</h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{admin?.role || 'Staff'}</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-orange-50 text-primary dark:bg-orange-900/10' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export { Sidebar };
