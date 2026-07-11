export type SubmissionType =
  | 'school_edit'
  | 'new_school'
  | 'new_recommendation'
  | 'general_feedback';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'archived';

export interface UserSubmission {
  id: number;
  user_id: string | null;
  submission_type: SubmissionType;
  target_id: string | null;
  target_url: string | null;
  title: string;
  content: string;
  status: SubmissionStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewer_note: string | null;
}

/**
 * 使用者提交顯示規則：
 * - status IN ('pending', 'approved') 皆顯示（避免藏起使用者剛送出的）
 * - status = 'approved' · 內容已通過審核（雖然 J-3 已將 default 設為 approved）
 * - status = 'pending' · 使用者剛送出、尚未 Lily 過目
 * - status = 'rejected' / 'archived' · UI 隱藏
 */
export function isSubmissionVisible(sub: Pick<UserSubmission, 'status'>): boolean {
  return sub.status === 'pending' || sub.status === 'approved';
}
