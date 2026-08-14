
-- roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- first signed-up user becomes admin (bootstrap)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER bootstrap_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- houses
CREATE TABLE public.houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  no text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  name_th text NOT NULL DEFAULT '',
  color_label text NOT NULL DEFAULT '',
  cls text NOT NULL DEFAULT '',
  personality text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  captain text NOT NULL DEFAULT '',
  captain_role text NOT NULL DEFAULT '',
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.house_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_slug text NOT NULL REFERENCES public.houses(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  month text NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (house_slug, month)
);

CREATE TABLE public.honors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,
  house_of_month text NOT NULL DEFAULT '',
  character_house text NOT NULL DEFAULT ''
);

CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  org text NOT NULL DEFAULT 'SG',
  org_label text NOT NULL DEFAULT '',
  klass text NOT NULL DEFAULT '',
  duties text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  projects text[] NOT NULL DEFAULT '{}',
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.congress_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL DEFAULT '',
  from_org text NOT NULL DEFAULT '',
  person_name text NOT NULL DEFAULT '',
  klass text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  sort int NOT NULL DEFAULT 0
);

CREATE TABLE public.advisory_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  sort int NOT NULL DEFAULT 0
);

CREATE TABLE public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  name_th text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  about text NOT NULL DEFAULT '',
  cls text NOT NULL DEFAULT '',
  head text NOT NULL DEFAULT '',
  member_count int NOT NULL DEFAULT 0,
  activities text[] NOT NULL DEFAULT '{}',
  sort int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  org text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'ACTIVE',
  owner text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cta text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  start_label text NOT NULL DEFAULT '',
  end_label text NOT NULL DEFAULT '',
  sort int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.project_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug text NOT NULL REFERENCES public.projects(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  date_label text NOT NULL DEFAULT '',
  text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  cat text NOT NULL DEFAULT 'SGSC',
  date_label text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  body text[] NOT NULL DEFAULT '{}',
  related text NOT NULL DEFAULT '',
  house_slug text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.radio_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL,
  slot text NOT NULL,
  state text NOT NULL DEFAULT 'AVAILABLE',
  note text NOT NULL DEFAULT '',
  UNIQUE (day, slot)
);

CREATE TABLE public.radio_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL DEFAULT '',
  slot text NOT NULL DEFAULT '',
  requester text NOT NULL DEFAULT '',
  klass text NOT NULL DEFAULT '',
  song text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.radio_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL DEFAULT '',
  sort int NOT NULL DEFAULT 0
);

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL DEFAULT '',
  actor text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- grants + RLS: public read, admin write
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['houses','house_scores','honors','members','congress_board','advisory_board','clubs','projects','project_updates','radio_slots','radio_rules','site_settings','audit_log','news','radio_bookings']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['houses','house_scores','honors','members','congress_board','advisory_board','clubs','projects','project_updates','radio_slots','radio_rules','site_settings']
  LOOP
    EXECUTE format('CREATE POLICY "public read %1$s" ON public.%1$I FOR SELECT USING (true)', t);
  END LOOP;
END $$;

CREATE POLICY "public read published news" ON public.news FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anyone can request a radio slot" ON public.radio_bookings FOR INSERT TO anon, authenticated WITH CHECK (status = 'PENDING');

-- updated_at triggers
CREATE TRIGGER t_houses BEFORE UPDATE ON public.houses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_members BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_clubs BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_news BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_scores BEFORE UPDATE ON public.house_scores FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ seed: structure only, no mock people ============
INSERT INTO public.site_settings (key, value) VALUES
  ('current_month','AUG'),
  ('site_title','S.C.S.G.'),
  ('hero_kicker','สภานักเรียน โรงเรียนเซนต์คาเบรียล');

