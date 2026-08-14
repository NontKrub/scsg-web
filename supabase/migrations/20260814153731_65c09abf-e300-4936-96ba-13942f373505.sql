DROP TABLE IF EXISTS public.project_updates CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
ALTER TABLE public.members DROP COLUMN IF EXISTS projects;