// Run migration script for Supabase
// This script creates the necessary tables for the Email Intelligence System

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jodybdbxfxtotxfsydqt.supabase.co';
const supabaseServiceKey = 'sb_secret_nYctOvvZ1gKYY107VKZMww_UK2dD5Hc';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  console.log('Checking existing tables...\n');

  // Try to query each table to see if it exists
  const tables = ['email_inbox', 'ai_email_intel', 'ai_email_comments', 'todos'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists (${data?.length || 0} rows sampled)`);
    }
  }
}

async function testInsert() {
  console.log('\n--- Testing email_inbox table ---');

  // Try to insert a test record
  const { data, error } = await supabase
    .from('email_inbox')
    .insert({
      message_id: 'test-migration-check-' + Date.now(),
      sender: 'test@migration.check',
      subject: 'Migration Test',
      body: 'This is a test email to verify the table exists'
    })
    .select();

  if (error) {
    console.log('Insert failed:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n⚠️  The email_inbox table does not exist!');
      console.log('Please run the SQL migration in Supabase Dashboard:\n');
      console.log('1. Go to https://supabase.com/dashboard/project/jodybdbxfxtotxfsydqt/sql');
      console.log('2. Copy and paste the SQL from: supabase/migrations/002_email_intel_tables.sql');
      console.log('3. Click Run\n');
    }
  } else {
    console.log('✅ Insert successful! Table is working.');
    console.log('Inserted:', data);

    // Clean up test record
    await supabase.from('email_inbox').delete().eq('message_id', data[0].message_id);
    console.log('Test record cleaned up.');
  }
}

async function main() {
  console.log('=== Dromeas OS Database Migration Check ===\n');
  await checkTables();
  await testInsert();
  console.log('\n=== Done ===');
}

main().catch(console.error);