INSERT INTO public.houses (slug,no,name,name_th,color_label,cls,personality,intro,captain,captain_role,sort) VALUES
  ('st-george','01','ST. GEORGE','เซนต์จอร์จ','เหลือง','house-george','','','','ประธานบ้าน',1),
  ('st-gregory','02','ST. GREGORY','เซนต์เกรโกรี','แดง','house-gregory','','','','ประธานบ้าน',2),
  ('st-louis','03','ST. LOUIS','เซนต์หลุยส์','เขียว','house-louis','','','','ประธานบ้าน',3),
  ('st-martin','04','ST. MARTIN','เซนต์มาร์ติน','น้ำเงิน','house-martin','','','','ประธานบ้าน',4),
  ('st-montfort','05','ST. MONTFORT','เซนต์มงฟอร์ต','ชมพู','house-montfort','','','','ประธานบ้าน',5),
  ('st-edmund','06','ST. EDMUND','เซนต์เอ็ดมันด์','ม่วง','house-edmund','','','','ประธานบ้าน',6),
  ('st-mary','07','ST. MARY','เซนต์แมรี','ส้ม','house-mary','','','','ประธานบ้าน',7),
  ('st-dominic','08','ST. DOMINIC','เซนต์ดอมินิก','น้ำตาล','house-dominic','','','','ประธานบ้าน',8),
  ('st-francis','09','ST. FRANCIS','เซนต์ฟรังซิส','เทา','house-francis','','','','ประธานบ้าน',9);

INSERT INTO public.house_scores (house_slug, month, score)
SELECT h.slug, m.month, 0
FROM public.houses h CROSS JOIN (VALUES ('JUN'),('JUL'),('AUG'),('SEP'),('OCT'),('NOV'),('DEC')) AS m(month);

INSERT INTO public.honors (month, house_of_month, character_house)
VALUES ('JUN','',''),('JUL','',''),('AUG','',''),('SEP','',''),('OCT','',''),('NOV','',''),('DEC','','');

INSERT INTO public.clubs (slug,name,name_th,tagline,about,cls,head,member_count,activities,sort) VALUES
  ('asa-saint','ASA SAINT','อาสาเซนต์','','','house-mary','',0,'{}',1),
  ('interact','INTERACT','อินเทอร์แรค','','','house-louis','',0,'{}',2),
  ('innovation','INNOVATION','นวัตกรรม','','','house-martin','',0,'{}',3),
  ('mc','MC','พิธีกร','','','house-gregory','',0,'{}',4),
  ('board-game','BOARD GAME','บอร์ดเกม','','','house-edmund','',0,'{}',5),
  ('public-relation','PUBLIC RELATION','ประชาสัมพันธ์','','','house-montfort','',0,'{}',6);

-- 18 student government seats
INSERT INTO public.members (name, role, org, org_label, klass, duties, sort)
SELECT '', '', 'SG', 'สโมสรนักเรียน', '', '', g FROM generate_series(1,18) g;
-- 9 house presidents
INSERT INTO public.members (name, role, org, org_label, klass, duties, sort)
SELECT '', '', 'HOUSE', h.name, '', '', 100 + h.sort FROM public.houses h;
-- 6 clubs x 3 representatives
INSERT INTO public.members (name, role, org, org_label, klass, duties, sort)
SELECT '', '', 'CLUB', c.name, '', '', 200 + c.sort * 10 + r
FROM public.clubs c CROSS JOIN generate_series(1,3) r;
-- 23 class representatives
INSERT INTO public.members (name, role, org, org_label, klass, duties, sort)
SELECT '', '', 'CLASS', 'ผู้แทนห้องเรียน', '', '', 300 + g FROM generate_series(1,23) g;

INSERT INTO public.congress_board (role, from_org, person_name, klass, sort) VALUES
  ('ประธานสภานักเรียน','',' ','',1),
  ('รองประธานสภา คนที่ 1','','','',2),
  ('รองประธานสภา คนที่ 2','','','',3),
  ('เลขาธิการสภา','','','',4),
  ('เหรัญญิกสภา','','','',5);
UPDATE public.congress_board SET person_name = '';

INSERT INTO public.advisory_board (person_name, role, description, sort) VALUES
  ('','','',1),('','','',2),('','','',3),('','','',4),('','','',5);

INSERT INTO public.radio_slots (day, slot, state)
SELECT d.day, s.slot, 'AVAILABLE'
FROM (VALUES ('จันทร์'),('อังคาร'),('พุธ'),('พฤหัสบดี'),('ศุกร์')) AS d(day)
CROSS JOIN (VALUES ('12:00'),('12:10'),('12:20'),('12:30'),('12:40')) AS s(slot);
