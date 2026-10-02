# WhatsApp Engine Deployment Guide

The WhatsApp Engine runs a headless instance of Google Chrome (via Puppeteer) to simulate a real phone connection to WhatsApp Web. Because of this, it **cannot** be deployed to serverless environments like Vercel or Netlify (they kill processes after a few seconds and don't allow persistent Chrome instances).

To get this working in production, you must deploy this specific `whatsapp-engine` directory to an always-on server like **Render**, **Railway**, **DigitalOcean**, or **Heroku**.

## Option 1: Deploying to Render.com (Recommended & Free)
1. Push your repository to GitHub.
2. Go to Render.com and create a new **Web Service**.
3. Connect your repository.
4. Set the **Root Directory** to: `Backend/whatsapp-engine`
5. Set the **Build Command** to: `npm install`
6. Set the **Start Command** to: `node server.js`
7. Add your Environment Variables:
   - `VITE_SUPABASE_URL` = (your supabase url)
   - `VITE_SUPABASE_ANON_KEY` = (your supabase anon key)
8. **IMPORTANT FOR PUPPETEER ON RENDER**: You must install Chromium in the environment. In the Render environment settings, add the `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` variable set to `true` and configure the necessary build packs, OR just deploy it via a simple Dockerfile.

## Option 2: Run it on a local server in the office
If you just want it running for the admin team:
1. Open terminal on a dedicated office computer.
2. `cd Backend/whatsapp-engine`
3. `npm install`
4. `node server.js`
5. Make sure the local computer is accessible, or use a tool like **ngrok** (`ngrok http 3005`) to get a public URL.

## Linking to the Frontend
Once deployed, you will get a URL (e.g., `https://my-wa-engine.onrender.com`).
Go to your **Vercel** dashboard for the frontend, go to Settings -> Environment Variables, and add:
`VITE_WHATSAPP_ENGINE_URL` = `https://my-wa-engine.onrender.com`

Redeploy Vercel. Your Admin Dashboard will now connect to your hosted WhatsApp engine!
