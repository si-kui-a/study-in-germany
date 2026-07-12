-- ============================================
-- study-in-germany · schema v4.0
-- 執行方式：Supabase Dashboard → SQL Editor → 貼上全文 → Run
-- 先決條件：Authentication → Providers 啟用 Google
-- 本案 pre-deployment，可直接執行 v4.0 全量 SQL。
-- 若已部署 v2，請先 DROP 舊表（見 migrate_v2_to_v4.sql）。
-- ============================================

-- 1. profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. school_reviews (v4: JSONB stars)
CREATE TABLE public.school_reviews (
  id BIGSERIAL PRIMARY KEY,
  school_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars JSONB NOT NULL,
  comment_text TEXT NOT NULL CHECK (char_length(comment_text) BETWEEN 5 AND 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT stars_has_overall CHECK (
    stars ? 'overall' AND (stars->>'overall')::int BETWEEN 1 AND 5
  )
);

CREATE INDEX school_reviews_school_id_idx ON public.school_reviews(school_id);
CREATE INDEX school_reviews_user_id_idx ON public.school_reviews(user_id);

ALTER TABLE public.school_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.school_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert" ON public.school_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_delete" ON public.school_reviews FOR DELETE USING (auth.uid() = user_id);

-- 3. listings (v4: 3-way type + photo_urls)
CREATE TABLE public.listings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('secondhand','rental_offer','rental_seek')),
  region TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 100),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 5 AND 2000),
  price TEXT,
  contact_info TEXT NOT NULL,
  photo_urls TEXT[] NOT NULL DEFAULT '{}'
    CHECK (array_length(photo_urls,1) IS NULL OR array_length(photo_urls,1) <= 6),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX listings_type_idx ON public.listings(type);
CREATE INDEX listings_created_at_idx ON public.listings(created_at DESC);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_public_read" ON public.listings FOR SELECT USING (expires_at > NOW());
CREATE POLICY "listings_auth_insert" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings_own_update" ON public.listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "listings_own_delete" ON public.listings FOR DELETE USING (auth.uid() = user_id);

-- 4. Storage bucket + RLS (照片上傳)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listings','listings', true, 4194304,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "listings_photo_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "listings_photo_own_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "listings_photo_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'listings');

-- ==========================================
-- Phase J-2 · user_submissions 表
-- 使用者主動提交的建議、新學校、新推薦、通用回饋
-- Lily 於 Supabase Dashboard 手動審核（無 client-side admin UI）
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submission_type TEXT NOT NULL
    CHECK (submission_type IN (
      'school_edit',
      'new_school',
      'new_recommendation',
      'general_feedback'
    )),
  target_id TEXT,
  title TEXT NOT NULL CHECK (char_length(title) >= 2 AND char_length(title) <= 100),
  content TEXT NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_note TEXT
);

CREATE INDEX IF NOT EXISTS user_submissions_created_at_idx
  ON public.user_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS user_submissions_status_type_idx
  ON public.user_submissions (status, submission_type);

ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_submissions_anon_insert" ON public.user_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_submissions_public_read_visible" ON public.user_submissions
  FOR SELECT USING (status IN ('pending', 'approved'));

CREATE POLICY "user_submissions_author_delete_pending" ON public.user_submissions
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- ==========================================
-- Phase J-3 · user_submissions default status 改為 approved
-- 使用者提交即時顯示 · 保留 status 欄位（未來恢復審核可）
-- ==========================================

ALTER TABLE public.user_submissions
  ALTER COLUMN status SET DEFAULT 'approved';

-- 現有 pending 提交批次更新為 approved（讓現有測試提交也顯示）
-- 若您想手動決定既有 pending 的處置、註解掉此行
UPDATE public.user_submissions
  SET status = 'approved'
  WHERE status = 'pending';

-- ==========================================
-- Phase J-3 · listings type 擴展 · 加 discussion 子類
-- ==========================================

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_type_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_type_check
  CHECK (type IN (
    'secondhand',
    'rental_offer',
    'rental_seek',
    'discussion',
    'discussion_study',
    'discussion_longterm'
  ));

-- ==========================================
-- Phase K-1 · user_submissions 加 target_url（optional 外部連結）
-- ==========================================

ALTER TABLE public.user_submissions ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE public.user_submissions ADD CONSTRAINT user_submissions_target_url_check
  CHECK (target_url IS NULL OR (char_length(target_url) <= 500 AND target_url LIKE 'http%'));

