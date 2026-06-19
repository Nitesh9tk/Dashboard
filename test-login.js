const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qqgnucqhlqqymaeutpjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZ251Y3FobHFxeW1hZXV0cGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzE5NTUsImV4cCI6MjA5NjkwNzk1NX0.3z2QA2rDMr6lucbj9oShaMmGI7IbXaaVYXbsnXU-WAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log("Testing sign in with ceo.bb24.agency@gmail.com...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ceo.bb24.agency@gmail.com',
    password: 'agencyceo123'
  });

  if (error) {
    console.error("Sign in error:", error);
  } else {
    console.log("✅ Sign in successful!", data);
  }
}

testLogin().catch(console.error);
