-- Create job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company text NOT NULL,
  position text NOT NULL,
  status text NOT NULL DEFAULT 'wishlist', -- wishlist, applied, oa, interview, offer, rejected
  url text,
  salary text,
  location text,
  notes text,
  applied_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT job_applications_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Enable Policies
CREATE POLICY "Users can read own job applications."
  ON public.job_applications FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own job applications."
  ON public.job_applications FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own job applications."
  ON public.job_applications FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own job applications."
  ON public.job_applications FOR DELETE
  USING ( auth.uid() = user_id );
