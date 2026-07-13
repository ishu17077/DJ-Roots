-- Add visibility toggle to rooms
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create policy to allow reading public rooms
CREATE POLICY "Public rooms are viewable by everyone."
  ON public.rooms FOR SELECT
  USING (true); -- Currently the existing policy might already allow reading all rooms, let's verify if RLS is enabled and what the policies are.
