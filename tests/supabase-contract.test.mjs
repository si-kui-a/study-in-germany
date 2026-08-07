import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../supabase/migrations/20260807103000_harden_community_actor_fingerprint.sql', import.meta.url);
const sql = await readFile(migrationUrl, 'utf8');

describe('community write database security contract', () => {
  it('stores the fingerprint key in Vault and uses keyed HMAC', () => {
    expect(sql).toContain("name = 'community_rate_limit_hmac_key'");
    expect(sql).toContain('vault.create_secret');
    expect(sql).toMatch(/extensions\.hmac\(actor_source, hmac_key, 'sha256'\)/);
  });

  it('does not let an empty forwarding header suppress fallbacks', () => {
    expect(sql).toContain("NULLIF(trim(headers->>'x-forwarded-for'), '')");
    expect(sql).toContain("NULLIF(trim(headers->>'user-agent'), '')");
  });

  it('fails closed if its server-side secret is unavailable', () => {
    expect(sql).toContain('community_rate_limit_key_missing');
  });
});
