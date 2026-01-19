CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NULL,
  source TEXT NOT NULL DEFAULT 'homepage_form',
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending',
  interests JSONB NULL,
  provider TEXT DEFAULT 'resend',
  provider_contact_id TEXT NULL,
  confirm_token TEXT NOT NULL,
  manage_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  confirm_sent_at TIMESTAMPTZ NULL,
  confirmed_at TIMESTAMPTZ NULL,
  unsubscribed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_unique
  ON newsletter_subscribers (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_confirm_token_unique
  ON newsletter_subscribers (confirm_token);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_manage_token_unique
  ON newsletter_subscribers (manage_token);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
  ON newsletter_subscribers (status);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx
  ON newsletter_subscribers (created_at);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscribers_updated_at();
