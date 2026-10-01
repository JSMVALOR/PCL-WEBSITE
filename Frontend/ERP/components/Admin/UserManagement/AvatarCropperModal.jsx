import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AvatarCropperModal({ user, currentImageUrl, isOpen, onClose, onSaved }) {
 const [scale, setScale] = useState(1);
 const [offset, setOffset] = useState({ x: 0, y: 0 });
 const [isDragging, setIsDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const [isSaving, setIsSaving] = useState(false);
 const canvasRef = useRef(null);
 const imageRef = useRef(null);

 useEffect(() => {
 if (!isOpen || !currentImageUrl) return;
 const img = new Image();
 img.crossOrigin = "anonymous";
 img.onload = () => {
 imageRef.current = img;
 drawCanvas();
 };
 img.src = currentImageUrl;
 }, [isOpen, currentImageUrl, scale, offset]);

 const drawCanvas = () => {
 if (!canvasRef.current || !imageRef.current) return;
 const canvas = canvasRef.current;
 const ctx = canvas.getContext('2d');
 const size = 300;
 canvas.width = size;
 canvas.height = size;
 
 ctx.clearRect(0, 0, size, size);
 ctx.fillStyle = '#111';
 ctx.fillRect(0, 0, size, size);

 const img = imageRef.current;
 const minScale = Math.max(size / img.width, size / img.height);
 const actualScale = minScale * scale;

 const w = img.width * actualScale;
 const h = img.height * actualScale;
 const x = (size - w) / 2 + offset.x;
 const y = (size - h) / 2 + offset.y;

 ctx.drawImage(img, x, y, w, h);
 };

 const handleMouseDown = (e) => {
 setIsDragging(true);
 setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
 };

 const handleMouseMove = (e) => {
 if (!isDragging) return;
 setOffset({
 x: e.clientX - dragStart.x,
 y: e.clientY - dragStart.y
 });
 };

 const handleMouseUp = () => setIsDragging(false);

 const handleSave = async () => {
 if (!canvasRef.current) return;
 setIsSaving(true);
 try {
 const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
 const { error } = await supabase.from('profiles').update({ profile_picture_url: base64 }).eq('id', user.db_id);
 if (error) throw error;
 if (window.erpToast) window.erpToast.show("Profile picture updated!", "success");
 onSaved(base64);
 onClose();
 } catch (err) {
 console.error(err);
 if (window.erpToast) window.erpToast.show("Failed to save image", "error");
 } finally {
 setIsSaving(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-themeApp border border-themeBorder rounded-2xl p-6 w-full max-w-md flex flex-col items-center">
 <h3 className="text-lg font-bold text-themeText mb-4">Rearrange Avatar</h3>
 
 <div 
 className="relative rounded-2xl overflow-hidden cursor-move border border-themeBorder "
 onMouseDown={handleMouseDown}
 onMouseMove={handleMouseMove}
 onMouseUp={handleMouseUp}
 onMouseLeave={handleMouseUp}
 >
 <canvas ref={canvasRef} style={{ width: 250, height: 250 }} />
 <div className="absolute inset-0 pointer-events-none ring-4 ring-black/10 dark:ring-white/10 ring-inset"></div>
 </div>

 <div className="w-full mt-6 flex items-center gap-4">
 <span className="text-xs font-bold text-themeTextSec">Zoom</span>
 <input 
 type="range" 
 min="1" 
 max="3" 
 step="0.05" 
 value={scale} 
 onChange={(e) => setScale(parseFloat(e.target.value))}
 className="flex-1 accent-amber-500"
 />
 </div>

 <div className="w-full mt-6 flex justify-end gap-3">
 <button 
 onClick={onClose}
 className="px-4 py-2 rounded-lg text-sm font-bold text-themeTextSec hover:bg-themeElevated transition-colors"
 >
 Cancel
 </button>
 <button 
 onClick={handleSave}
 disabled={isSaving}
 className="px-6 py-2 rounded-lg text-sm font-bold bg-themeAccent hover:bg-themeAccent/90 text-themeText transition-colors flex items-center gap-2"
 >
 {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
 Save Picture
 </button>
 </div>
 </div>
 </div>
 );
}
