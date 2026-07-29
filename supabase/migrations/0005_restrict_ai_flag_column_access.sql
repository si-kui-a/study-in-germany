-- 0005_restrict_ai_flag_column_access.sql
-- user_submissions有public read RLS政策(status IN ('pending','approved')
-- 對anon/authenticated開放),但RLS只在row層級生效,不會限制「這個row裡
-- 的哪些欄位」可以被讀。
--
-- 本次一併處理兩類欄位:
-- 1) 0001新增的ai_flag/ai_flag_reason/ai_flagged_at——若不處理,任何人
--    (含未登入訪客)透過公開的anon key直接呼叫REST API都能看到自己或
--    別人投稿被AI標記成什麼,即使React畫面沒有把這幾個欄位畫出來。
-- 2) reviewer_note/reviewed_at——這兩個是既有欄位(非本次新增),但同樣
--    透過同一個public read政策+select('*')曝露給前端;reviewer_note是
--    Lily的內部審核備註,不應該公開。使用者確認一併收回。
--
-- 用欄位層級權限收回。service_role(Edge Function寫回用、未來若有內部
-- 工具讀取用)不受影響,因為service_role本身就繞過一般的grant/RLS檢查。
--
-- 注意:PostgREST/Postgres對「查詢包含沒有權限的欄位」的行為是直接回傳
-- 權限錯誤,不是靜默省略該欄位——所以前端凡是對user_submissions下
-- select('*')的地方,都必須改成明確列出欄位(不含這5個),否則會直接壞掉。
-- 已一併檢查src/並修正UserSubmissionsList.tsx(唯一一處select('*')的
-- 公開讀取路徑)。

REVOKE SELECT (ai_flag, ai_flag_reason, ai_flagged_at, reviewer_note, reviewed_at)
  ON public.user_submissions
  FROM anon, authenticated;
