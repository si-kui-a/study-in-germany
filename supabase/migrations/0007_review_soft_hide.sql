-- 0007_review_soft_hide.sql
-- 檢舉評價(school_reviews)軟性下架機制(2026-07-31,使用者確認方案B)。
--
-- 背景:discord-interactions先前對target_type='review'的檢舉只能回覆
-- 「不支援自動處理」,因為school_reviews完全沒有任何隱藏/狀態欄位。這裡
-- 補上hidden_at,比照listings既有的expires_at軟性下架模式(RLS層級隱藏,
-- 不是真的刪除),下架滿1個月後由pg_cron自動清除。
--
-- 「下架過一個月都沒有更新就自動刪除」——school_reviews目前沒有updated_at
-- 欄位,且reviews_own_update policy本來就限制只能在created_at 15分鐘內
-- 編輯(見schema.sql「(1) school_reviews：補 15 分鐘編輯窗」段落),一則
-- 已經被下架的評價(必然早已過15分鐘編輯窗)結構上不可能再被更新,所以
-- 「沒有更新」這個條件恆成立,不需要額外的updated_at追蹤,單純以
-- hidden_at時間判斷即可。
--
-- hidden_at本身不是敏感內容(跟listings.expires_at同性質,不像0005/0006
-- 收回的ai_flag/reviewer_note是內部判斷資訊),不需要欄位層級GRANT限制,
-- 只靠RLS政策做列層級過濾即可。

ALTER TABLE public.school_reviews
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- 公開讀取排除已下架的評價,但本人仍可看到自己被下架的評價(比照
-- listings_public_read的「OR auth.uid() = user_id」模式,不讓內容
-- 對本人也靜默消失)。
DROP POLICY IF EXISTS "reviews_public_read" ON public.school_reviews;
CREATE POLICY "reviews_public_read" ON public.school_reviews
  FOR SELECT USING (hidden_at IS NULL OR auth.uid() = user_id);

-- 每天凌晨3點清除下架滿1個月的評價。若此專案的Supabase方案未啟用
-- pg_cron,這段會直接報錯,需改用Dashboard的Cron Jobs介面或退回手動
-- 清除,不影響上面的軟性下架本身(那部分不依賴pg_cron)。
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.schedule(
  'purge_hidden_reviews',
  '0 3 * * *',
  $$DELETE FROM public.school_reviews WHERE hidden_at IS NOT NULL AND hidden_at < NOW() - INTERVAL '1 month'$$
);
