-- 將匿名社群寫入指紋改為帶伺服器密鑰的 HMAC。
-- 密鑰只在部署時隨機產生並保存於 Supabase Vault，不進入版本庫。

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
    WHERE name = 'community_rate_limit_hmac_key'
  ) THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'community_rate_limit_hmac_key',
      'HMAC key for pseudonymous community write rate limits'
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_community_write_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  headers JSONB := COALESCE(NULLIF(current_setting('request.headers', true), ''), '{}')::JSONB;
  hmac_key TEXT;
  actor_source TEXT;
  actor_hash_value TEXT;
  content_hash_value TEXT;
  action_value TEXT;
  recent_count INTEGER;
  duplicate_count INTEGER;
  hourly_limit INTEGER;
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;

  SELECT decrypted_secret INTO hmac_key
  FROM vault.decrypted_secrets
  WHERE name = 'community_rate_limit_hmac_key'
  ORDER BY created_at DESC LIMIT 1;
  IF NULLIF(hmac_key, '') IS NULL THEN
    RAISE EXCEPTION 'community_rate_limit_key_missing' USING ERRCODE = 'P0001';
  END IF;

  action_value := CASE WHEN TG_TABLE_NAME = 'reports' THEN 'report' ELSE 'submission' END;
  hourly_limit := CASE WHEN action_value = 'report' THEN 10 ELSE 5 END;
  actor_source := CASE
    WHEN auth.uid() IS NOT NULL THEN 'user:' || auth.uid()::TEXT
    WHEN NULLIF(trim(headers->>'cf-connecting-ip'), '') IS NOT NULL
      THEN 'ip:' || trim(headers->>'cf-connecting-ip')
    WHEN NULLIF(trim(headers->>'x-real-ip'), '') IS NOT NULL
      THEN 'ip:' || trim(headers->>'x-real-ip')
    WHEN NULLIF(trim(headers->>'x-forwarded-for'), '') IS NOT NULL
      THEN 'forwarded:' || trim((string_to_array(headers->>'x-forwarded-for', ','))[
        array_length(string_to_array(headers->>'x-forwarded-for', ','), 1)
      ])
    WHEN NULLIF(trim(headers->>'user-agent'), '') IS NOT NULL
      THEN 'client:' || trim(headers->>'user-agent') || '|' || COALESCE(headers->>'accept-language', '')
    ELSE 'anonymous'
  END;
  actor_hash_value := encode(extensions.hmac(actor_source, hmac_key, 'sha256'), 'hex');
  content_hash_value := encode(extensions.hmac(
    CASE WHEN action_value = 'report'
      THEN concat_ws('|', NEW.target_type, NEW.target_id, NEW.reason)
      ELSE concat_ws('|', NEW.submission_type, NEW.target_id, lower(NEW.title), lower(NEW.content))
    END,
    hmac_key,
    'sha256'
  ), 'hex');

  DELETE FROM public.community_write_events WHERE created_at < NOW() - INTERVAL '24 hours';

  SELECT count(*) INTO recent_count FROM public.community_write_events
  WHERE actor_hash = actor_hash_value AND action_type = action_value
    AND created_at > NOW() - INTERVAL '1 hour';
  IF recent_count >= hourly_limit THEN
    RAISE EXCEPTION 'community_rate_limit_exceeded' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*) INTO duplicate_count FROM public.community_write_events
  WHERE actor_hash = actor_hash_value AND action_type = action_value
    AND content_hash = content_hash_value AND created_at > NOW() - INTERVAL '24 hours';
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'community_duplicate_submission' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.community_write_events (actor_hash, action_type, content_hash)
  VALUES (actor_hash_value, action_value, content_hash_value);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_community_write_limit() FROM PUBLIC;
