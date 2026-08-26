-- SG Radio is moving from recurring weekday labels to real calendar slots.
-- Existing weekday-only rows cannot be assigned a trustworthy date, so keep
-- them in legacy_* columns and leave them out of the public current schedule.

ALTER TABLE public.radio_slots RENAME COLUMN day TO legacy_day;
ALTER TABLE public.radio_slots RENAME COLUMN slot TO legacy_slot;
ALTER TABLE public.radio_slots DROP CONSTRAINT IF EXISTS radio_slots_day_slot_key;
ALTER TABLE public.radio_slots
  ADD COLUMN date date,
  ADD COLUMN start_time time without time zone,
  ADD COLUMN created_at timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.radio_bookings RENAME COLUMN day TO legacy_day;
ALTER TABLE public.radio_bookings RENAME COLUMN slot TO legacy_slot;
ALTER TABLE public.radio_bookings
  ADD COLUMN slot_id uuid,
  ADD COLUMN student_id text NOT NULL DEFAULT '',
  ADD COLUMN additional_info text NOT NULL DEFAULT '',
  ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.radio_bookings
  ADD CONSTRAINT radio_bookings_slot_id_fkey
  FOREIGN KEY (slot_id) REFERENCES public.radio_slots(id) ON DELETE RESTRICT;

ALTER TABLE public.radio_slots
  ADD CONSTRAINT radio_slots_date_time_pair
  CHECK ((date IS NULL) = (start_time IS NULL)),
  ADD CONSTRAINT radio_slots_state_check
  CHECK (state IN ('AVAILABLE', 'PENDING', 'BOOKED', 'CLOSED')) NOT VALID;

ALTER TABLE public.radio_bookings
  ADD CONSTRAINT radio_bookings_status_check
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED')) NOT VALID;

ALTER TABLE public.radio_bookings
  ADD CONSTRAINT radio_bookings_input_check
  CHECK (
    btrim(requester) <> ''
    AND btrim(student_id) <> ''
    AND btrim(klass) <> ''
    AND btrim(song) <> ''
    AND length(requester) <= 120
    AND length(student_id) <= 40
    AND length(klass) <= 40
    AND length(song) <= 200
    AND length(message) <= 600
    AND length(additional_info) <= 1000
  ) NOT VALID;

ALTER TABLE public.radio_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_bookings ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX radio_slots_date_start_time_key
  ON public.radio_slots (date, start_time)
  WHERE date IS NOT NULL AND start_time IS NOT NULL;

CREATE INDEX radio_slots_schedule_idx
  ON public.radio_slots (date, start_time, state)
  WHERE date IS NOT NULL AND start_time IS NOT NULL;

CREATE UNIQUE INDEX radio_bookings_one_active_slot_idx
  ON public.radio_bookings (slot_id)
  WHERE slot_id IS NOT NULL AND status IN ('PENDING', 'APPROVED');

CREATE INDEX radio_bookings_slot_created_idx
  ON public.radio_bookings (slot_id, created_at DESC);

COMMENT ON TABLE public.radio_slots IS
  'Date-based SG Radio schedule. Rows with null date/start_time are preserved weekday-only legacy rows.';
COMMENT ON COLUMN public.radio_slots.legacy_day IS
  'Preserved weekday label from the pre-date schedule; never used as a current slot identity.';
COMMENT ON COLUMN public.radio_slots.legacy_slot IS
  'Preserved text time from the pre-date schedule; never used as a current slot identity.';
COMMENT ON COLUMN public.radio_bookings.legacy_day IS
  'Preserved weekday label for historical bookings created before slot_id existed.';
COMMENT ON COLUMN public.radio_bookings.legacy_slot IS
  'Preserved text time for historical bookings created before slot_id existed.';

-- Public users can read current schedule rows and submit requests, but cannot
-- read booking PII or directly mutate slots/booking state.
GRANT SELECT ON public.radio_slots TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.radio_slots FROM anon, authenticated;
REVOKE SELECT ON public.radio_bookings FROM anon;
GRANT INSERT ON public.radio_bookings TO anon, authenticated;
GRANT SELECT ON public.radio_bookings TO authenticated;
REVOKE UPDATE, DELETE ON public.radio_bookings FROM anon, authenticated;

