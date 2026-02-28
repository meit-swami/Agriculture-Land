
-- Notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  property_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for subscriptions CRUD
CREATE POLICY "Admins can update subscriptions" ON public.subscriptions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscriptions" ON public.subscriptions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete users profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update profiles
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete roles
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
