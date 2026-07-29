-- 0004_fix_pg_net_schema_reference.sql
-- 修正0001~0003版notify_ai_moderation()對pg_net函式的schema參照錯誤。
--
-- 根因:pg_net擴充功能不論裝在哪個schema(此專案裝在extensions schema,
-- 見pg_extension.extnamespace),其函式(如http_post)固定建立在名為
-- `net`的schema下,不會跟著extensions走。原本寫的`extensions.net.http_post`
-- 被Postgres解析成三段式「資料庫.schema.函式」參照,實測噴錯:
-- "cross-database references are not implemented: extensions.net.http_post"。
-- 正確參照應為兩段式的 `net.http_post`。

CREATE OR REPLACE FUNCTION public.notify_ai_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault
AS $$
DECLARE
  webhook_secret TEXT;
  content_value TEXT;
BEGIN
  SELECT decrypted_secret INTO webhook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'webhook_secret'
  LIMIT 1;

  IF webhook_secret IS NULL THEN
    RAISE WARNING 'Vault中找不到名為webhook_secret的密鑰,略過本次AI預篩通知(不影響本次INSERT)';
    RETURN NEW;
  END IF;

  content_value := CASE WHEN TG_TABLE_NAME = 'user_submissions'
                        THEN to_jsonb(NEW) ->> 'content'
                        ELSE to_jsonb(NEW) ->> 'note'
                   END;

  PERFORM net.http_post(
    url     := 'https://httksnqnxaeacmockphr.supabase.co/functions/v1/moderate-content',
    body    := jsonb_build_object(
                 'table', TG_TABLE_NAME,
                 'id', NEW.id,
                 'content', content_value
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
