import { ClassSchedule, FloorData, Room } from '../types';

// Helper to generate rooms for a floor
const generateRoomsForFloor = (floor: number): Room[] => {
  const rooms: Room[] = [];
  const roomsPerFloor = 12; // 6 on each side of a corridor
  
  for (let i = 1; i <= roomsPerFloor; i++) {
    rooms.push({
      id: `f${floor}-r${i}`,
      name: `MB-${floor}${i < 10 ? '0' + i : i}`,
      floor: floor,
      capacity: 30 + Math.floor(Math.random() * 20), // Random capacity 30-50
      manualOverride: null,
    });
  }
  return rooms;
};

export const INITIAL_FLOORS: FloorData[] = [
  { floorNumber: 1, rooms: generateRoomsForFloor(1) },
  { floorNumber: 2, rooms: generateRoomsForFloor(2) },
  { floorNumber: 3, rooms: generateRoomsForFloor(3) },
  { floorNumber: 4, rooms: generateRoomsForFloor(4) },
  { floorNumber: 5, rooms: generateRoomsForFloor(5) },
  { floorNumber: 6, rooms: generateRoomsForFloor(6) },
];

// Generate some random schedules
export const generateSchedules = (floors: FloorData[]): ClassSchedule[] => {
  const schedules: ClassSchedule[] = [];
  const days = [1, 2, 3, 4, 5]; // Mon-Fri
  const timeSlots = [
    { start: '08:00', end: '09:30' },
    { start: '10:00', end: '11:30' },
    { start: '13:00', end: '14:30' },
    { start: '15:00', end: '16:30' },
  ];
  const courses = ['Data Structures', 'Web Dev', 'Calculus', 'Physics', 'History', 'Ethics', 'Networking'];

  floors.forEach(floor => {
    floor.rooms.forEach(room => {
      // Randomly assign classes to ~60% of slots
      days.forEach(day => {
        timeSlots.forEach(slot => {
          if (Math.random() > 0.4) {
            schedules.push({
              id: `${room.id}-${day}-${slot.start}`,
              roomId: room.id,
              courseName: courses[Math.floor(Math.random() * courses.length)],
              instructor: 'Dr. Smith', // Placeholder
              dayOfWeek: day,
              startTime: slot.start,
              endTime: slot.end,
            });
          }
        });
      });
    });
  });

  return schedules;
};

export const INITIAL_SCHEDULES = generateSchedules(INITIAL_FLOORS);