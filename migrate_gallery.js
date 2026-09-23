import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error("Missing URL");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const baseDir = './src/Shared/Assets/CAMPUS';
const files = fs.readdirSync(baseDir);

async function migrate() {
    for (const file of files) {
        if (!file.endsWith('.webp') && !file.endsWith('.png') && !file.endsWith('.jpg')) continue;
        
        console.log("Uploading", file);
        const filePath = path.join(baseDir, file);
        const fileData = fs.readFileSync(filePath);
        
        const { data, error } = await supabase.storage
            .from('gallery')
            .upload('public/' + file, fileData, { upsert: true, contentType: 'image/' + file.split('.').pop() });
            
        if (error) {
            console.error("Failed to upload", file, error);
            continue;
        }
        
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl('public/' + file);
        
        await supabase.from('gallery_images').insert([{
            title: file.replace(/_/g, ' ').replace(/\.[^/.]+$/, ""),
            description: 'Campus image',
            image_url: publicUrl,
            category: 'Campus',
            is_active: true
        }]);
    }
    console.log("Done!");
}
migrate();
