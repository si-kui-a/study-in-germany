-- 0002_webhook_secret_via_vault.sql
-- 修正0001版notify_ai_moderation()的密鑰讀取方式。
--
-- 背景:0001版原本設計用 `ALTER DATABASE postgres SET app.webhook_secret = '...'`
-- 讓密鑰不進git,但實測發現 Supabase 受管理的 Postgres 完全不允許 ALTER DATABASE
-- (連透過migration/CLI的連線權限都不行,是平台層級限制,非權限設定問題)。
--
-- 改用 Supabase Vault(supabase_vault擴充功能,此專案已啟用)存密鑰:
-- 密鑰實際值透過 `select vault.create_secret(...)` 另外存入,不寫在任何
-- migration檔案裡;本檔案只透過secret的「名稱」('webhook_secret')查詢,
-- 不含密鑰字面值。

CREATE OR REPLACE FUNCTION public.notify_ai_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  webhook_secret TEXT;
BEGIN
  SELECT decrypted_secret INTO webhook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'webhook_secret'
  LIMIT 1;

  IF webhook_secret IS NULL THEN
    RAISE WARNING 'Vault中找不到名為webhook_secret的密鑰,略過本次AI預篩通知(不影響本次INSERT)';
    RETURN NEW;
  END IF;

  PERFORM extensions.net.http_post(
    url     := 'https://httksnqnxaeacmockphr.supabase.co/functions/v1/moderate-content',
    body    := jsonb_build_object(
                 'table', TG_TABLE_NAME,
                 'id', NEW.id,
                 'content', CASE WHEN TG_TABLE_NAME = 'user_submissions' THEN NEW.content ELSE NEW.note END
               ),
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-webhook-secret', webhook_secret
               ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;
