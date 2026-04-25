-- Demo tenant for prototype
-- bcrypt hash of API key 'lgl_demo_test_key_change_me' (rounds=10).
-- Generate yours with: node -e "console.log(require('bcryptjs').hashSync('lgl_demo_test_key_change_me', 10))"
-- For now, insert a placeholder; the actual hash will be set by a separate seed step.
insert into tenants (slug, name, api_key_hash, operator_public_key)
values (
  'demo',
  'Ledgerline Demo Tenant',
  '$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH',
  null
)
on conflict (slug) do nothing;
