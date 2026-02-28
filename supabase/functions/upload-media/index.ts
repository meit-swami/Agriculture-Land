const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || serviceKey;

    // Verify user auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token via Supabase Auth
    const userRes = await fetch(`${url}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': anonKey,
      },
    });
    
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    
    const userData = await userRes.json();
    const userId = userData.id;

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: corsHeaders });
    }

    if (file.size > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large (max 20MB)' }), { status: 400, headers: corsHeaders });
    }

    const allowedTypes: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/webm'],
      document: ['application/pdf'],
    };

    if (!allowedTypes[fileType]?.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), { status: 400, headers: corsHeaders });
    }

    // Generate unique file path
    const ext = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const filePath = `${userId}/${fileType}/${timestamp}.${ext}`;

    // Upload via Storage REST API using service role
    const fileBytes = await file.arrayBuffer();
    const uploadRes = await fetch(`${url}/storage/v1/object/property-media/${filePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': file.type,
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Upload failed:', errText);
      return new Response(JSON.stringify({ error: 'Upload failed', detail: errText }), { status: 500, headers: corsHeaders });
    }

    // Construct public URL
    const publicUrl = `${url}/storage/v1/object/public/property-media/${filePath}`;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      path: filePath,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Server error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
});
