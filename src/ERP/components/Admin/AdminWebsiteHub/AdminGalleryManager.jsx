import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Legacy imports for auto-sync
import imgClassroom1 from '../../../../Shared/Assets/CAMPUS/PCL_CLASSROOM.webp';
import imgClassroom2 from '../../../../Shared/Assets/CAMPUS/PCL_CLASSROOM2.webp';
import imgClassroom3 from '../../../../Shared/Assets/CAMPUS/PCL_CLASSROOM3.webp';
import imgLegalAid from '../../../../Shared/Assets/CAMPUS/PCL_LEGAL_AID_CELL.webp';
import imgLibrary from '../../../../Shared/Assets/CAMPUS/pcl_library.webp';
import imgLobby from '../../../../Shared/Assets/CAMPUS/PCL_LOBBY.webp';
import imgOutside from '../../../../Shared/Assets/CAMPUS/PCL_OUTSIDE.webp';
import imgCampus from '../../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';
import imgMoot1 from '../../../../Shared/Assets/CAMPUS/moot1.png';
import imgMoot2 from '../../../../Shared/Assets/CAMPUS/moot2.png';
import imgJustice from '../../../../Shared/Assets/CAMPUS/pcl_justice.webp';

const LEGACY_IMAGES = [
    { src: imgCampus, title: "PCL Campus", category: "Campus" },
    { src: imgLibrary, title: "PCL Library", category: "Campus" },
    { src: imgMoot1, title: "Moot Court 1", category: "Competitions" },
    { src: imgLobby, title: "PCL Lobby", category: "Campus" },
    { src: imgClassroom1, title: "Classroom 1", category: "Academics" },
    { src: imgLegalAid, title: "Legal Aid Cell", category: "Campus" },
    { src: imgJustice, title: "Justice Statue", category: "Campus" },
    { src: imgMoot2, title: "Moot Court 2", category: "Competitions" },
    { src: imgOutside, title: "Campus Exterior", category: "Campus" },
    { src: imgClassroom2, title: "Classroom 2", category: "Academics" },
    { src: imgClassroom3, title: "Classroom 3", category: "Academics" }
];


