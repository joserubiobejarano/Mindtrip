alter table profiles
  add column if not exists pro_upgrade_email_sent_at timestamptz,
  add column if not exists subscription_canceled_email_sent_at timestamptz;

alter table trips
  add column if not exists trip_ready_email_sent_at timestamptz,
  add column if not exists trip_reminder_email_sent_at timestamptz;
