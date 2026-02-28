CREATE TABLE public.property_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 month'),
  status TEXT NOT NULL DEFAULT 'active'
);

ALTER TABLE public.property_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own property payments" ON public.property_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own property payments" ON public.property_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all property payments" ON public.property_payments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update property payments" ON public.property_payments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));