import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory OTP store (for production, use a DB table or SMS service)
const DUMMY_OTP = '123456'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, phone, otp, token } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'send') {
      // In production, send real SMS here
      console.log(`OTP for ${phone}: ${DUMMY_OTP}`)
      return new Response(
        JSON.stringify({ success: true, message: 'OTP sent (dummy: 123456)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify') {
      if (otp !== DUMMY_OTP) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid OTP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if this phone matches the private link owner's profile
      const { data: link } = await supabase
        .from('private_links')
        .select('*, properties(*)')
        .eq('token', token)
        .maybeSingle()

      if (!link) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid link' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the profile of the link owner to verify phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', link.user_id)
        .maybeSingle()

      if (!profile || profile.phone !== phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Phone number does not match the subscription holder' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Track the view
      const deviceInfo = req.headers.get('user-agent') || ''
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || ''
      
      await supabase.from('link_views').insert({
        link_id: link.id,
        device_info: deviceInfo.substring(0, 200),
        ip_address: ip,
        user_agent: deviceInfo,
      })

      return new Response(
        JSON.stringify({ success: true, property: link.properties }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
