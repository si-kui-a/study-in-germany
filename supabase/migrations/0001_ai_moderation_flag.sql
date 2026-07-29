-- 0001_ai_moderation_flag.sql
-- 為 user_submissions / reports 新增 AI 預篩標記欄位,並掛上 Database Webhook
-- 觸發 Edge Function(moderate-content)呼叫 Gemini 免費層分類。
--
-- 設計原則(對應 Meta_Dev_Knowledge.md 既有審核流程,§schema.sql 108-298行):
-- - 純參考標記,不自動核准/拒絕/隱藏任何內容,不改變任何既有 RLS 政策。
-- - 兩張表原本就只有 service_role 能寫入狀態相關欄位,本次沿用同一權限模型
--   (Edge Function 用 service_role key 寫回,不新增任何 anon/authenticated 寫入權限)。
-- - Webhook 密鑰驗證用 current_setting() 動態讀取,實際密鑰值不出現在本檔案
--   (不進 git),需部署時另外用
--   `ALTER DATABASE postgres SET app.webhook_secret = '<隨機字串>';`
--   手動設定一次(與 Edge Function 端的 `supabase secrets set WEBHOOK_SECRET=<同一組值>` 對應)。

-- ── 新增欄位 ──────────────────────────────────────────────────────────────
ALTER TABLE public.user_submissions
  ADD COLUMN IF NOT EXISTS ai_flag TEXT
    CHECK (ai_flag IS NULL OR ai_flag IN ('疑似廣告', '虛假資訊', '需人工複核', '看似正常')),
  ADD COLUMN IF NOT EXISTS ai_flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS ai_flagged_at TIMESTAMPTZ;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS ai_flag TEXT
    CHECK (ai_flag IS NULL OR ai_flag IN ('疑似廣告', '虛假資訊', '需人工複核', '看似正常')),
  ADD COLUMN IF NOT EXISTS ai_flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS ai_flagged_at TIMESTAMPTZ;

-- ── pg_net 擴充功能(供下方trigger function呼叫外部HTTP用)──────────────────
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ── Webhook觸發函式:用current_setting()動態讀密鑰,密鑰字面值不進本檔案 ────
-- Project ref: httksnqnxaeacmockphr(lilichen-F's Project)。
CREATE OR REPLACE FUNCTION public.notify_ai_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  webhook_secret TEXT;
BEGIN
  -- current_setting的第二參數true代表:設定不存在時回傳NULL而非拋例外,
  -- 避免本地開發/尚未設定密鑰的環境讓所有INSERT都失敗。
  webhook_secret := current_setting('app.webhook_secret', true);
  IF webhook_secret IS NULL THEN
    RAISE WARNING 'app.webhook_secret 尚未設定,略過本次AI預篩通知(不影響本次INSERT)';
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

CREATE TRIGGER ai_moderation_on_submission
AFTER INSERT ON public.user_submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_ai_moderation();

CREATE TRIGGER ai_moderation_on_report
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.notify_ai_moderation();
