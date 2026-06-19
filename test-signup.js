const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qqgnucqhlqqymaeutpjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZ251Y3FobHFxeW1hZXV0cGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzE5NTUsImV4cCI6MjA5NjkwNzk1NX0.3z2QA2rDMr6lucbj9oShaMmGI7IbXaaVYXbsnXU-WAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const email = `test-user-${Date.now()}@gmail.com`;
  const password = 'TestSecurePassword123!';
  
  console.log(`Signing up new user: ${email}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User'
      }
    }
  });

  if (signUpError) {
    console.error("Sign up error:", signUpError);
    return;
  }

  console.log("✅ Sign up successful! User ID:", signUpData.user.id);
  
  // Note: if email confirmation is required, sign in will fail with 'email_not_confirmed'.
  // But let's try sign in to see if it throws a 500 error or just a normal 'email not confirmed' error!
  console.log("Trying to sign in...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in error:", signInError);
  } else {
    console.log("✅ Sign in successful!", signInData);
  }
}

testSignup().catch(console.error);
