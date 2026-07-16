const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log("Checking last payments...");
  const { data: payments, error: pError } = await supabase
    .from('payments')
    .select('id, user_id, credits, status')
    .order('created_at', { ascending: false })
    .limit(5);

  if (pError) console.error("Payment Error:", pError);
  console.log("Last Payments:", payments);

  console.log("\nChecking user credits...");
  const { data: users, error: uError } = await supabase
    .from('users')
    .select('id, email, credits')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (uError) console.error("User Error:", uError);
  console.log("Last Updated Users:", users);
}

check();
