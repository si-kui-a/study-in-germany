# Expected Schema — 期望值總表（Phase AV）

由校正後的 `supabase/schema.sql`（2026-07-15 Phase AV 校正版）人工逐段推導出的最終期望狀態。
格式與 `supabase/audit.sql` 的輸出（`section` / `key` / `value`）逐項對應，供執行 audit.sql 後直接對照。

**推導方式**：schema.sql 是依 Phase 順序疊加的遷移腳本（`CREATE TABLE` + 後續多個
`ALTER TABLE` / `DROP POLICY` + `CREATE POLICY` / `DROP CONSTRAINT` + `ADD CONSTRAINT`），
本文件呈現的是**套用全部段落後的最終狀態**，不是逐段記錄。若 audit.sql 的實際輸出與本表
不符，代表存在漂移，需要逐項列出修復 SQL（見指令書「交付後流程」）。

**已知的既存缺口（非本輪修復範圍，僅供比對時不要誤判為新漂移）**：
- `user_submissions_target_category_check` 不含 `'immigration'`（PAT-146 記錄的既有缺口，Phase AR 加了新分類但這條 CHECK 未同步更新）

---

## TABLE（全表清單，schemaname='public'）

| key |
|---|
| profiles |
| school_reviews |
| listings |
| user_submissions |
| user_follows |
| reports |
| listing_likes |
| listing_comments |

（8 張表；不應含 `listings_pre_v4` / `school_reviews_pre_v4` — 已確認 schema.sql 內無此二表定義）

---

## COLUMN（table.column | data_type NULL/NOT NULL DEFAULT ...）

### profiles
| column | type | nullable | default |
|---|---|---|---|
| id | uuid | NOT NULL | — |
| display_name | text | NOT NULL | — |
| avatar_url | text | NULL | — |
| created_at | timestamptz | NULL | now() |
| registration_seq | bigint | NULL | nextval('profiles_registration_seq_seq') |
| badges | jsonb | NULL | '[]'::jsonb |
| deletion_requested_at | timestamptz | NULL | — |
| persona_stage | text | NULL | — |
| workflow_progress | jsonb | NULL | '{}'::jsonb |

### school_reviews
| column | type | nullable | default |
|---|---|---|---|
| id | bigint | NOT NULL | (bigserial) |
| school_id | text | NOT NULL | — |
| user_id | uuid | NOT NULL | — |
| stars | jsonb | NOT NULL | — |
| comment_text | text | NOT NULL | — |
| created_at | timestamptz | NULL | now() |

### listings
| column | type | nullable | default |
|---|---|---|---|
| id | bigint | NOT NULL | (bigserial) |
| user_id | uuid | NOT NULL | — |
| type | text | NOT NULL | — |
| region | text | NOT NULL | — |
| title | text | NOT NULL | — |
| description | text | NOT NULL | — |
| price | text | NULL | — |
| contact_info | text | NOT NULL | — |
| photo_urls | text[] | NOT NULL | '{}' |
| expires_at | timestamptz | NULL | now() + interval '60 days' |
| created_at | timestamptz | NULL | now() |

### user_submissions
| column | type | nullable | default |
|---|---|---|---|
| id | bigint | NOT NULL | (bigserial) |
| user_id | uuid | NULL | — |
| submission_type | text | NOT NULL | — |
| target_id | text | NULL | — |
| title | text | NOT NULL | — |
| content | text | NOT NULL | — |
| status | text | NOT NULL | 'approved' |
| created_at | timestamptz | NOT NULL | now() |
| reviewed_at | timestamptz | NULL | — |
| reviewer_note | text | NULL | — |
| target_url | text | NULL | — |
| target_category | text | NULL | — |

### user_follows
| column | type | nullable | default |
|---|---|---|---|
| id | bigint | NOT NULL | (bigserial) |
| follower_id | uuid | NOT NULL | — |
| following_id | uuid | NOT NULL | — |
| created_at | timestamptz | NOT NULL | now() |

### reports
| column | type | nullable | default |
|---|---|---|---|
| id | bigint | NOT NULL | (bigserial) |
| reporter_id | uuid | NULL | — |
| target_type | text | NOT NULL | — |
| target_id | text | NOT NULL | — |
| reason | text | NOT NULL | — |
| note | text | NULL | — |
| status | text | NOT NULL | 'pending' |
| created_at | timestamptz | NOT NULL | now() |

### listing_likes（Phase AV 首次校正，Phase AZ 二次校正 user_id 外鍵目標）
| column | type | nullable | default |
|---|---|---|---|
| id | bigint | NULL（非 PK，保留供前端 `.select('id')` 使用） | (bigserial) |
| listing_id | bigint | NOT NULL | — |
| user_id | uuid | NOT NULL | — |
| created_at | timestamptz | NOT NULL | now() |

