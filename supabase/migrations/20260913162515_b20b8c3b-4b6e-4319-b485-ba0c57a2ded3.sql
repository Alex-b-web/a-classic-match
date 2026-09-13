CREATE TABLE public.reader_state (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reader_state TO authenticated;
GRANT ALL ON public.reader_state TO service_role;

ALTER TABLE public.reader_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Readers manage their own state" ON public.reader_state
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER reader_state_updated_at BEFORE UPDATE ON public.reader_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();