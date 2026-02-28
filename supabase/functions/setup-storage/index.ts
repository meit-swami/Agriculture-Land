import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Create bucket if not exists
  const { data: buckets, error: listErr } = await supabaseAdmin.storage.listBuckets();
  
  if (listErr) {
    return new Response(JSON.stringify({ error: listErr.message, step: "list" }), { status: 500 });
  }
  
  const exists = buckets?.some((b) => b.id === "property-media");

  if (!exists) {
    const { error } = await supabaseAdmin.storage.createBucket("property-media", {
      public: true,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message, step: "create" }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ success: true, existed: exists }), {
    headers: { "Content-Type": "application/json" },
  });
});
