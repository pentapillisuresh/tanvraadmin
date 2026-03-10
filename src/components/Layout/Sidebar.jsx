import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiFolder, 
  FiBriefcase, 
  FiUsers, 
  FiLogOut 
} from 'react-icons/fi';
import { useAuth } from '../../services/auth';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/categories', icon: FiFolder, label: 'Categories' },
    { path: '/jobs', icon: FiBriefcase, label: 'Jobs' },
    { path: '/applications', icon: FiUsers, label: 'Applications' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                isActive ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : ''
              }`
            }
          >
            <item.icon className="mr-3" size={20} />
            {item.label}
          </NavLink>
        ))}
        
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors w-full"
        >
          <FiLogOut className="mr-3" size={20} />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;