CREATE TABLE public.complaints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL DEFAULT '',
  cat text NOT NULL DEFAULT 'OTHER',
  detail text NOT NULL DEFAULT '',
  reporter text NOT NULL DEFAULT '',
  klass text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'NEW',
  admin_note text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.complaints TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit a complaint"
  ON public.complaints FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'NEW' AND admin_note = '');

CREATE POLICY "admins manage complaints"
  ON public.complaints FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER t_complaints BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();