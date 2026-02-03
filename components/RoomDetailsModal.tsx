import React, { useEffect, useState } from 'react';
import { X, Clock, Users, BookOpen, AlertCircle, CheckCircle, Lock, Wrench, Send } from 'lucide-react';
import { Room, ClassSchedule, UserRole, RoomStatus, MaintenanceRequest } from '../types';
import { getSchedulesByRoom, getMaintenanceRequests, reportMaintenanceIssue, updateMaintenanceStatus } from '../services/spaceSyncService';
import ScheduleView from './ScheduleView';

interface RoomDetailsModalProps {
  room: Room;
  onClose: () => void;
  userRole: UserRole;
  onStatusChange: (roomId: string, status: RoomStatus | null) => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, onClose, userRole, onStatusChange }) => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'maintenance'>('info');
  
  // Maintenance Form State
  const [issueType, setIssueType] = useState('AC');
  const [issueDesc, setIssueDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [room.id]);

  const fetchData = async () => {
    setLoading(true);
    const [schedData, mainData] = await Promise.all([
        getSchedulesByRoom(room.id),
        getMaintenanceRequests(room.id)
    ]);
    setSchedules(schedData);
    setMaintenanceRequests(mainData);
    setLoading(false);
  };

  const handleReportMaintenance = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      await reportMaintenanceIssue({
          roomId: room.id,
          issueType: issueType as any,
          description: issueDesc,
          reportedBy: userRole === 'admin' ? 'Admin' : 'Student/Faculty'
      });
      setIssueDesc('');
      await fetchData(); // refresh list
      setSubmitting(false);
  };

  const handleUpdateMaintenance = async (id: string, status: 'resolved' | 'in-progress') => {
      await updateMaintenanceStatus(id, status);
      await fetchData();
  };

  const getStatusColor = (status: RoomStatus | undefined) => {
    switch (status) {
      case 'occupied': return 'text-red-600 bg-red-100';
      case 'reserved': return 'text-yellow-600 bg-yellow-100';
      case 'free': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: RoomStatus | undefined) => {
    switch (status) {
      case 'occupied': return 'Occupied';
      case 'reserved': return 'Reserved';
      case 'free': return 'Available';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{room.name}</h2>
            <p className="text-sm text-gray-500">Floor {room.floor} • Capacity: {room.capacity}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            {['info', 'schedule', 'maintenance'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'info' && (
            <div className="space-y-6">
                
                {/* Status Card */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(room.computedStatus)}`}>
                            {room.computedStatus === 'occupied' ? <Users className="w-6 h-6" /> : 
                             room.computedStatus === 'reserved' ? <Lock className="w-6 h-6" /> : 
                             <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Current Status</p>
                            <h3 className="text-lg font-bold text-gray-900">{getStatusLabel(room.computedStatus)}</h3>
                        </div>
                    </div>
                    {room.computedStatus === 'occupied' && (
                         <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live
                         </div>
                    )}
                </div>

                {/* Current Class Detail */}
                {room.computedStatus === 'occupied' && (
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                        <div className="flex items-start gap-3">
                            <BookOpen className="w-5 h-5 text-indigo-600 mt-1" />
                            <div>
                                <h4 className="font-semibold text-indigo-900">Current Session</h4>
                                <p className="text-indigo-700">{room.currentClass || "Reserved Event"}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-500">
                                    <Clock className="w-3 h-3" />
                                    <span>Ending soon (simulated)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Actions */}
                {userRole === 'admin' && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldIcon className="w-4 h-4 text-indigo-600" />
                            Admin Controls
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">Manually override the current status. This will persist until cleared.</p>
                        
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <button 
                                onClick={() => onStatusChange(room.id, 'free')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${room.manualOverride === 'free' ? 'bg-green-600 text-white border-green-600 shadow-md ring-2 ring-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Force Free
                            </button>
                            <button 
                                onClick={() => onStatusChange(room.id, 'occupied')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${room.manualOverride === 'occupied' ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Force Busy
                            </button>
                            <button 
                                onClick={() => onStatusChange(room.id, 'reserved')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${room.manualOverride === 'reserved' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md ring-2 ring-yellow-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Reserve
                            </button>
                             <button 
                                onClick={() => onStatusChange(room.id, null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                            >
                                Clear
                            </button>
                        </div>
                        {room.manualOverride && (
                             <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded border border-orange-100">
                                <AlertCircle className="w-3 h-3" />
                                <span>Manual override active: <b>{room.manualOverride.toUpperCase()}</b></span>
                             </div>
                        )}
                    </div>
                )}
            </div>
          )}

          {activeTab === 'schedule' && (
             <div className="h-full">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">Loading schedule...</div>
                ) : (
                    <ScheduleView schedules={schedules} />
                )}
             </div>
          )}

          {activeTab === 'maintenance' && (
              <div className="space-y-6">
                  {/* Report Form */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-orange-600" /> Report Issue
                      </h4>
                      <form onSubmit={handleReportMaintenance} className="space-y-3">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Issue Type</label>
                              <select 
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                              >
                                  <option>AC</option>
                                  <option>Electrical</option>
                                  <option>Plumbing</option>
                                  <option>Furniture</option>
                                  <option>Cleanliness</option>
                                  <option>Other</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                              <textarea 
                                value={issueDesc}
                                onChange={(e) => setIssueDesc(e.target.value)}
                                placeholder="Describe the problem..."
                                required
                                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                                rows={2}
                              />
                          </div>
                          <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                              {submitting ? 'Sending...' : <>Send Request <Send className="w-3 h-3" /></>}
                          </button>
                      </form>
                  </div>

                  {/* Requests List */}
                  <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Requests</h4>
                      {loading ? (
                          <div className="text-center text-gray-400 py-4">Loading...</div>
                      ) : maintenanceRequests.length === 0 ? (
                          <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                              No active maintenance requests.
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {maintenanceRequests.map(req => (
                                  <div key={req.id} className={`p-3 rounded-lg border ${req.status === 'resolved' ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-orange-200 shadow-sm'}`}>
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                              {req.issueType}
                                          </span>
                                          <span className={`text-xs font-medium ${req.status === 'resolved' ? 'text-green-600' : req.status === 'in-progress' ? 'text-blue-600' : 'text-gray-500'}`}>
                                              {req.status.toUpperCase()}
                                          </span>
                                      </div>
                                      <p className="text-sm text-gray-800 font-medium">{req.description}</p>
                                      <p className="text-xs text-gray-500 mt-1">Reported by {req.reportedBy} on {new Date(req.reportedAt).toLocaleDateString()}</p>
                                      
                                      {/* Admin Resolve Actions */}
                                      {userRole === 'admin' && req.status !== 'resolved' && (
                                          <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                                              {req.status === 'pending' && (
                                                  <button 
                                                    onClick={() => handleUpdateMaintenance(req.id, 'in-progress')}
                                                    className="text-xs text-blue-600 hover:underline font-medium"
                                                  >
                                                      Mark In Progress
                                                  </button>
                                              )}
                                              <button 
                                                onClick={() => handleUpdateMaintenance(req.id, 'resolved')}
                                                className="text-xs text-green-600 hover:underline font-medium"
                                              >
                                                  Mark Resolved
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper for the Shield Icon since it wasn't imported in this scope
const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export default RoomDetailsModal;