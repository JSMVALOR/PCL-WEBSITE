import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS Headers
  const allowedOrigin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { page_path, section_id, section_name, content_data } = req.body;
  
  if (!page_path || !section_id || !content_data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('website_content')
      .upsert({
        page_path,
        section_id,
        section_name,
        content_data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'page_path, section_id' });

    if (error) throw error;
    
    return res.status(200).json({ success: true, message: 'Content saved successfully.' });
  } catch (error) {
    console.error('Save Content Error:', error);
    return res.status(500).json({ error: `Failed to save content: ${error.message}` });
  }
}