### listing_comments
| column | type | nullable | default |
|---|---|---|---|
| id | bigint | NOT NULL | (bigserial) |
| listing_id | bigint | NOT NULL | — |
| user_id | uuid | NOT NULL | — |
| content | text | NOT NULL | — |
| created_at | timestamptz | NOT NULL | now() |

---

## CONSTRAINT（table.constraint_name | 定義摘要）

| table | constraint | 類型 | 定義摘要 |
|---|---|---|---|
| profiles | profiles_pkey | PK | (id) |
| profiles | profiles_id_fkey | FK | id → auth.users(id) ON DELETE CASCADE |
| school_reviews | school_reviews_pkey | PK | (id) |
| school_reviews | school_reviews_user_id_fkey | FK | user_id → auth.users(id) ON DELETE CASCADE |
| school_reviews | school_reviews_comment_text_check | CHECK | char_length(comment_text) BETWEEN 5 AND 1000 |
| school_reviews | stars_has_overall | CHECK | stars ? 'overall' AND (stars->>'overall')::int BETWEEN 1 AND 5 |
| listings | listings_pkey | PK | (id) |
| listings | listings_user_id_fkey | FK | user_id → auth.users(id) ON DELETE CASCADE |
| listings | listings_type_check | CHECK | type IN (8 值，見上方 COLUMN 區塊註記) |
| listings | listings_title_check | CHECK | char_length(title) BETWEEN 2 AND 100 |
| listings | listings_description_check | CHECK | char_length(description) BETWEEN 5 AND 2000 |
| listings | listings_photo_urls_check | CHECK | array_length(photo_urls,1) IS NULL OR <= 6 |
| user_submissions | user_submissions_pkey | PK | (id) |
| user_submissions | user_submissions_user_id_fkey | FK | user_id → auth.users(id) ON DELETE SET NULL |
| user_submissions | user_submissions_submission_type_check | CHECK | submission_type IN (school_edit/new_school/new_recommendation/general_feedback) |
| user_submissions | user_submissions_title_check | CHECK | char_length(title) BETWEEN 2 AND 100 |
| user_submissions | user_submissions_content_check | CHECK | char_length(content) BETWEEN 5 AND 2000 |
| user_submissions | user_submissions_status_check | CHECK | status IN (pending/approved/rejected/archived) |
| user_submissions | user_submissions_target_url_check | CHECK | target_url IS NULL OR (len<=500 AND LIKE 'http%') |
| user_submissions | user_submissions_target_category_check | CHECK | target_category IS NULL OR IN (finance/transport/telecom/housing/lookup/scholarship/expense/general)——**不含 'immigration'，PAT-146 既有缺口** |
| user_follows | user_follows_pkey | PK | (id) |
| user_follows | user_follows_follower_id_fkey | FK | follower_id → auth.users(id) ON DELETE CASCADE |
| user_follows | user_follows_following_id_fkey | FK | following_id → auth.users(id) ON DELETE CASCADE |
| user_follows | user_follows_follower_id_following_id_key | UNIQUE | (follower_id, following_id) |
| user_follows | user_follows_check | CHECK | follower_id != following_id |
| reports | reports_pkey | PK | (id) |
| reports | reports_reporter_id_fkey | FK | reporter_id → auth.users(id) ON DELETE SET NULL |
| reports | reports_target_type_check | CHECK | target_type IN (listing/review/submission) |
| reports | reports_reason_check | CHECK | reason IN (spam/inappropriate/misinformation/harassment/other) |
| reports | reports_note_check | CHECK | note IS NULL OR char_length(note) <= 500 |
| reports | reports_status_check | CHECK | status IN (pending/reviewed/dismissed) |
| listing_likes | listing_likes_pkey | PK（複合） | (listing_id, user_id) |
| listing_likes | listing_likes_listing_id_fkey | FK | listing_id → listings(id) ON DELETE CASCADE |
| listing_likes | listing_likes_user_id_fkey | **FK** | **user_id → profiles(id) ON DELETE CASCADE ← Phase AZ 二次校正重點（原誤記為 auth.users(id)）** |
| listing_comments | listing_comments_pkey | PK | (id) |
| listing_comments | listing_comments_listing_id_fkey | FK | listing_id → listings(id) ON DELETE CASCADE |
| listing_comments | listing_comments_user_id_fkey | FK | user_id → auth.users(id) ON DELETE CASCADE |
| listing_comments | listing_comments_content_check | CHECK | char_length(content) BETWEEN 1 AND 500 |

（`persona_stage` 欄位**不應有** CHECK 約束——本輪校正移除，見上方 profiles COLUMN 區塊）

---

## RLS（全表 Row Level Security 啟用狀態）

全部 8 張表皆為 `ENABLED`（無任何一張表停用 RLS）。

---

## POLICY（table.policy_name | cmd / roles / qual 摘要）

