/**
 * STRICT TEST DATA CLEANUP SCRIPT
 * This script is the ONLY authorized way for automation to clean up test data.
 * It is hardcoded to ONLY delete records associated with the '@test-agent.local' domain.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Must use SERVICE_ROLE key to bypass RLS for administrative deletion
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runCleanup() {
    console.log("🧹 Starting safe test data cleanup...");
    
    // Safety check
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("❌ ERROR: Missing Supabase Admin credentials.");
        process.exit(1);
    }

    try {
        // 1. Find all test profiles
        const { data: testUsers, error: fetchErr } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .like('email', '%@test-agent.local');

        if (fetchErr) throw fetchErr;

        if (!testUsers || testUsers.length === 0) {
            console.log("✅ No test users found. Nothing to clean up.");
            return;
        }

        console.log(`Found ${testUsers.length} test user(s). Initiating cascade deletion...`);

        // 2. Delete test users (Assuming ON DELETE CASCADE handles related logs, diaries, fees)
        const userIds = testUsers.map(u => u.id);
        
        const { error: deleteErr } = await supabaseAdmin
            .from('profiles')
            .delete()
            .in('id', userIds);

        if (deleteErr) throw deleteErr;

        // Note: For Auth users, Supabase requires using the admin.deleteUser API
        for (const id of userIds) {
            const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (authErr) console.warn(`⚠️ Could not delete auth record for ${id}: ${authErr.message}`);
            else console.log(`🗑️ Deleted Auth Record: ${id}`);
        }

        console.log("✅ Cleanup complete.");
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
        process.exit(1);
    }
}

runCleanup();
