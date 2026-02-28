CREATE TABLE public.team_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  experience TEXT DEFAULT '',
  message TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit team application" ON public.team_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view team applications" ON public.team_applications FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));