| table | policy | cmd | 摘要 |
|---|---|---|---|
| profiles | profiles_public_read | SELECT | true |
| profiles | profiles_own_update | UPDATE | auth.uid() = id |
| school_reviews | reviews_public_read | SELECT | true |
| school_reviews | reviews_auth_insert | INSERT | auth.uid() = user_id |
| school_reviews | reviews_own_delete | DELETE | auth.uid() = user_id |
| listings | listings_public_read | SELECT | expires_at IS NULL OR expires_at > now() OR auth.uid() = user_id |
| listings | listings_auth_insert | INSERT | auth.uid() = user_id |
| listings | listings_own_update | UPDATE | auth.uid() = user_id |
| listings | listings_own_delete | DELETE | auth.uid() = user_id |
| user_submissions | user_submissions_anon_insert | INSERT | true |
| user_submissions | user_submissions_public_read_visible | SELECT | status IN (pending, approved) |
| user_submissions | user_submissions_author_delete_pending | DELETE | auth.uid() = user_id AND status = 'pending' |
| user_follows | user_follows_auth_insert | INSERT | auth.uid() = follower_id |
| user_follows | user_follows_public_read | SELECT | true |
| user_follows | user_follows_own_delete | DELETE | auth.uid() = follower_id |
| reports | reports_anon_insert | INSERT | true |
| reports | （無 SELECT policy，預設封閉，僅 Lily 用 service role / Dashboard 登入查看） | — | — |
| listing_likes | **likes_auth_insert**（本輪改名） | INSERT | auth.uid() = user_id |
| listing_likes | **likes_public_read**（本輪改名） | SELECT | true |
| listing_likes | **likes_auth_delete**（本輪改名） | DELETE | auth.uid() = user_id |
| listing_comments | listing_comments_auth_insert | INSERT | auth.uid() = user_id |
| listing_comments | listing_comments_public_read | SELECT | true |
| listing_comments | listing_comments_own_delete | DELETE | auth.uid() = user_id |
| storage.objects | listings_photo_auth_upload | INSERT (to authenticated) | bucket_id='listings' AND foldername[1]=auth.uid() |
| storage.objects | listings_photo_own_delete | DELETE (to authenticated) | bucket_id='listings' AND foldername[1]=auth.uid() |
| storage.objects | listings_photo_public_read | SELECT | bucket_id='listings' |
| storage.objects | avatars_user_owned_write | ALL | bucket_id='avatars' AND foldername[1]=auth.uid() |
| storage.objects | avatars_public_read | SELECT | bucket_id='avatars' |

---

## STORAGE_BUCKET

| bucket id | public | file_size_limit | allowed_mime_types |
|---|---|---|---|
| listings | true | 4194304 | image/jpeg, image/png, image/webp |
| avatars | true | （未指定，使用 Supabase 預設） | （未指定，使用 Supabase 預設） |

---

## TRIGGER

| trigger | 所在表 | 時機 | 對應 function |
|---|---|---|---|
| on_auth_user_created | auth.users | AFTER INSERT, FOR EACH ROW | public.handle_new_user() |

**此為新帳號註冊時 profiles 列自動建立的關鍵鏈**：若 audit.sql 執行結果的 TRIGGER 區塊
缺少這一列，代表新使用者 Google 登入後不會自動產生對應的 `profiles` 列，前端多處查詢
（依賴 `profiles` 存在）會失敗——且因為既有帳號早已有 profiles 列，這個問題只有「全新
帳號第一次登入」才會觸發，日常用已註冊帳號測試永遠測不到。

---

## FUNCTION（public schema）

| function | 摘要 |
|---|---|
| handle_new_user | SECURITY DEFINER；新 auth.users 列插入時，寫入對應 profiles 列（id/display_name/avatar_url），display_name 取 raw_user_meta_data 的 full_name，缺省則取 email @ 前半段 |

---

## 本文件與 audit.sql 的對照方式

1. 於 Supabase SQL Editor 執行 `supabase/audit.sql`，複製完整輸出。
2. 依 `section` 分組，逐一比對本文件對應章節：
   - `TABLE` 對照「TABLE」章節的表清單（數量、名稱）
   - `COLUMN` 對照各表的 COLUMN 表格（型別、nullable、default）
   - `CONSTRAINT` 對照 CONSTRAINT 表格（尤其留意 `listing_likes_pkey` 是否為複合主鍵）
   - `RLS` 應全數為 `ENABLED`
   - `POLICY` 對照 POLICY 表格（尤其留意 `listing_likes` 的 3 個 policy 名稱）
   - `STORAGE_BUCKET` 對照 bucket 清單（若該區塊查詢失敗，改用 Dashboard 人工核對）
   - `TRIGGER` 必須包含 `on_auth_user_created`
   - `FUNCTION` 必須包含 `handle_new_user`
3. 任何不符之處列成清單回報，由治理端逐項出修復 SQL。
