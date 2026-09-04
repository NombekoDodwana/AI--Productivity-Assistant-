CREATE TABLE public.bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  component text not null,
  issue_description text not null,
  category text not null check (category in ('storage_ram','screens_peripherals','motherboard_power','unsure')),
  consultant text not null,
  consultant_title text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

GRANT INSERT ON public.bookings TO anon;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a repair booking"
  ON public.bookings FOR INSERT
  TO anon
  WITH CHECK (true);