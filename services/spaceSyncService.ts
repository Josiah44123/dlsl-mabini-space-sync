import { Room, ClassSchedule, RoomStatus, AuditLog, MaintenanceRequest, LostItem } from '../types';
import { INITIAL_FLOORS, INITIAL_SCHEDULES } from './mockData';

// Simulating a backend store in memory
let floorsStore = JSON.parse(JSON.stringify(INITIAL_FLOORS));
let schedulesStore = JSON.parse(JSON.stringify(INITIAL_SCHEDULES));
let logsStore: AuditLog[] = [];
let maintenanceStore: MaintenanceRequest[] = [];
let lostAndFoundStore: LostItem[] = [
  {
    id: '1',
    type: 'found',
    itemName: 'Blue Umbrella',
    description: 'Found under a chair near the back.',
    location: 'MB-102',
    contactInfo: 'Turned over to guard',
    status: 'open',
    date: new Date()
  },
  {
    id: '2',
    type: 'lost',
    itemName: 'Calculus Textbook',
    description: 'Hardcover, slightly worn.',
    location: '3rd Floor Hallway',
    contactInfo: 'student@dlsl.edu.ph',
    status: 'open',
    date: new Date(Date.now() - 86400000)
  }
];

// Helper to check if current time is within a slot
const isTimeInSlot = (currentTime: Date, start: string, end: string): boolean => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const [startH, startM] = start.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  
  const [endH, endM] = end.split(':').map(Number);
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

export const getFloors = async () => {
  // Simulate network delay
  return new Promise<typeof floorsStore>((resolve) => {
    setTimeout(() => resolve([...floorsStore]), 300);
  });
};

export const getSchedulesByRoom = async (roomId: string) => {
  return new Promise<ClassSchedule[]>((resolve) => {
    const roomSchedules = schedulesStore.filter((s: ClassSchedule) => s.roomId === roomId);
    setTimeout(() => resolve(roomSchedules), 200);
  });
};

export const updateRoomOverride = async (roomId: string, status: RoomStatus | null, user: string) => {
  return new Promise<void>((resolve) => {
    floorsStore = floorsStore.map((floor: any) => ({
      ...floor,
      rooms: floor.rooms.map((room: Room) => {
        if (room.id === roomId) {
            // Log the change
            const log: AuditLog = {
                id: Date.now().toString(),
                roomId: room.id,
                roomName: room.name,
                action: status ? `Manual override set to ${status}` : 'Manual override cleared',
                timestamp: new Date(),
                user: user
            };
            logsStore.unshift(log); // Add to beginning
            return { ...room, manualOverride: status };
        }
        return room;
      })
    }));
    setTimeout(() => resolve(), 200);
  });
};

export const getAuditLogs = async () => {
    return new Promise<AuditLog[]>((resolve) => {
        setTimeout(() => resolve([...logsStore]), 200);
    });
}

// Maintenance Services
export const getMaintenanceRequests = async (roomId: string) => {
  return new Promise<MaintenanceRequest[]>((resolve) => {
    const requests = maintenanceStore.filter(r => r.roomId === roomId);
    setTimeout(() => resolve(requests), 200);
  });
};

export const reportMaintenanceIssue = async (request: Omit<MaintenanceRequest, 'id' | 'reportedAt' | 'status'>) => {
  return new Promise<void>((resolve) => {
    const newRequest: MaintenanceRequest = {
      ...request,
      id: Date.now().toString(),
      reportedAt: new Date(),
      status: 'pending'
    };
    maintenanceStore.unshift(newRequest);
    setTimeout(() => resolve(), 300);
  });
};

export const updateMaintenanceStatus = async (id: string, status: MaintenanceRequest['status']) => {
  return new Promise<void>((resolve) => {
    maintenanceStore = maintenanceStore.map(req => 
      req.id === id ? { ...req, status } : req
    );
    setTimeout(() => resolve(), 200);
  });
};

// Lost & Found Services
export const getLostAndFoundItems = async () => {
  return new Promise<LostItem[]>((resolve) => {
    setTimeout(() => resolve([...lostAndFoundStore]), 300);
  });
};

export const reportLostItem = async (item: Omit<LostItem, 'id' | 'date' | 'status'>) => {
  return new Promise<void>((resolve) => {
    const newItem: LostItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date(),
      status: 'open'
    };
    lostAndFoundStore.unshift(newItem);
    setTimeout(() => resolve(), 300);
  });
};

export const resolveLostItem = async (id: string) => {
    return new Promise<void>((resolve) => {
        lostAndFoundStore = lostAndFoundStore.map(item => 
            item.id === id ? { ...item, status: 'resolved' } : item
        );
        setTimeout(() => resolve(), 200);
    });
}

// The core logic to merge schedule + manual override
export const calculateRoomStatus = (room: Room, schedules: ClassSchedule[]): Room => {
  const now = new Date();
  const currentDay = now.getDay(); // 0-6

  // 1. Check Manual Override first
  if (room.manualOverride) {
    return {
      ...room,
      computedStatus: room.manualOverride,
      currentClass: room.manualOverride === 'occupied' ? 'Manual Override' : null
    };
  }

  // 2. Check Schedule
  const activeClass = schedules.find(s => 
    s.roomId === room.id && 
    s.dayOfWeek === currentDay && 
    isTimeInSlot(now, s.startTime, s.endTime)
  );

  if (activeClass) {
    return {
      ...room,
      computedStatus: 'occupied',
      currentClass: activeClass.courseName
    };
  }

  // 3. Default Free
  return {
    ...room,
    computedStatus: 'free',
    currentClass: null
  };
};