UPDATE public.house_scores SET score = v.s, updated_at = now()
FROM (VALUES
  ('st-montfort','JUL',67.76),('st-francis','JUL',71.77),('st-gregory','JUL',74.26),
  ('st-dominic','JUL',75.22),('st-martin','JUL',75.63),('st-louis','JUL',76.54),
  ('st-edmund','JUL',80.19),('st-george','JUL',81.22),('st-mary','JUL',83.17),
  ('st-montfort','JUN',77.82),('st-francis','JUN',82.74),('st-gregory','JUN',80.28),
  ('st-dominic','JUN',78.91),('st-martin','JUN',88.19),('st-louis','JUN',77.43),
  ('st-edmund','JUN',82.20),('st-george','JUN',77.76),('st-mary','JUN',74.89)
) AS v(slug, m, s)
WHERE house_scores.house_slug = v.slug AND house_scores.month = v.m;

INSERT INTO public.honors (month, house_of_month, character_house)
VALUES ('JUL','st-george','st-martin')
ON CONFLICT (month) DO UPDATE SET house_of_month = EXCLUDED.house_of_month, character_house = EXCLUDED.character_house;

UPDATE public.site_settings SET value = 'JUL' WHERE key = 'current_month';