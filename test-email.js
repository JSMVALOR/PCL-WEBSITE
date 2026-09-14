import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testEmail() {
  console.log("Inserting test email into email_queue...")
  
  // Notice: We removed .select() to avoid needing a SELECT RLS policy
  const { error } = await supabase.from('email_queue').insert({
    to_email: process.env.EMAIL_USER || 'contact.jsminnovation@gmail.com',
    subject: 'PCL ERP - Supabase Trigger Test',
    message_body: '<h1>Success!</h1><p>If you are reading this, the Supabase email queue is working perfectly.</p>',
    status: 'pending'
  })

  if (error) {
    console.error("❌ Failed to insert:", error.message)
  } else {
    console.log("✅ Successfully inserted row without .select()! Check your Supabase table.")
  }
}

testEmail()
