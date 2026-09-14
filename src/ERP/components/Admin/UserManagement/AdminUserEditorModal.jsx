/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';

export default function AdminUserEditorModal({ user, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    full_name: '',
    erp_id: '',
    academic_batch: '',
    department: '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.name || '',
        erp_id: user.id || '',
        academic_batch: user.batch || '',
        department: user.department || '',
        phone: user.phone || ''
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          erp_id: formData.erp_id,
          academic_batch: formData.academic_batch,
          department: formData.department,
          phone: formData.phone
        })
        .eq('id', user.db_id);

      if (error) throw error;
      
      window.erpToast.success("User details updated successfully");
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      window.erpToast.error("Failed to update user details");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className={`${theme.layout.panel} rounded-2xl w-full max-w-lg p-6 lg:p-8 flex flex-col gap-6 shadow-2xl relative border border-white/10`}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-themeElevated/90 hover:bg-themeBorder text-themeTextSec flex items-center justify-center transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div>
          <h2 className="text-xl font-bold text-themeText mb-1">Edit {user.role === 'student' ? 'Student' : 'Staff'} Details</h2>
          <p className="text-xs text-themeTextSec">Master override for user credentials and info.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-themeTextSec">Full Name</label>
            <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-themeTextSec">ERP ID</label>
            <input required type="text" value={formData.erp_id} onChange={e => setFormData({...formData, erp_id: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
          </div>

          {user.role === 'student' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-themeTextSec">Academic Batch</label>
              <input type="text" value={formData.academic_batch} onChange={e => setFormData({...formData, academic_batch: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
            </div>
          )}

          {user.role === 'faculty' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-themeTextSec">Department</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-themeTextSec">Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold text-themeTextSec hover:bg-themeElevated/90 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/10">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-themeAccent text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