-- ==========================================
-- Phase K-1 · profiles 擴展
-- + registration_seq · auto-increment 註冊序號
-- + badges · JSONB 徽章清單（Phase K-2 用）
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS profiles_registration_seq_seq;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_seq BIGINT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

UPDATE public.profiles
  SET registration_seq = nextval('profiles_registration_seq_seq')
  WHERE registration_seq IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN registration_seq SET DEFAULT nextval('profiles_registration_seq_seq');

-- ==========================================
-- Phase K-1 · avatars Storage bucket
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- 只有本人可上傳/修改自己資料夾內的頭像
DROP POLICY IF EXISTS "avatars_user_owned_write" ON storage.objects;
CREATE POLICY "avatars_user_owned_write" ON storage.objects
  FOR ALL
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 公開讀（任何人都能看頭像）
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- ==========================================
-- Phase J-4 · user_submissions 加 target_category
-- 使用者提交推薦時 · 選擇要展示在哪個 recommendation subcategory
-- NULL 表示無指定分類（各版面通用）
-- ==========================================

ALTER TABLE public.user_submissions ADD COLUMN IF NOT EXISTS target_category TEXT;
ALTER TABLE public.user_submissions ADD CONSTRAINT user_submissions_target_category_check
  CHECK (target_category IS NULL OR target_category IN (
    'general', 'visa', 'arrival', 'edu', 'scholarship', 'taiwan'
  ));

-- ==========================================
-- Phase M · user_follows 表
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_follows (
  id BIGSERIAL PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON public.user_follows (follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_idx ON public.user_follows (following_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- 任何登入者可以 follow（不可 follow 自己，CHECK 已擋）
DROP POLICY IF EXISTS "user_follows_auth_insert" ON public.user_follows;
CREATE POLICY "user_follows_auth_insert" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 公開可讀（顯示追蹤數等）
DROP POLICY IF EXISTS "user_follows_public_read" ON public.user_follows;
CREATE POLICY "user_follows_public_read" ON public.user_follows
  FOR SELECT USING (true);

-- 本人可取消追蹤
DROP POLICY IF EXISTS "user_follows_own_delete" ON public.user_follows;
CREATE POLICY "user_follows_own_delete" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ==========================================
-- Phase M · reports 表
-- ==========================================

CREATE TABLE IF NOT EXISTS public.reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'review', 'submission')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'misinformation', 'harassment', 'other')),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_target_idx ON public.reports (target_type, target_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 任何人（含匿名）可檢舉
DROP POLICY IF EXISTS "reports_anon_insert" ON public.reports;
CREATE POLICY "reports_anon_insert" ON public.reports
  FOR INSERT WITH CHECK (true);

-- 不開放公開讀（只有 Lily 於 Dashboard 用 service role 或直接登入 Supabase 看）
-- 不建立 SELECT policy = 預設任何人都不能讀（RLS 預設封閉）

-- ==========================================
-- Phase O · profiles 加 deletion_requested_at
-- 軟刪除 7 天寬限期機制
-- ==========================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

-- ==========================================
-- Phase Q · listing_likes 表（1/2）
-- ==========================================

CREATE TABLE IF NOT EXISTS public.listing_likes (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS listing_likes_listing_idx ON public.listing_likes (listing_id);
CREATE INDEX IF NOT EXISTS listing_likes_user_idx ON public.listing_likes (user_id);

ALTER TABLE public.listing_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_likes_auth_insert" ON public.listing_likes;
CREATE POLICY "listing_likes_auth_insert" ON public.listing_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "listing_likes_public_read" ON public.listing_likes;
CREATE POLICY "listing_likes_public_read" ON public.listing_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "listing_likes_own_delete" ON public.listing_likes;
CREATE POLICY "listing_likes_own_delete" ON public.listing_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- Phase Q · listing_comments 表（2/2）
-- ==========================================

CREATE TABLE IF NOT EXISTS public.listing_comments (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_comments_listing_idx ON public.listing_comments (listing_id, created_at);

ALTER TABLE public.listing_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_comments_auth_insert" ON public.listing_comments;
CREATE POLICY "listing_comments_auth_insert" ON public.listing_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "listing_comments_public_read" ON public.listing_comments;
CREATE POLICY "listing_comments_public_read" ON public.listing_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "listing_comments_own_delete" ON public.listing_comments;
CREATE POLICY "listing_comments_own_delete" ON public.listing_comments
  FOR DELETE USING (auth.uid() = user_id);
