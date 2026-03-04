import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import FloorPlan from './components/FloorPlan';
import RoomDetailsModal from './components/RoomDetailsModal';
import LostAndFound from './components/LostAndFound';
import { FloorData, Room, UserRole, AuditLog } from './types';
import { getFloors, getSchedulesByRoom, calculateRoomStatus, updateRoomOverride, getAuditLogs } from './services/spaceSyncService';
import { Bell, Search, History } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'lost-found'>('dashboard');
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchFloors();
    // Simulate real-time polling every minute
    const interval = setInterval(fetchFloors, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchFloors = async () => {
    // We don't set global loading to true on polls to avoid flicker
    if (floors.length === 0) setLoading(true);
    
    const floorsData = await getFloors();
    
    // Process each room to calculate computed status based on schedules
    // In a real app, this might happen on the backend or more efficiently
    const processedFloors = await Promise.all(floorsData.map(async (floor) => {
      const roomsWithStatus = await Promise.all(floor.rooms.map(async (room) => {
         const schedules = await getSchedulesByRoom(room.id);
         return calculateRoomStatus(room, schedules);
      }));
      return { ...floor, rooms: roomsWithStatus };
    }));

    setFloors(processedFloors);
    setLoading(false);
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleStatusChange = async (roomId: string, status: any) => {
    await updateRoomOverride(roomId, status, 'Admin');
    await fetchFloors(); // Refresh data
    // Update local selected room to reflect changes immediately in modal
    if (selectedRoom) {
        setSelectedRoom(prev => prev ? ({ ...prev, manualOverride: status, computedStatus: status || 'free' }) : null);
    }
    // Refresh logs if open
    if (showLogs) fetchLogs();
  };

  const fetchLogs = async () => {
      const data = await getAuditLogs();
      setLogs(data);
  }

  const toggleLogs = () => {
      if (!showLogs) fetchLogs();
      setShowLogs(!showLogs);
  }

  const currentFloorData = floors.find(f => f.floorNumber === currentFloor);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        currentFloor={currentFloor} 
        onFloorChange={setCurrentFloor}
        userRole={userRole}
        onRoleChange={setUserRole}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content Area */}
      <div className="ml-64 p-8">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mabini Building Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time space monitoring system</p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Admin Log Toggle */}
             {userRole === 'admin' && (
                 <button 
                    onClick={toggleLogs}
                    className={`p-2 rounded-full transition-colors relative ${showLogs ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                    title="Audit Logs"
                 >
                    <History className="w-5 h-5" />
                 </button>
             )}

             <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input 
                    type="text" 
                    placeholder="Search room..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 w-64 shadow-sm"
                />
             </div>
             <button className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors shadow-sm">
                <Bell className="w-5 h-5" />
             </button>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-green-200">
                {userRole === 'admin' ? 'A' : 'U'}
             </div>
          </div>
        </header>

        {/* Audit Logs Drawer (Admin Only) */}
        {showLogs && userRole === 'admin' && (
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    Recent Activity Logs
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                    {logs.length === 0 ? (
                        <p className="text-gray-400 text-sm">No recent activity recorded.</p>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700">{log.roomName}</span>
                                    <span className="text-gray-600">{log.action}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(log.timestamp).toLocaleTimeString()} • {log.user}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* Dynamic Content Based on View */}
        {currentView === 'dashboard' ? (
             loading ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                   <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
                   <p>Syncing space data...</p>
                </div>
             ) : (
               <>
                  {currentFloorData ? (
                      <FloorPlan 
                         floorNumber={currentFloor} 
                         rooms={currentFloorData.rooms} 
                         onRoomClick={handleRoomClick}
                      />
                  ) : (
                      <div>Floor data not found</div>
                  )}
               </>
             )
        ) : (
            <LostAndFound userRole={userRole} />
        )}

        {/* Room Modal */}
        {selectedRoom && (
            <RoomDetailsModal 
                room={selectedRoom} 
                onClose={() => setSelectedRoom(null)}
                userRole={userRole}
                onStatusChange={handleStatusChange}
            />
        )}
      </div>
    </div>
  );
};

export default App;