DROP POLICY IF EXISTS "public read radio_slots" ON public.radio_slots;
CREATE POLICY "public read current radio slots"
  ON public.radio_slots FOR SELECT TO anon, authenticated
  USING (date IS NOT NULL AND start_time IS NOT NULL);

DROP POLICY IF EXISTS "anyone can request a radio slot" ON public.radio_bookings;
CREATE POLICY "anyone can request a radio slot"
  ON public.radio_bookings FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'PENDING' AND slot_id IS NOT NULL);

-- One transition function owns the booking/slot invariant. The trigger runs in
-- the same transaction as the insert/update, including direct table inserts.
CREATE OR REPLACE FUNCTION public.apply_radio_booking_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  slot_state text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'PENDING' OR NEW.slot_id IS NULL THEN
      RAISE EXCEPTION 'RADIO_INVALID_BOOKING';
    END IF;

    SELECT rs.state INTO slot_state
    FROM public.radio_slots AS rs
    WHERE rs.id = NEW.slot_id
      AND rs.date IS NOT NULL
      AND rs.start_time IS NOT NULL
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'RADIO_SLOT_NOT_FOUND';
    END IF;
    IF slot_state <> 'AVAILABLE' THEN
      RAISE EXCEPTION 'RADIO_SLOT_UNAVAILABLE';
    END IF;

    UPDATE public.radio_slots
    SET state = 'PENDING', updated_at = now()
    WHERE id = NEW.slot_id;
    RETURN NEW;
  END IF;

  IF NEW.slot_id IS DISTINCT FROM OLD.slot_id THEN
    RAISE EXCEPTION 'RADIO_INVALID_TRANSITION';
  END IF;
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.slot_id IS NULL THEN
    RAISE EXCEPTION 'RADIO_INVALID_DATA';
  END IF;

  SELECT rs.state INTO slot_state
  FROM public.radio_slots AS rs
  WHERE rs.id = NEW.slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RADIO_SLOT_NOT_FOUND';
  END IF;

  IF OLD.status = 'PENDING' AND NEW.status = 'APPROVED' THEN
    IF slot_state <> 'PENDING' THEN
      RAISE EXCEPTION 'RADIO_INVALID_DATA';
    END IF;
    UPDATE public.radio_slots SET state = 'BOOKED', updated_at = now() WHERE id = NEW.slot_id;
  ELSIF OLD.status = 'PENDING' AND NEW.status IN ('REJECTED', 'CANCELLED') THEN
    IF slot_state <> 'PENDING' THEN
      RAISE EXCEPTION 'RADIO_INVALID_DATA';
    END IF;
    UPDATE public.radio_slots SET state = 'AVAILABLE', updated_at = now() WHERE id = NEW.slot_id;
  ELSIF OLD.status = 'APPROVED' AND NEW.status = 'COMPLETED' THEN
    IF slot_state <> 'BOOKED' THEN
      RAISE EXCEPTION 'RADIO_INVALID_DATA';
    END IF;
  ELSE
    RAISE EXCEPTION 'RADIO_INVALID_TRANSITION';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS radio_booking_state_transition ON public.radio_bookings;
CREATE TRIGGER radio_booking_state_transition
  BEFORE INSERT OR UPDATE OF slot_id, status ON public.radio_bookings
  FOR EACH ROW EXECUTE FUNCTION public.apply_radio_booking_transition();

CREATE TRIGGER t_radio_slots_updated_at
  BEFORE UPDATE ON public.radio_slots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER t_radio_bookings_updated_at
  BEFORE UPDATE ON public.radio_bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

REVOKE ALL ON FUNCTION public.apply_radio_booking_transition() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.radio_require_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT app_private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'RADIO_NOT_AUTHORIZED';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.radio_require_admin() FROM PUBLIC, anon, authenticated;

