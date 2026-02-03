import React from 'react';
import { ClassSchedule } from '../types';

interface ScheduleViewProps {
  schedules: ClassSchedule[];
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ schedules }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Helper to determine position and height of an event
  const getEventStyle = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    // Grid starts at 8:00 (row 1). Each hour is 60px height.
    // 08:00 is 0 minutes offset from start.
    const startOffsetMinutes = (startH - 8) * 60 + startM;
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    return {
      top: `${(startOffsetMinutes / 60) * 4}rem`, // 4rem = h-16 = 64px approx
      height: `${(durationMinutes / 60) * 4}rem`,
    };
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50">
        <div className="py-2 px-2 text-xs font-semibold text-gray-400 text-center border-r border-gray-100">Time</div>
        {days.map((day, i) => (
          <div key={day} className={`py-2 px-2 text-xs font-semibold text-gray-700 text-center ${i < 4 ? 'border-r border-gray-100' : ''}`}>
            {day}
          </div>
        ))}
      </div>
      
      <div className="relative h-[40rem] overflow-y-auto">
        {/* Grid Background */}
        <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
             <div className="border-r border-gray-100"></div> {/* Time col */}
             {days.map((_, i) => <div key={i} className={`${i < 4 ? 'border-r border-gray-100' : ''}`}></div>)}
        </div>

        {/* Time Labels */}
        <div className="absolute left-0 top-0 bottom-0 w-[16.666%] flex flex-col pointer-events-none">
            {timeSlots.map(time => (
                <div key={time} className="h-16 text-[10px] text-gray-400 text-center pt-1 border-b border-gray-50">
                    {time}
                </div>
            ))}
        </div>

        {/* Events */}
        <div className="absolute left-[16.666%] right-0 top-0 bottom-0 grid grid-cols-5">
            {days.map((day, dayIndex) => {
                const daySchedules = schedules.filter(s => s.dayOfWeek === dayIndex + 1); // Mock data 1=Mon
                return (
                    <div key={day} className="relative h-full">
                        {daySchedules.map(schedule => (
                            <div
                                key={schedule.id}
                                className="absolute left-1 right-1 rounded px-2 py-1 text-xs bg-indigo-100 text-indigo-700 border-l-2 border-indigo-500 shadow-sm overflow-hidden"
                                style={getEventStyle(schedule.startTime, schedule.endTime)}
                            >
                                <div className="font-semibold truncate">{schedule.courseName}</div>
                                <div className="text-[10px] opacity-75">{schedule.startTime} - {schedule.endTime}</div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;