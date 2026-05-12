CREATE TABLE public.access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  device_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
-- No policies: only service role (server) can read/write.
CREATE INDEX access_tokens_token_idx ON public.access_tokens(token);