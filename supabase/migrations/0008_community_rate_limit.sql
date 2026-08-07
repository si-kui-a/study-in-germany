-- 社群匿名寫入伺服器端速率限制。
-- 不保存原始 IP；只保存由 Supabase gateway request headers 推導的 SHA-256 指紋。
-- 瀏覽器端限制只改善 UX，本 trigger 才是不可由清除 localStorage 繞過的正式防線。

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.community_write_events (
  id BIGSERIAL PRIMARY KEY,
  actor_hash TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('submission', 'report')),
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_write_events_actor_time_idx
  ON public.community_write_events (actor_hash, action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS community_write_events_cleanup_idx
  ON public.community_write_events (created_at);

ALTER TABLE public.community_write_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_write_events FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_community_write_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  headers JSONB := COALESCE(NULLIF(current_setting('request.headers', true), ''), '{}')::JSONB;
  actor_source TEXT;
  actor_hash_value TEXT;
  content_hash_value TEXT;
  action_value TEXT;
  recent_count INTEGER;
  duplicate_count INTEGER;
  hourly_limit INTEGER;
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;

  action_value := CASE WHEN TG_TABLE_NAME = 'reports' THEN 'report' ELSE 'submission' END;
  hourly_limit := CASE WHEN action_value = 'report' THEN 10 ELSE 5 END;
  actor_source := COALESCE(
    auth.uid()::TEXT,
    headers->>'cf-connecting-ip',
    split_part(COALESCE(headers->>'x-forwarded-for', ''), ',', 1),
    headers->>'user-agent',
    'anonymous'
  );
  actor_hash_value := encode(extensions.digest(actor_source, 'sha256'), 'hex');
  content_hash_value := encode(extensions.digest(
    CASE WHEN action_value = 'report'
      THEN concat_ws('|', NEW.target_type, NEW.target_id, NEW.reason)
      ELSE concat_ws('|', NEW.submission_type, NEW.target_id, lower(NEW.title), lower(NEW.content))
    END,
    'sha256'
  ), 'hex');

  DELETE FROM public.community_write_events WHERE created_at < NOW() - INTERVAL '24 hours';

  SELECT count(*) INTO recent_count
  FROM public.community_write_events
  WHERE actor_hash = actor_hash_value AND action_type = action_value
    AND created_at > NOW() - INTERVAL '1 hour';
  IF recent_count >= hourly_limit THEN
    RAISE EXCEPTION 'community_rate_limit_exceeded' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*) INTO duplicate_count
  FROM public.community_write_events
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

DROP TRIGGER IF EXISTS enforce_user_submission_rate_limit ON public.user_submissions;
CREATE TRIGGER enforce_user_submission_rate_limit
  BEFORE INSERT ON public.user_submissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_community_write_limit();

DROP TRIGGER IF EXISTS enforce_report_rate_limit ON public.reports;
CREATE TRIGGER enforce_report_rate_limit
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.enforce_community_write_limit();
