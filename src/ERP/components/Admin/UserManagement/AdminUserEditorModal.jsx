/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';
import Modal from "../../shared/Modal/Modal";
import Input from "../../shared/Input/Input";
import Button from "../../shared/Button/Button";

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
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${user.role === 'student' ? 'Student' : 'Staff'} Details`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <Input 
          label="Full Name" 
          value={formData.full_name} 
          onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
          required 
        />
        <Input 
          label="ERP ID" 
          value={formData.erp_id} 
          onChange={(e) => setFormData({...formData, erp_id: e.target.value})} 
          required 
        />
        {user.role === 'student' && (
          <Input 
            label="Academic Batch (e.g. BBA LLB)" 
            value={formData.academic_batch} 
            onChange={(e) => setFormData({...formData, academic_batch: e.target.value})} 
          />
        )}
        {user.role === 'faculty' && (
          <Input 
            label="Department" 
            value={formData.department} 
            onChange={(e) => setFormData({...formData, department: e.target.value})} 
          />
        )}
        <Input 
          label="Phone Number" 
          value={formData.phone} 
          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
        />
        
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-theme">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" isLoading={isSaving}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
