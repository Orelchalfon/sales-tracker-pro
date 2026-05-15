create extension if not exists "uuid-ossp";

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.sales (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sale_date    date not null,
  system_name  text not null,
  system_price numeric(12,2) not null,
  commission   numeric(12,2) not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index on public.sales(user_id, sale_date);

alter table public.profiles enable row level security;
alter table public.sales    enable row level security;

create policy "profiles: own row" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "sales: own rows" on public.sales for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
