
-- Private links table
CREATE TABLE public.private_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  phone_number text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.private_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own private links" ON public.private_links
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own private links" ON public.private_links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all private links" ON public.private_links
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anon select by token (for the OTP-gated page)
CREATE POLICY "Anyone can select by token" ON public.private_links
  FOR SELECT TO anon USING (true);

-- Link views analytics table
CREATE TABLE public.link_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.private_links(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  device_info text DEFAULT '',
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  location_info text DEFAULT ''
);

ALTER TABLE public.link_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all link views" ON public.link_views
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Link owners can view their link views" ON public.link_views
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.private_links WHERE private_links.id = link_views.link_id AND private_links.user_id = auth.uid())
  );

-- Allow insert from edge function (anon role for tracking)
CREATE POLICY "Anyone can insert link views" ON public.link_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);
