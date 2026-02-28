import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, metadata } = await req.json();

    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: 'Phone and OTP required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('phone_otps')
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark OTP as verified
    await supabaseAdmin.from('phone_otps').update({ verified: true }).eq('id', otpRecord.id);

    // Check if user exists by phone in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('phone', phone)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      // Existing user - sign them in
      userId = existingProfile.user_id;
    } else {
      // New user - create account
      const email = `${phone}@phone.krishibhumi.local`;
      const password = `phone_${phone}_${Date.now()}`;

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata || {},
      });

      if (createError || !newUser.user) {
        console.error('Create user error:', createError);
        return new Response(JSON.stringify({ error: 'Failed to create account' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = newUser.user.id;

      // Update profile with phone (trigger already creates profile but without correct phone)
      await supabaseAdmin.from('profiles').update({
        phone,
        full_name: metadata?.full_name || '',
        state: metadata?.state || '',
        district: metadata?.district || '',
      }).eq('user_id', userId);
    }

    // Generate a session for the user
    // Use admin.generateLink to get a magic link, then extract token
    // Alternative: use signInWithPassword with the generated password
    // Best approach: use admin API to generate session directly
    
    // Get user details
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a magic link for auto-login
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email!,
    });

    if (linkError || !linkData) {
      console.error('Generate link error:', linkError);
      return new Response(JSON.stringify({ error: 'Failed to generate session' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract the token from the link properties
    const token_hash = linkData.properties?.hashed_token;
    
    return new Response(JSON.stringify({
      success: true,
      email: userData.user.email,
      token_hash,
      is_new_user: !existingProfile,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('verify-phone-otp error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
