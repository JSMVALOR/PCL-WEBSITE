
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

export default function ScheduleManager() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('60');
  const [editingRoom, setEditingRoom] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomCapacity, setEditRoomCapacity] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('academic_classrooms')
        .select('*')
        .order('name');
      
      if (roomsError) {
        console.warn("Classrooms table might not exist yet:", roomsError.message);
        setClassrooms([]);
      } else {
        setClassrooms(roomsData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const openEditModal = (room) => {
    setEditingRoom(room);
    setEditRoomName(room.name);
    setEditRoomCapacity(room.capacity);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editRoomName.trim()) return;
    try {
      const { error } = await supabase.from('academic_classrooms')
        .update({ name: editRoomName.trim(), capacity: editRoomCapacity })
        .eq('id', editingRoom.id);
      if (error) throw error;
      setEditingRoom(null);
      fetchData();
    } catch (err) {
      console.error(err);
      window.erpDialog?.alert("Failed to update classroom.");
    }
  };

  const handleAddClassroom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const { error } = await supabase.from('academic_classrooms').insert([{
        name: newRoomName.trim(),
        capacity: newRoomCapacity,
        status: 'Active'
      }]);
      
      if (error) throw error;
      window.erpDialog?.alert("Classroom added successfully.");
      setNewRoomName('');
      fetchData();
    } catch (err) {
      console.error("Error adding classroom:", err);
      window.erpDialog?.alert("Failed to add classroom. Did you run the SQL artifact?");
    }
  };

  const toggleClassroomStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Maintenance' : 'Active';
    try {
      const { error } = await supabase
        .from('academic_classrooms')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const deleteClassroom = async (id) => {
    
    try {
      const { error } = await supabase
        .from('academic_classrooms')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Error deleting classroom:", err);
      window.erpDialog?.alert("Failed to delete classroom. It might be in use.");
    }
  };

  if (loading) return <div className="p-8 text-center text-themeTextSec animate-pulse">Loading...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in pb-20">
      
      <div className="bg-themePanel/60 backdrop-blur-3xl border border-themeBorder dark:border-white/5 rounded-[2rem] p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20"></div>
        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tight text-themeText flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <i className="fa-solid fa-door-open"></i>
            </div>
            Classroom Management
          </h2>
          <p className="text-sm font-medium text-themeTextSec mt-2">Add, remove, and manage physical teaching spaces on campus.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white/50 dark:bg-black/20 border border-themeBorder dark:border-white/5 p-5 rounded-2xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-themeText mb-4">Add Classroom</h3>
              <form onSubmit={handleAddClassroom} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider">Room Name / Number</label>
                  <input type="text" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} required placeholder="e.g. Room 101, Moot Court" className="w-full bg-white dark:bg-themePanel border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider">Capacity</label>
                  <input type="number" value={newRoomCapacity} onChange={e => setNewRoomCapacity(e.target.value)} required placeholder="60" className="w-full bg-white dark:bg-themePanel border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-blue-500 transition-colors" />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-600 transition-colors mt-2">
                  Create Room
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-themeText">Active Facilities ({classrooms.length})</h3>
            <div className="flex flex-col gap-3">
              {classrooms.length === 0 ? (
                <div className="text-center py-10 bg-white/30 dark:bg-black/10 rounded-2xl border border-dashed border-themeBorder dark:border-white/10 text-themeTextSec text-sm">
                  No classrooms defined yet.
                </div>
              ) : (
                classrooms.map(room => (
                  <div key={room.id} className="flex items-center justify-between p-4 bg-white/80 dark:bg-themePanel/80 backdrop-blur-md rounded-2xl border border-themeBorder dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${room.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        <i className="fa-solid fa-door-open text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-themeText tracking-tight">{room.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-bold text-themeTextSec"><i className="fa-solid fa-users mr-1"></i> {room.capacity} Seats</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${room.status === 'Active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                            {room.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => openEditModal(room)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors"
                        title="Edit Classroom"
                      >
                        <i className="fa-solid fa-pen text-[10px]"></i>
                      </button>
                      <button 
                        type="button"
                        onClick={() => toggleClassroomStatus(room.id, room.status)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-themeText transition-colors"
                        title={room.status === 'Active' ? "Mark for Maintenance" : "Mark Active"}
                      >
                        <i className="fa-solid fa-power-off text-[10px]"></i>
                      </button>
                      <HoldButton size="sm" onHold={() => deleteClassroom(room.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                null
            </HoldButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setEditingRoom(null)}>
          <div className="bg-themePanel border border-themeBorderStrong rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setEditingRoom(null)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-themeTextSec hover:text-themeText transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="text-xl font-black text-themeText mb-6">Edit Classroom</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider">Room Name / Number</label>
                <input type="text" value={editRoomName} onChange={e => setEditRoomName(e.target.value)} required className="w-full bg-white dark:bg-themePanel border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider">Capacity</label>
                <input type="number" value={editRoomCapacity} onChange={e => setEditRoomCapacity(e.target.value)} required className="w-full bg-white dark:bg-themePanel border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-blue-500 transition-colors" />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-600 transition-colors mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
