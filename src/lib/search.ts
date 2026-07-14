import schoolsData from '../data/schools.json';
import faqData from '../data/faq.json';
import announcementsData from '../data/announcements.json';
import type { School } from './types';
import type { FaqEntry } from './faq';
import { faqSearchableText, faqPreviewText } from './faq';
import { visaWorkflow } from '../data/edu/visa';
import { arrivalWorkflow } from '../data/edu/arrival';
import { renewalWorkflow } from '../data/edu/renewal';
import { applicationWorkflow } from '../data/edu/application';
import { scholarshipWorkflow } from '../data/edu/scholarship';
import { policyWorkflow } from '../data/edu/policy';
import { exitWorkflow } from '../data/edu/exit';
import type { WorkflowTopic } from '../data/edu/workflow';

const EDU_WORKFLOWS: WorkflowTopic[] = [
  visaWorkflow,
  arrivalWorkflow,
  renewalWorkflow,
  applicationWorkflow,
  scholarshipWorkflow,
  policyWorkflow,
  exitWorkflow,
];

interface Announcement {
  id: string; date: string; title: string; body: string;
}

export type SearchHit =
  | { kind: 'school'; id: string; title: string; subtitle: string; url: string }
  | { kind: 'faq'; id: string; title: string; subtitle: string; url: string }
  | { kind: 'announcement'; id: string; title: string; subtitle: string; url: string }
  | { kind: 'edu'; id: string; title: string; subtitle: string; url: string };

/**
 * 純 client · 純 substring match（後續可換 fuse.js 若需模糊）
 * 全站搜尋範圍：schools + faq + announcements
 * 資料量小（<100 筆）substring 已足夠。
 */
export function searchAll(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const hits: SearchHit[] = [];

  for (const s of schoolsData as School[]) {
    const hay = `${s.name_zh} ${s.name_de} ${s.city} ${s.level}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        kind: 'school',
        id: s.id,
        title: s.name_zh,
        subtitle: `${s.city} · ${s.level}`,
        url: `/schools/${s.id}`,
      });
    }
  }

  for (let i = 0; i < (faqData as FaqEntry[]).length; i++) {
    const f = (faqData as FaqEntry[])[i];
    const hay = `${f.q} ${faqSearchableText(f)}`.toLowerCase();
    if (hay.includes(q)) {
      const preview = faqPreviewText(f);
      hits.push({
        kind: 'faq',
        id: String(i),
        title: f.q,
        subtitle: preview.slice(0, 60) + (preview.length > 60 ? '…' : ''),
        url: `/faq`,
      });
    }
  }

  for (const a of announcementsData as unknown as Announcement[]) {
    const hay = `${a.title} ${a.body}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        kind: 'announcement',
        id: a.id,
        title: a.title,
        subtitle: a.body.slice(0, 60) + (a.body.length > 60 ? '…' : ''),
        url: `/`,
      });
    }
  }

  // Edu · 掃 workflow 資料
  for (const w of EDU_WORKFLOWS) {
    // 主題本身
    if (
      w.title.toLowerCase().includes(q) ||
      w.subtitle.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q)
    ) {
      hits.push({
        kind: 'edu',
        id: w.slug,
        title: `${w.title} · ${w.subtitle}`,
        subtitle: w.description.slice(0, 80) + '…',
        url: `/edu/${w.slug}`,
      });
    }

    // 每個 step
    for (const s of w.steps) {
      const hay = [
        s.title_zh,
        s.title_de ?? '',
        s.meta.location ?? '',
        s.meta.timing ?? '',
        s.outcome.join(' '),
        s.detail.documents.join(' '),
        s.detail.procedure.join(' '),
        s.detail.common_mistakes.join(' '),
      ].join(' ').toLowerCase();

      if (hay.includes(q)) {
        // 抽最先命中所在段落
        const parts = [
          s.title_zh,
          s.outcome.join(' · '),
          s.detail.procedure.join(' · '),
        ].filter(Boolean);
        const snippet = parts.find((p) => p.toLowerCase().includes(q)) ?? parts[0];
        hits.push({
          kind: 'edu',
          id: `${w.slug}-${s.step}`,
          title: `${w.title} STEP ${s.step} · ${s.title_zh}`,
          subtitle: snippet.slice(0, 80) + (snippet.length > 80 ? '…' : ''),
          url: `/edu/${w.slug}#step-${s.step}`,
        });
      }
    }
  }

  return hits.slice(0, 30);
}
