export type RoomStatus = 'free' | 'occupied' | 'reserved';

export interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  // If manualOverride is set, it takes precedence over scheduled classes
  manualOverride: RoomStatus | null;
  // Helper property for UI, calculated based on override + schedule
  computedStatus?: RoomStatus;
  currentClass?: string | null;
}

export interface ClassSchedule {
  id: string;
  roomId: string;
  courseName: string;
  instructor: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:MM" 24h format
  endTime: string; // "HH:MM" 24h format
}

export interface AuditLog {
  id: string;
  roomId: string;
  roomName: string;
  action: string; // e.g., "Changed status to Occupied"
  timestamp: Date;
  user: string; // "Admin"
}

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  issueType: 'AC' | 'Electrical' | 'Plumbing' | 'Furniture' | 'Cleanliness' | 'Other';
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  reportedAt: Date;
  reportedBy: string;
}

export interface LostItem {
  id: string;
  type: 'lost' | 'found';
  itemName: string;
  description: string;
  location: string;
  contactInfo: string;
  status: 'open' | 'resolved';
  date: Date;
}

export type UserRole = 'user' | 'admin';

export interface FloorData {
  floorNumber: number;
  rooms: Room[];
}