export default function AdminGalleryManager({ isEmbedded = false }) {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [category, setCategory] = useState('Campus');
    
    // Cropping State
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = React.useRef(null);


    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setIsLoading(false);
        }
    };

        const [isSyncing, setIsSyncing] = useState(false);

    const handleAutoSync = async () => {
        if (!window.confirm("This will automatically upload all 11 original images to Supabase. Proceed?")) return;
        setIsSyncing(true);
        try {
            for (const img of LEGACY_IMAGES) {
                // Fetch the bundled image as a blob
                const response = await fetch(img.src);
                const blob = await response.blob();
                
                const fileExt = img.src.split('.').pop().split('?')[0] || 'webp';
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `public/${fileName}`;

                // Upload to storage
                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(filePath, blob, { upsert: false });
                
                if (uploadError) {
                    console.error("Upload error for", img.title, uploadError);
                    continue;
                }

                // Get URL
                const { data: { publicUrl } } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(filePath);

                // Insert into DB
                await supabase.from('gallery_images').insert([{
                    title: img.title,
                    description: "Auto-migrated legacy image",
                    image_url: publicUrl,
                    category: img.category,
                    is_active: true
                }]);
            }
            alert("Auto-Sync Complete!");
            fetchImages();
        } catch (error) {
            console.error("Sync failed:", error);
            alert("Sync failed: " + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setCrop(undefined); // Reset crop on new image
            setCompletedCrop(null);
        }
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
            width,
            height
        );
        setCrop(crop);
    };

    // Extract Cropped Image Blob
    const getCroppedImg = async (image, crop, fileName) => {
        try {
            const canvas = document.createElement('canvas');
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            
            // Validate crop dimensions
            if (!crop || !crop.width || !crop.height) {
                console.error("Invalid crop dimensions", crop);
                return null; // Fallback to original image
            }

            canvas.width = crop.width * scaleX;
            canvas.height = crop.height * scaleY;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width * scaleX,
                crop.height * scaleY
            );

            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    blob.name = fileName;
                    resolve(blob);
                }, 'image/jpeg', 0.95);
            });
        } catch (e) {
            console.error("Crop error:", e);
            return null; // fallback
        }
    };


    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert("Please select an image file to upload.");
            return;
        }

        setIsSaving(true);
        try {
            let uploadBlob = imageFile;
            
            // If user cropped it, use the cropped blob
            if (completedCrop && completedCrop.width && completedCrop.height && imgRef.current) {
                const cropped = await getCroppedImg(imgRef.current, completedCrop, imageFile.name);
                if (cropped) {
                    uploadBlob = cropped;
                }
            }
            
            const finalTitle = title.trim() || imageFile.name.replace(/\.[^/.]+$/, "");

            // 1. Upload to Supabase Storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `public/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, uploadBlob, { upsert: false });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            // 3. Save to database
            const { error: dbError } = await supabase.from('gallery_images').insert([{
                title: finalTitle,
                description,
                image_url: publicUrl,
                category,
                is_active: true
            }]);

            if (dbError) throw dbError;

            setTitle('');
            setDescription('');
            setImageFile(null);
            setImagePreview('');
            setCategory('Campus');
            
            // Reset file input
            const fileInput = document.getElementById('gallery_image_input');
            if (fileInput) fileInput.value = '';
            
            fetchImages();
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image. Make sure your storage bucket 'gallery' is created and public.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this image from the gallery?")) return;

        try {
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) throw error;
            fetchImages();
        } catch (error) {
            console.error("Failed to delete image:", error);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase.from('gallery_images').update({ is_active: !currentStatus }).eq('id', id);
            if (error) throw error;
            fetchImages();
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    return (
        <div className={`w-full animate-fade-in selection:bg-black/5 dark:bg-themeElevated/20 ${!isEmbedded ? "min-h-screen bg-transparent text-themeText dark:text-themeText" : ""}`}>
            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
                
                {!isEmbedded && (
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-themeAccent/20 flex items-center justify-center shrink-0 border border-themeAccent/30 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]">
                            <i className="fa-regular fa-images text-themeAccent text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-themeText mb-1">Gallery Manager</h1>
                            <p className="text-xs font-bold text-themeTextSec tracking-normal">Manage photos displayed on the public Website Gallery.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Add Form */}
                    <div className="lg:col-span-4 h-fit bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-6 lg:p-8">
                                                <h2 className="text-lg font-semibold tracking-tight text-themeText mb-6 flex justify-between items-center">
                            Add New Image
                            <button onClick={handleAutoSync} disabled={isSyncing} className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20 flex items-center gap-2">
                                {isSyncing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate"></i>}
                                {isSyncing ? 'Syncing...' : 'Auto-Sync Legacy Images'}
                            </button>
                        </h2>
                        
                        <form onSubmit={handleAddImage} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-themeTextSec uppercase tracking-wider">Select Image File</label>
                                <input 
                                    required 
                                    id="gallery_image_input"
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-themeTextSec
                                        file:mr-4 file:py-3 file:px-6
                                        file:rounded-xl file:border-0
                                        file:text-sm file:font-bold
                                        file:bg-themeAccent/10 file:text-themeAccent
                                        hover:file:bg-themeAccent/20 file:transition-colors cursor-pointer border border-black/[0.04] dark:border-white/[0.08] bg-black/5 dark:bg-themeElevated/90 rounded-xl"
                                />
                            </div>
                            
                            {imagePreview && (
                                <div className="mt-2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 w-full relative bg-black/5 flex justify-center">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                    >
                                        <img 
                                            ref={imgRef}
                                            src={imagePreview} 
                                            alt="Crop Preview" 
                                            onLoad={onImageLoad}
                                            className="max-h-[400px] w-auto object-contain" 
                                        />
                                    </ReactCrop>
                                </div>
                            )}

                            <div className="flex flex-col gap-2 mt-2">
                                <label className="text-[12px] font-bold text-themeTextSec uppercase tracking-wider">Title</label>
                                <input type="text" className="bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Annual Moot Court" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-themeTextSec uppercase tracking-wider">Category</label>
                                <select className="bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option>Campus</option>
                                    <option>Events</option>
                                    <option>Competitions</option>
                                    <option>Academics</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-themeTextSec uppercase tracking-wider">Caption (Optional)</label>
                                <textarea className="bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent resize-none h-20" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
                            </div>

                            <button disabled={isSaving} type="submit" className="w-full mt-4 px-6 py-3.5 bg-themeAccent hover:bg-themeAccent/90 text-white font-black tracking-normal text-[13px] rounded-xl transition-colors border border-themeAccent/20 shadow-lg shadow-themeAccent/20 flex items-center justify-center gap-2">
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                                {isSaving ? 'Publishing...' : 'Publish to Gallery'}
                            </button>
                        </form>
                    </div>

                    {/* Image Grid */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full"></div>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="w-full py-16 flex flex-col items-center justify-center bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-3xl text-center px-4">
                                <i className="fa-regular fa-image text-4xl text-neutral-400 mb-3"></i>
                                <h3 className="text-sm font-black text-themeText">Gallery is Empty</h3>
                                <p className="text-[12px] font-medium text-themeTextSec mt-1">Upload your first image to showcase on the website.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {images.map(img => (
                                    <div key={img.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden flex flex-col group">
                                        <div className="h-48 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
                                            <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <button onClick={() => toggleStatus(img.id, img.is_active)} className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border ${img.is_active ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-black/50 text-white border-white/20'}`} title={img.is_active ? 'Visible' : 'Hidden'}>
                                                    <i className={`fa-solid ${img.is_active ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                                                </button>
                                                <button onClick={() => handleDelete(img.id)} className="w-8 h-8 rounded-full bg-rose-500/80 text-white border border-rose-500 flex items-center justify-center backdrop-blur-md hover:bg-rose-600 transition-colors">
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                            <div className="absolute bottom-3 left-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-black/60 text-white backdrop-blur-md border border-white/20">
                                                    {img.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="text-sm font-bold text-themeText line-clamp-1">{img.title}</h3>
                                            <p className="text-[11px] font-medium text-themeTextSec mt-1 line-clamp-2">{img.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
