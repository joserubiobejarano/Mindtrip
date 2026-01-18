alter table profiles
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists coupon_code text,
  add column if not exists attribution_set_at timestamptz;

create index if not exists profiles_attribution_set_at_idx
  on profiles (attribution_set_at);
