
CREATE TABLE public.buyer_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  preferred_state text DEFAULT '',
  budget_min numeric DEFAULT 0,
  budget_max numeric DEFAULT 0,
  area_min numeric DEFAULT 0,
  message text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buyer_queries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a query (no auth required for lead gen)
CREATE POLICY "Anyone can insert buyer queries"
  ON public.buyer_queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all queries
CREATE POLICY "Admins can view buyer queries"
  ON public.buyer_queries FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Sellers can view queries too
CREATE POLICY "Sellers can view buyer queries"
  ON public.buyer_queries FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'seller'));
