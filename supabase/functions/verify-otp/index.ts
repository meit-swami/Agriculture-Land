import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const DUMMY_OTP = '123456'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, phone, otp, token } = await req.json()
    console.log('verify-otp called:', { action, phone, token: token?.substring(0, 8) })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'send') {
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

      // Get the link by token
      const { data: link, error: linkError } = await supabase
        .from('private_links')
        .select('*')
        .eq('token', token)
        .maybeSingle()

      console.log('Link lookup:', { found: !!link, error: linkError?.message })

      if (linkError || !link) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid or expired link' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the profile of the link owner to verify phone
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', link.user_id)
        .maybeSingle()

      console.log('Profile lookup:', { found: !!profile, phone: profile?.phone, error: profileError?.message })

      if (!profile || profile.phone !== phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Phone number does not match the subscription holder' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Fetch the property separately
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', link.property_id)
        .maybeSingle()

      console.log('Property lookup:', { found: !!property, error: propError?.message })

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
        JSON.stringify({ success: true, property }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('verify-otp error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
