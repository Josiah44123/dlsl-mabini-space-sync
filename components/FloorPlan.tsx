import React from 'react';
import { Room } from '../types';

interface FloorPlanProps {
  floorNumber: number;
  rooms: Room[];
  onRoomClick: (room: Room) => void;
}

const getStatusStyles = (room: Room) => {
  switch (room.computedStatus) {
    case 'occupied':
      return 'bg-red-500 border-red-600 text-white hover:bg-red-600 shadow-red-200';
    case 'reserved':
      return 'bg-yellow-400 border-yellow-500 text-yellow-900 hover:bg-yellow-500 shadow-yellow-200';
    case 'free':
      return 'bg-emerald-400 border-emerald-500 text-white hover:bg-emerald-500 shadow-emerald-200';
    default:
      return 'bg-gray-200 border-gray-300 text-gray-500';
  }
};

interface RoomCardProps {
  room: Room;
  onClick: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => (
  <button
    onClick={() => onClick(room)}
    className={`relative group flex flex-col items-center justify-center h-32 md:h-40 rounded-xl border-b-4 shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl w-full p-2 ${getStatusStyles(room)}`}
  >
    <span className="text-lg md:text-xl font-bold tracking-tight">{room.name}</span>
    <span className="text-xs opacity-90 font-medium uppercase tracking-wider mt-1">
      {room.computedStatus}
    </span>
    
    {/* Occupancy Indicator */}
    {room.computedStatus === 'occupied' && (
      <span className="absolute top-2 right-2 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
    )}

    {/* Hover Info */}
    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
      <span className="text-xs bg-white text-gray-900 px-2 py-1 rounded shadow font-semibold">
         Details
      </span>
    </div>
  </button>
);

const FloorPlan: React.FC<FloorPlanProps> = ({ floorNumber, rooms, onRoomClick }) => {
  // We'll simulate a corridor layout:
  // Top row: rooms 1-6
  // Corridor
  // Bottom row: rooms 7-12
  
  const topRooms = rooms.slice(0, 6);
  const bottomRooms = rooms.slice(6, 12);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
        
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-700">Floor {floorNumber} Layout</h3>
            <div className="flex gap-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-400 rounded-full"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Occupied</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> Reserved</div>
            </div>
        </div>

        <div className="space-y-8 relative">
            {/* Top Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {topRooms.map(room => <RoomCard key={room.id} room={room} onClick={onRoomClick} />)}
            </div>

            {/* Corridor Visualization */}
            <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg border-x-2 border-dashed border-gray-200 mx-4">
                <span className="text-gray-300 font-bold tracking-[1em] uppercase text-sm">Corridor</span>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {bottomRooms.map(room => <RoomCard key={room.id} room={room} onClick={onRoomClick} />)}
            </div>
        </div>
    </div>
  );
};

export default FloorPlan;