-- Public reservation: row lock + trigger transition happen in one database
-- transaction. A concurrent caller waits, then receives RADIO_SLOT_UNAVAILABLE.
CREATE OR REPLACE FUNCTION public.reserve_radio_slot(
  p_slot_id uuid,
  p_requester text,
  p_student_id text,
  p_klass text,
  p_song text,
  p_message text,
  p_additional_info text
)
RETURNS TABLE (
  booking_id uuid,
  booking_slot_id uuid,
  requester text,
  student_id text,
  klass text,
  song text,
  message text,
  additional_info text,
  booking_status text,
  booking_created_at timestamp with time zone,
  booking_updated_at timestamp with time zone,
  slot_date date,
  slot_start_time time without time zone,
  slot_state text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  locked_state text;
  new_booking_id uuid;
  clean_requester text := btrim(coalesce(p_requester, ''));
  clean_student_id text := btrim(coalesce(p_student_id, ''));
  clean_klass text := btrim(coalesce(p_klass, ''));
  clean_song text := btrim(coalesce(p_song, ''));
  clean_message text := btrim(coalesce(p_message, ''));
  clean_additional_info text := btrim(coalesce(p_additional_info, ''));
BEGIN
  IF clean_requester = '' OR clean_student_id = '' OR clean_klass = '' OR clean_song = '' THEN
    RAISE EXCEPTION 'RADIO_INVALID_BOOKING';
  END IF;
  IF length(clean_requester) > 120 OR length(clean_student_id) > 40 OR length(clean_klass) > 40
     OR length(clean_song) > 200 OR length(clean_message) > 600 OR length(clean_additional_info) > 1000 THEN
    RAISE EXCEPTION 'RADIO_INVALID_BOOKING';
  END IF;

  SELECT rs.state INTO locked_state
  FROM public.radio_slots AS rs
  WHERE rs.id = p_slot_id AND rs.date IS NOT NULL AND rs.start_time IS NOT NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RADIO_SLOT_NOT_FOUND';
  END IF;
  IF locked_state <> 'AVAILABLE' THEN
    RAISE EXCEPTION 'RADIO_SLOT_UNAVAILABLE';
  END IF;

  INSERT INTO public.radio_bookings (slot_id, requester, student_id, klass, song, message, additional_info, status)
  VALUES (p_slot_id, clean_requester, clean_student_id, clean_klass, clean_song, clean_message, clean_additional_info, 'PENDING')
  RETURNING id INTO new_booking_id;

  RETURN QUERY
  SELECT b.id, b.slot_id, b.requester, b.student_id, b.klass, b.song, b.message, b.additional_info,
         b.status, b.created_at, b.updated_at, s.date, s.start_time, s.state
  FROM public.radio_bookings AS b
  JOIN public.radio_slots AS s ON s.id = b.slot_id
  WHERE b.id = new_booking_id;
END;
$$;

-- Admin state changes use this single transaction-safe operation. The trigger
-- performs the paired slot update before this function returns.
CREATE OR REPLACE FUNCTION public.transition_radio_booking(
  p_booking_id uuid,
  p_next_status text
)
RETURNS TABLE (
  booking_id uuid,
  booking_slot_id uuid,
  requester text,
  student_id text,
  klass text,
  song text,
  message text,
  additional_info text,
  booking_status text,
  booking_created_at timestamp with time zone,
  booking_updated_at timestamp with time zone,
  slot_date date,
  slot_start_time time without time zone,
  slot_state text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.radio_require_admin();
  IF p_next_status NOT IN ('APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') THEN
    RAISE EXCEPTION 'RADIO_INVALID_TRANSITION';
  END IF;

  PERFORM 1
  FROM public.radio_bookings AS b
  WHERE b.id = p_booking_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'RADIO_BOOKING_NOT_FOUND';
  END IF;

  UPDATE public.radio_bookings
  SET status = p_next_status, updated_at = now()
  WHERE id = p_booking_id;

  RETURN QUERY
  SELECT b.id, b.slot_id, b.requester, b.student_id, b.klass, b.song, b.message, b.additional_info,
         b.status, b.created_at, b.updated_at, s.date, s.start_time, s.state
  FROM public.radio_bookings AS b
  LEFT JOIN public.radio_slots AS s ON s.id = b.slot_id
  WHERE b.id = p_booking_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_radio_slot(
  p_date date,
  p_start_time time without time zone,
  p_note text
)
RETURNS TABLE (
  slot_id uuid,
  slot_date date,
  slot_start_time time without time zone,
  slot_state text,
  slot_note text,
  slot_created_at timestamp with time zone,
  slot_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_date IS NULL OR p_start_time IS NULL THEN
    RAISE EXCEPTION 'RADIO_INVALID_DATA';
  END IF;
  PERFORM public.radio_require_admin();
  IF length(coalesce(p_note, '')) > 300 THEN RAISE EXCEPTION 'RADIO_INVALID_DATA'; END IF;
  RETURN QUERY
  INSERT INTO public.radio_slots (date, start_time, state, note)
  VALUES (p_date, p_start_time, 'AVAILABLE', btrim(coalesce(p_note, '')))
  RETURNING id, date, start_time, state, note, created_at, updated_at;
EXCEPTION
  WHEN unique_violation THEN RAISE EXCEPTION 'RADIO_SLOT_CONFLICT';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_radio_slot(
  p_slot_id uuid,
  p_date date,
  p_start_time time without time zone,
  p_note text
)
RETURNS TABLE (
  slot_id uuid,
  slot_date date,
  slot_start_time time without time zone,
  slot_state text,
  slot_note text,
  slot_created_at timestamp with time zone,
  slot_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_state text;
BEGIN
  IF p_date IS NULL OR p_start_time IS NULL THEN
    RAISE EXCEPTION 'RADIO_INVALID_DATA';
  END IF;
  PERFORM public.radio_require_admin();
  IF length(coalesce(p_note, '')) > 300 THEN RAISE EXCEPTION 'RADIO_INVALID_DATA'; END IF;
  SELECT state INTO current_state FROM public.radio_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RADIO_SLOT_NOT_FOUND'; END IF;
  IF current_state IN ('PENDING', 'BOOKED') THEN RAISE EXCEPTION 'RADIO_SLOT_ACTIVE'; END IF;

  RETURN QUERY
  UPDATE public.radio_slots
  SET date = p_date, start_time = p_start_time, note = btrim(coalesce(p_note, ''))
  WHERE id = p_slot_id
  RETURNING id, date, start_time, state, note, created_at, updated_at;
EXCEPTION
  WHEN unique_violation THEN RAISE EXCEPTION 'RADIO_SLOT_CONFLICT';
END;
$$;

CREATE OR REPLACE FUNCTION public.close_radio_slot(p_slot_id uuid)
RETURNS TABLE (
  slot_id uuid,
  slot_date date,
  slot_start_time time without time zone,
  slot_state text,
  slot_note text,
  slot_created_at timestamp with time zone,
  slot_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_state text;
BEGIN
  PERFORM public.radio_require_admin();
  SELECT state INTO current_state FROM public.radio_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RADIO_SLOT_NOT_FOUND'; END IF;
  IF current_state <> 'AVAILABLE' THEN RAISE EXCEPTION 'RADIO_SLOT_UNAVAILABLE'; END IF;
  RETURN QUERY
  UPDATE public.radio_slots SET state = 'CLOSED', updated_at = now() WHERE id = p_slot_id
  RETURNING id, date, start_time, state, note, created_at, updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.reopen_radio_slot(p_slot_id uuid)
RETURNS TABLE (
  slot_id uuid,
  slot_date date,
  slot_start_time time without time zone,
  slot_state text,
  slot_note text,
  slot_created_at timestamp with time zone,
  slot_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_state text;
BEGIN
  PERFORM public.radio_require_admin();
  SELECT state INTO current_state FROM public.radio_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RADIO_SLOT_NOT_FOUND'; END IF;
  IF current_state <> 'CLOSED' THEN RAISE EXCEPTION 'RADIO_SLOT_UNAVAILABLE'; END IF;
  RETURN QUERY
  UPDATE public.radio_slots SET state = 'AVAILABLE', updated_at = now() WHERE id = p_slot_id
  RETURNING id, date, start_time, state, note, created_at, updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.radio_require_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transition_radio_booking(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_radio_slot(date, time without time zone, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_radio_slot(uuid, date, time without time zone, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.close_radio_slot(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reopen_radio_slot(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_radio_slot(uuid, text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.reserve_radio_slot(uuid, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.transition_radio_booking(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_radio_slot(date, time without time zone, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_radio_slot(uuid, date, time without time zone, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_radio_slot(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reopen_radio_slot(uuid) TO authenticated;
