/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminClassrooms({ isEmbedded = false }) {
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [syncs, setSyncs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: "", capacity: 50, location: "" });

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch classrooms
            const { data: classData, error: classErr } = await supabase.from('classrooms').select('*').order('name');
            if (classData) setClassrooms(classData);
            
            // If table doesn't exist, we just catch the error and show empty (handled by supabase silent fail usually, but let's be safe)
            
            // Fetch subjects (Master Subjects)
            const { data: subjData } = await supabase.from('master_subjects').select('*').order('subject_name');
            if (subjData) setSubjects(subjData);

            // Fetch syncs
            const { data: syncData } = await supabase.from('classroom_allocations').select('*, master_subjects(subject_name, subject_code), classrooms(name)');
            if (syncData) setSyncs(syncData);

        } catch (error) {
            console.error("Error fetching classroom data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('classrooms').insert([newRoom]);
            if (error) {
                // Auto-create table logic simulation if it doesn't exist (Supabase doesn't allow DDL from client, but we show UI hint)
                window.erpToast?.show("SQL Error: Ensure 'classrooms' table exists in database.", "error");
                throw error;
            }
            window.erpToast?.show("Classroom created successfully", "success");
            setNewRoom({ name: "", capacity: 50, location: "" });
            setShowCreateModal(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSync = async () => {
        if (!selectedRoom || !selectedSubject) return window.erpToast?.show("Select both a classroom and subject.", "error");
        try {
            const { error } = await supabase.from('classroom_allocations').insert([{
                classroom_id: selectedRoom,
                subject_id: selectedSubject
            }]);
            if (error) {
                window.erpToast?.show("SQL Error: Ensure 'classroom_allocations' table exists.", "error");
                throw error;
            }
            window.erpToast?.show("Synced successfully", "success");
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveSync = async (id) => {
        try {
            await supabase.from('classroom_allocations').delete().eq('id', id);
            window.erpToast?.show("Sync removed", "success");
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`w-full animate-fade-in selection:bg-themeElevated dark:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-transparent text-themeText" : ""}`}>
            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10" : "pb-10"}`}>
                <PageHeader 
                    icon="fa-solid fa-chalkboard-user" 
                    title="Classroom & ERP Sync" 
                    subtitle="Manage physical classrooms and allocate ERP subjects directly."
                    rightContent={
                        <button type="button" onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] hover:bg-themePanel/90 text-themeAccent rounded-xl text-[14px] font-medium tracking-normal transition flex items-center gap-2 border border-white/50">
                            <i className="fa-solid fa-plus"></i> Add Classroom
                        </button>
                    }
                />

                {isLoading ? (
                    <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        
                        {/* LEFT: Classrooms List */}
                        <div className="xl:col-span-4 flex flex-col gap-4">
                            <h3 className="text-lg font-black text-themeText">Physical Classrooms</h3>
                            {classrooms.length === 0 ? (
                                <div className="p-12 text-center text-themeTextSec bg-themePanel/80 backdrop-blur-3xl border border-themeBorder rounded-2xl">
                                    <i className="fa-solid fa-person-booth text-4xl mb-4 opacity-50"></i>
                                    <p className="text-sm font-bold">No classrooms found. SQL Table might be empty or missing.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {classrooms.map(room => (
                                        <div key={room.id} className="bg-themePanel/80 backdrop-blur-3xl p-4 rounded-xl border border-themeBorder flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-themeText">{room.name}</h4>
                                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{room.location}</p>
                                            </div>
                                            <div className="bg-themeElevated px-3 py-1.5 rounded-lg border border-themeBorder flex items-center gap-2">
                                                <i className="fa-solid fa-users text-themeTextSec text-[10px]"></i>
                                                <span className="text-xs font-black text-themeText">{room.capacity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Sync Engine */}
                        <div className="xl:col-span-8 flex flex-col gap-6">
                            <div className="bg-themePanel/80 backdrop-blur-3xl border border-themeBorder rounded-2xl p-6">
                                <h3 className="text-lg font-black text-themeText mb-4">ERP Subject Sync Engine</h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2 block">Select Classroom</label>
                                        <select value={selectedRoom || ""} onChange={e => setSelectedRoom(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent appearance-none">
                                            <option value="">-- Choose Classroom --</option>
                                            {classrooms.map(r => <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2 block">Select ERP Subject</label>
                                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent appearance-none">
                                            <option value="">-- Choose Master Subject --</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <button onClick={handleSync} className="w-full h-[46px] bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-link"></i> Sync
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-themeText mb-4">Active Allocations</h3>
                                {syncs.length === 0 ? (
                                    <div className="p-8 text-center text-themeTextSec bg-themePanel/80 backdrop-blur-3xl border border-themeBorder rounded-2xl">
                                        <p className="text-sm font-bold">No synced subjects found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {syncs.map(sync => (
                                            <div key={sync.id} className="bg-themePanel/80 backdrop-blur-3xl p-5 rounded-2xl border border-themeBorder flex items-center justify-between group">
                                                <div>
                                                    <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-2 inline-block">Synced</span>
                                                    <h4 className="font-bold text-themeText">{sync.master_subjects?.subject_name}</h4>
                                                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Room: {sync.classrooms?.name}</p>
                                                </div>
                                                <button onClick={() => handleRemoveSync(sync.id)} className="w-8 h-8 rounded-full bg-themeElevated border border-themeBorder text-themeTextSec hover:text-rose-500 hover:border-rose-500/30 flex items-center justify-center transition-colors">
                                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* CREATE MODAL */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-themeElevated/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-themePanel w-full max-w-md rounded-2xl overflow-hidden border border-themeBorder flex flex-col">
                            <div className="p-6 border-b border-themeBorder flex justify-between items-center">
                                <h3 className="text-lg font-bold text-themeText">Add New Classroom</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-themeTextSec hover:text-themeText"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                            <form onSubmit={handleCreateRoom} className="p-6 flex flex-col gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2 block">Room Name / Number</label>
                                    <input type="text" required value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent" placeholder="e.g. Room 101" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2 block">Location / Block</label>
                                    <input type="text" required value={newRoom.location} onChange={e => setNewRoom({...newRoom, location: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent" placeholder="e.g. North Block" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2 block">Seating Capacity</label>
                                    <input type="number" required value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent" />
                                </div>
                                <button type="submit" className="w-full py-3 bg-themeAccent hover:bg-themeAccent/90 text-themeApp rounded-xl text-sm font-black transition-colors mt-2">Save Classroom</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
