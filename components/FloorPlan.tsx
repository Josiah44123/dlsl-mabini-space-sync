import React from 'react';
import { Room } from '../types';

interface FloorPlanProps {
  floorNumber: number;
  rooms: Room[];
  onRoomClick: (room: Room) => void;
}


const getStudentStatusStyles = (room: Room) => {
  switch (room.computedStatus) {
    case 'occupied':
      return 'bg-red-500 border-red-600 text-white hover:bg-red-600 shadow-red-200 cursor-pointer';
    case 'reserved':
      return 'bg-yellow-400 border-yellow-500 text-yellow-900 hover:bg-yellow-500 shadow-yellow-200 cursor-pointer';
    case 'free':
      return 'bg-emerald-400 border-emerald-500 text-white hover:bg-emerald-500 shadow-emerald-200 cursor-pointer';
    default:
      return 'bg-gray-200 border-gray-300 text-gray-500 cursor-pointer';
  }
};


const OFFICE_STYLE = "bg-slate-700 border-slate-800 text-gray-100 shadow-xl cursor-not-allowed";

interface RoomCardProps {
  room: Room;
  onClick: (room: Room) => void;
  variant?: 'student' | 'office'; 
  customName?: string; 
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, variant = 'student', customName }) => {
  const isOffice = variant === 'office';
  const styles = isOffice ? OFFICE_STYLE : getStudentStatusStyles(room);

  return (
    <div
      onClick={() => !isOffice && onClick(room)} 
      className={`relative flex flex-col items-center justify-center rounded-xl border-b-[6px] shadow-lg transition-all transform w-full p-3 
        ${isOffice ? '' : 'hover:-translate-y-1 hover:shadow-xl active:border-b-2 active:translate-y-1'} 
        ${styles}
        ${isOffice ? 'h-32 md:h-40 max-w-md' : 'h-24 md:h-32'} 
      `}
    >
      {}
      <span className={`font-bold tracking-tight ${isOffice ? 'text-3xl' : 'text-lg'}`}>
        {customName || room.name}
      </span>
      
      {}
      <span className={`text-xs font-medium uppercase tracking-wider mt-1 ${isOffice ? 'text-slate-400' : 'opacity-90'}`}>
        {isOffice ? 'Admin / Office' : room.computedStatus}
      </span>
      
      {}
      {isOffice && (
        <div className="absolute top-3 right-3 text-slate-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
           </svg>
        </div>
      )}

      {}
      {!isOffice && room.computedStatus === 'occupied' && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
    </div>
  );
};

const FloorPlan: React.FC<FloorPlanProps> = ({ floorNumber, rooms, onRoomClick }) => {
  
 
  const topRoom = rooms.length > 0 ? rooms[0] : null;
  const bottomRoom = rooms.length > 1 ? rooms[rooms.length - 1] : null;
  const middleRooms = rooms.slice(1, rooms.length - 1);
  
  
  const halfPoint = Math.ceil(middleRooms.length / 2);
  const leftWing = middleRooms.slice(0, halfPoint);
  const rightWing = middleRooms.slice(halfPoint);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col items-center">
        
        {}
        <div className="w-full flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                Level {floorNumber}
            </h2>
            <div className="text-xs text-gray-400 font-medium">
                North Wing Building
            </div>
        </div>

        <div className="w-full flex flex-col gap-8">
            
            {}
            <div className="flex justify-center items-center w-full">
                {topRoom && (
                   <RoomCard 
                       room={topRoom} 
                       onClick={onRoomClick} 
                       variant="office"
                     
                       customName={`MB ${floorNumber}00`} 
                    />
                )}
            </div>

            {}
            <div className="flex flex-row justify-between w-full gap-4 md:gap-8">
                
                {}
                <div className="flex-1 flex flex-col gap-4">
                    {leftWing.map(room => (
                        <RoomCard key={room.id} room={room} onClick={onRoomClick} variant="student" />
                    ))}
                </div>

                {}
                <div className="hidden md:flex flex-col items-center justify-center w-16 opacity-30">
                    <div className="h-full border-l-2 border-r-2 border-dashed border-gray-400 w-full"></div>
                </div>

                {}
                <div className="flex-1 flex flex-col gap-4">
                    {rightWing.map(room => (
                        <RoomCard key={room.id} room={room} onClick={onRoomClick} variant="student" />
                    ))}
                </div>
            </div>

            {}
            <div className="flex justify-center items-center w-full">
                {bottomRoom && (
                   <RoomCard 
                       room={bottomRoom} 
                       onClick={onRoomClick} 
                       variant="office"
                       customName={`Utility / Exit`} 
                    />
                )}
            </div>

        </div>
    </div>
  );
};

export default FloorPlan;