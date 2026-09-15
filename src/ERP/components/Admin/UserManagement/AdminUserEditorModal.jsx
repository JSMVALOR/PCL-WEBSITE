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
    phone: '',
    // Faculty specific
    designation: '',
    specialisation: '',
    image_url: '',
    bio: '',
    research: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExtraDetails = async () => {
      if (user && isOpen) {
        let initialData = {
          full_name: user.name || '',
          erp_id: user.id || '',
          academic_batch: user.batch || '',
          department: user.department || '',
          phone: user.phone || '',
          designation: '',
          specialisation: '',
          image_url: '',
          bio: '',
          research: ''
        };

        if (user.role === 'faculty') {
          try {
            const { data } = await supabase.from('faculty_profiles').select('*').eq('id', user.db_id).maybeSingle();
            if (data) {
              initialData.designation = data.designation || '';
              initialData.specialisation = data.specialisation || '';
              initialData.image_url = data.image_url || '';
              initialData.bio = data.bio || '';
              initialData.research = data.research ? (Array.isArray(data.research) ? data.research.join(', ') : data.research) : '';
            }
          } catch(e) {}
        }
        setFormData(initialData);
      }
    };
    fetchExtraDetails();
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

      if (user.role === 'faculty') {
        const researchArray = formData.research.split(',').map(s => s.trim()).filter(Boolean);
        const { error: facError } = await supabase
          .from('faculty_profiles')
          .upsert({
            id: user.db_id,
            designation: formData.designation,
            specialisation: formData.specialisation,
            image_url: formData.image_url,
            bio: formData.bio,
            research: researchArray
          }, { onConflict: 'id' });
        if (facError) throw facError;
      }
      
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
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
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Department</label>
                <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Designation</label>
                <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Founder & Professor" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Specialisation</label>
                <input type="text" value={formData.specialisation} onChange={e => setFormData({...formData, specialisation: e.target.value})} placeholder="e.g. Constitutional Law" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Profile Image URL</label>
                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="/assets/people/faculty.jpg" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Bio</label>
                <textarea rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors resize-none"></textarea>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Research Interests (Comma separated)</label>
                <input type="text" value={formData.research} onChange={e => setFormData({...formData, research: e.target.value})} placeholder="Corporate Law, Human Rights" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
            </>
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
