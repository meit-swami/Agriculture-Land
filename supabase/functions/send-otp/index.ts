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
    const { phone } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return new Response(JSON.stringify({ error: 'Invalid phone number' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // For testing: always use 123456
    const otp = '123456';

    // Delete old OTPs for this phone
    await supabaseAdmin.from('phone_otps').delete().eq('phone', phone);

    // Insert new OTP
    const { error } = await supabaseAdmin.from('phone_otps').insert({
      phone,
      otp,
    });

    if (error) {
      console.error('OTP insert error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate OTP' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // In production, send SMS here via Twilio/MSG91 etc.
    console.log(`OTP for ${phone}: ${otp}`);

    return new Response(JSON.stringify({ success: true, message: 'OTP sent (test: 123456)' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
