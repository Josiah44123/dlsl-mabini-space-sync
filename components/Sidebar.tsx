import React from 'react';
import { Layers, User, Shield, Building, Search, LayoutGrid } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentFloor: number;
  onFloorChange: (floor: number) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentView: 'dashboard' | 'lost-found';
  onViewChange: (view: 'dashboard' | 'lost-found') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentFloor, 
  onFloorChange, 
  userRole, 
  onRoleChange,
  currentView,
  onViewChange
}) => {
  const floors = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col shadow-sm fixed left-0 top-0 z-10">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-green-700">
            <Building className="w-8 h-8" />
            <div>
                <h1 className="text-xl font-bold leading-tight">Mabini<br/><span className="text-gray-900 text-sm font-normal">Space-Sync</span></h1>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        
        {/* Main Views */}
        <div className="mb-8 space-y-2">
             <button
              onClick={() => onViewChange('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-green-50 text-green-700 shadow-sm font-medium border border-green-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
             <button
              onClick={() => onViewChange('lost-found')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'lost-found'
                  ? 'bg-green-50 text-green-700 shadow-sm font-medium border border-green-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Lost & Found</span>
            </button>
        </div>

        {/* Floor Selector (Only visible in Dashboard) */}
        {currentView === 'dashboard' && (
            <>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 ml-2">Floors</h2>
                <div className="space-y-1">
                {floors.map((floor) => (
                    <button
                    key={floor}
                    onClick={() => onFloorChange(floor)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                        currentFloor === floor
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    >
                    <Layers className="w-4 h-4" />
                    <span>Floor {floor}</span>
                    </button>
                ))}
                </div>
            </>
        )}
      </div>

      {/* Role Switcher (Bottom) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Role</h2>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => onRoleChange('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              userRole === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            User
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              userRole === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;