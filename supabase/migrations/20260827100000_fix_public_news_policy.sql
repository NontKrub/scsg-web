-- Anonymous news reads must not execute the admin role helper. Admin access
-- remains covered by the authenticated admin policy created earlier.
DROP POLICY IF EXISTS "public read published news" ON public.news;

CREATE POLICY "public read published news"
  ON public.news FOR SELECT TO anon, authenticated
  USING (published = true);
