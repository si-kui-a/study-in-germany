-- 0003_fix_cross_table_field_reference.sql
-- 修正0001/0002版notify_ai_moderation()的嚴重bug:實測發現對
-- user_submissions新增資料時直接噴錯,整個INSERT交易被回滾——也就是說
-- 修好之前這個bug會讓「使用者投稿」這個既有主要功能完全故障,不只是
-- AI預篩這個附加功能而已。
--
-- 根因:PL/pgSQL裡CASE運算式的兩個分支都會依「觸發此trigger的那個table的
-- 實際row型別」解析欄位參照,不是只解析真正會被選到的那個分支。
-- user_submissions沒有note欄位,所以即使CASE條件下該次不會走到
-- `NEW.note`那個分支,PL/pgSQL仍會嘗試依user_submissions的row型別解析
-- `NEW.note`而噴錯(record "new" has no field "note")。
--
-- 修法:改用to_jsonb(NEW)先把整列轉成JSON,再用->>依鍵名取值——JSON鍵值
-- 查詢查不到時回傳NULL,不會像直接欄位參照一樣要求該欄位在該table型別
-- 中必須存在。

CREATE OR REPLACE FUNCTION public.notify_ai_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
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

  PERFORM extensions.net.http_post(
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
