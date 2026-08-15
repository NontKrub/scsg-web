create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated, service_role;

create or replace function app_private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

revoke all on function app_private.has_role(uuid, public.app_role) from public;
grant execute on function app_private.has_role(uuid, public.app_role) to authenticated, service_role;

do $$
declare r record; q text; v_roles text; newq text; newwc text;
begin
  for r in
    select pol.schemaname as sname, pol.tablename as tname, pol.policyname as pname, pol.roles::text[] as rolelist,
           pol.cmd as pcmd, pol.qual as pqual, pol.with_check as pwc
    from pg_policies pol
    where pol.qual ilike '%has_role%' or pol.with_check ilike '%has_role%'
  loop
    newq := replace(coalesce(r.pqual,''), 'has_role(', 'app_private.has_role(');
    newwc := replace(coalesce(r.pwc,''), 'has_role(', 'app_private.has_role(');
    newq := replace(newq, 'app_private.app_private.', 'app_private.');
    newwc := replace(newwc, 'app_private.app_private.', 'app_private.');
    v_roles := array_to_string(r.rolelist, ', ');
    execute format('drop policy %I on %I.%I', r.pname, r.sname, r.tname);
    q := format('create policy %I on %I.%I for %s to %s', r.pname, r.sname, r.tname, r.pcmd, v_roles);
    if newq <> '' then q := q || format(' using (%s)', newq); end if;
    if newwc <> '' then q := q || format(' with check (%s)', newwc); end if;
    execute q;
  end loop;
end $$;

drop function if exists public.has_role(uuid, public.app_role);