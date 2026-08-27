INSERT INTO public.site_settings (key, value)
VALUES ('current_year', '2026')
ON CONFLICT (key) DO NOTHING;
