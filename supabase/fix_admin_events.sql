ALTER TABLE public.admin_events RENAME COLUMN date TO event_date;
ALTER TABLE public.admin_events RENAME COLUMN is_active TO is_public;
ALTER TABLE public.admin_events ADD COLUMN location text DEFAULT 'Prudentia Campus';
ALTER TABLE public.admin_events ADD COLUMN author_name text;
ALTER TABLE public.admin_events ADD COLUMN author_id uuid;
