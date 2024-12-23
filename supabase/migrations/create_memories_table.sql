-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create memories table
create table public.memories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  description text not null,
  journal_entry text,
  intensity smallint not null check (intensity between 1 and 4),
  photo_url text,
  frame_style text,
  photo_effect text,
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.memories enable row level security;

-- Create policies
create policy "Users can view their own memories"
  on memories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memories"
  on memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memories"
  on memories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own memories"
  on memories for delete
  using (auth.uid() = user_id);

-- Create storage bucket for photos
insert into storage.buckets (id, name)
values ('memory-photos', 'memory-photos');

-- Set up storage policies
create policy "Memory photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'memory-photos');

create policy "Authenticated users can upload memory photos"
  on storage.objects for insert
  with check (
    bucket_id = 'memory-photos'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own memory photos"
  on storage.objects for update
  using (
    bucket_id = 'memory-photos'
    and auth.uid() = owner
  );

create policy "Users can delete their own memory photos"
  on storage.objects for delete
  using (
    bucket_id = 'memory-photos'
    and auth.uid() = owner
  ); 