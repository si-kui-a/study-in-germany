/**
 * DS v4.2 · Workflow 資料契約
 * 每個 Edu 主題由多個 WorkflowStep 組成。
 * 型別鎖定：改 interface 需同步改 6 個主題資料檔（type check 會攔截）。
 */

export type Priority = 'required' | 'recommended' | 'supplementary';

export const PRIORITY_LABEL: Record<Priority, string> = {
  required: '必做',
  recommended: '建議',
  supplementary: '補充',
};

/** DS v4.2 §十一 · 優先級 badge tokens */
export const PRIORITY_STYLE: Record<Priority, { bg: string; fg: string }> = {
  required: {
    bg: 'bg-brand-burgundy-surface',
    fg: 'text-brand-burgundy',
  },
  recommended: {
    bg: 'bg-brand-gold-soft',
    fg: 'text-brand-gold',
  },
  supplementary: {
    bg: 'bg-surface-hover',
    fg: 'text-content-muted',
  },
};

export interface OfficialSource {
  name: string;
  url: string;
}

/** 單行陳述句，或「主項 + 子項」分組（子項以 disc list 呈現）。 */
export type ProcedureItem = string | {
  text: string;
  items: string[];
};

export interface WorkflowStepDetail {
  documents: string[];
  procedure: ProcedureItem[];
  common_mistakes: string[];
  official_sources: OfficialSource[];
}

export interface WorkflowStepMeta {
  location?: string;
  timing?: string;
  docs_count?: number;
  priority: Priority;
}

export interface WorkflowStep {
  step: number;
  title_zh: string;
  title_de?: string;
  meta: WorkflowStepMeta;
  outcome: string[];
  detail: WorkflowStepDetail;
  /** DS v4.2 資料來源與更新日期（Phase F 加入） */
  references?: string[];
  updated_at?: string; // ISO format 'YYYY-MM' or 'YYYY-MM-DD'
}

export interface WorkflowTopic {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  steps: WorkflowStep[];
  general_notes?: string[];
}
