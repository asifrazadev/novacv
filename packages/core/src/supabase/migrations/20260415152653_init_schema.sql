-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name text,
  avatar_url text,
  username text UNIQUE,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT resumes_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT USING ( true );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE USING ( auth.uid() = id );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Resumes Policies
DO $$ BEGIN
  CREATE POLICY "Users can read own resumes."
    ON public.resumes FOR SELECT USING ( auth.uid() = user_id OR is_public = true );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own resumes."
    ON public.resumes FOR INSERT WITH CHECK ( auth.uid() = user_id );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own resumes."
    ON public.resumes FOR UPDATE USING ( auth.uid() = user_id );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own resumes."
    ON public.resumes FOR DELETE USING ( auth.uid() = user_id );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Function to handle new user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    LOWER(SPLIT_PART(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger to create profile on signup (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
