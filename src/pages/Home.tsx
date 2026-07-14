import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IconBuildingArch,
  IconSpeakerphone,
  IconNotebook,
  IconStar,
  IconMessageQuestion,
  IconUserCircle,
  IconBell,
} from '@tabler/icons-react';
import HeroSection from '../components/HeroSection';
import Announcements from '../components/Announcements';
import HotSchoolsCarousel from '../components/HotSchoolsCarousel';
import OnboardingModal from '../components/OnboardingModal';
import { isOnboardingCompleted, getLocalPersonaStage } from '../lib/onboarding';
import { getNextStepSuggestion } from '../lib/nextStep';
import { useWorkflowProgress } from '../lib/useWorkflowProgress';
import { getNextPendingStep } from '../lib/workflowProgress';
import { visaWorkflow } from '../data/edu/visa';
import { arrivalWorkflow } from '../data/edu/arrival';
import { renewalWorkflow } from '../data/edu/renewal';
import { applicationWorkflow } from '../data/edu/application';
import { scholarshipWorkflow } from '../data/edu/scholarship';
import { policyWorkflow } from '../data/edu/policy';
import { exitWorkflow } from '../data/edu/exit';
import type { WorkflowTopic } from '../data/edu/workflow';

const EDU_TOPICS_MAP: Record<string, WorkflowTopic> = {
  visa: visaWorkflow,
  arrival: arrivalWorkflow,
  renewal: renewalWorkflow,
  application: applicationWorkflow,
  scholarship: scholarshipWorkflow,
  policy: policyWorkflow,
  exit: exitWorkflow,
};

/**
 * Phase AB：Portal 卡片圖示不再各自套用 module-* 識別色（Phase Y 的做法），
 * 統一固定為 text-brand-burgundy，脫離 module-edu/module-recommendation 等
 * 只該用於各自頁面內部語境的變數（PAT-119）。
 */
const PORTAL_ITEMS = [
  {
    to: '/schools', title: '語言學校', description: '查看語校資料、學生評價、學費資訊',
    Icon: IconBuildingArch,
  },
  {
    to: '/board', title: '生活佈告欄', description: '出租、求租、二手交易',
    Icon: IconSpeakerphone,
  },
  {
    to: '/edu', title: '作戰手冊', description: '簽證、落地、延簽、獎學金、政策',
    Icon: IconNotebook,
  },
  {
    to: '/recommendation', title: '推薦', description: '德國好物、方案、優惠',
    Icon: IconStar,
  },
  {
    to: '/faq', title: '常見問答', description: '簽證、健保、限制提領帳戶、生活疑問',
    Icon: IconMessageQuestion,
  },
  {
    to: '/board?view=mine&sub=posts', title: '我的資料', description: '管理自己的評價與貼文',
    Icon: IconUserCircle,
  },
];

/**
 * DS v4.1 Portal 首頁（B.1 Hero + B.2 Morandi 整合 · Phase G 擴為 6 卡）
 * Phase Y：Portal 卡片改用與 Edu Hub 一致的大圖示置中佈局（PAT-116）
 * Phase AB：Portal 圖示色彩統一為 brand-burgundy，不再各卡各自套用 module-* 識別色（PAT-119）
 * Phase AC：Portal 圖示造型統一為色塊為主、線條為輔（PAT-121，已於 Phase AH 淘汰）
 * Phase AF：卡片密度優化，響應式雙態佈局（手機橫向列表 / 桌面縮小版 grid），
 *   與 Recommendation.tsx、Edu.tsx 共用同一套 class 組合邏輯（PAT-126）
 * Phase AG：圖示與標題文字放大，消除卡片內部多餘留白（PAT-126 v2）
 * Phase AH：6 個手繪 SVG 圖示全數改用 Tabler Icons（`@tabler/icons-react`），
 *   直接以元件參照存於 PORTAL_ITEMS（PAT-122 終局版；舊有分流檔案已於
 *   Phase AN 健檢確認零引用後刪除，見 PAT-135）
 * Phase AI：新增新手導覽 Modal（精簡版，僅階段選擇+收尾），首次造訪時自動彈出
 *   （PAT-127）
 * Phase AN：Hero 下方新增「下一步提示」卡片，僅當使用者已設定 persona_stage
 *   時顯示，導向作戰手冊對應主題的 Step 1（v9 精簡延伸，PAT-134）
 * Phase AO：「下一步提示」整合進度追蹤，依 workflow_progress 自動推進到下一個
 *   未完成/未跳過的 step（不再永遠停在 step 1），該階段全部完成時改顯示
 *   完成訊息（PAT-136）
 * 結構：Hero 天際線 → 下一步提示（條件式）→ Portal (6 卡) → 熱門語校 → 最新公告
 */
export default function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const localStage = getLocalPersonaStage();
  const { progress } = useWorkflowProgress();

  let nudge: { moduleSlug: string; moduleName: string; stepNumber: number; stepTitle: string } | null = null;
  let allStepsDone = false;
  if (localStage) {
    const suggestion = getNextStepSuggestion(localStage);
    const topic = EDU_TOPICS_MAP[suggestion.moduleSlug];
    const nextPending = getNextPendingStep(progress, suggestion.moduleSlug, topic.steps.length);
    if (nextPending === null) {
      allStepsDone = true;
    } else {
      const stepData = topic.steps.find((s) => s.step === nextPending);
      nudge = {
        moduleSlug: suggestion.moduleSlug,
        moduleName: suggestion.moduleName,
        stepNumber: nextPending,
        stepTitle: stepData?.title_zh ?? suggestion.stepTitle,
      };
    }
  }

  useEffect(() => {
    if (!isOnboardingCompleted()) {
      setOnboardingOpen(true);
    }
  }, []);

  return (
    <div className="space-y-20 sm:space-y-24">
      <HeroSection />

      {allStepsDone && (
        <div className="card bg-brand-gold-soft border-brand-gold/30">
          <div className="text-sm font-medium text-content-primary">
            🎉 這個階段的推薦步驟都完成了！
          </div>
          <div className="text-xs text-content-muted mt-1">
            可於「我的資料」重新設定階段，查看其他主題的推薦步驟
          </div>
        </div>
      )}

      {nudge && (
        <Link
          to={`/edu/${nudge.moduleSlug}`}
          className="block card bg-brand-gold-soft border-brand-gold/30
                     hover:border-brand-gold transition-colors no-underline"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-content-muted mb-1">為你推薦的下一步</div>
              <div className="text-sm font-medium text-content-primary">
                {nudge.moduleName} · Step {nudge.stepNumber}：{nudge.stepTitle}
              </div>
            </div>
            <span className="text-brand-burgundy text-sm shrink-0">前往 →</span>
          </div>
        </Link>
      )}

      {/* Portal */}
      <section>
        <div className="text-xs text-content-muted mb-4 uppercase tracking-wider">Portal</div>
        <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
          {PORTAL_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle
                         bg-surface-card hover:border-border-strong transition-all duration-150
                         no-underline
                         sm:flex-col sm:items-center sm:justify-center sm:text-center sm:gap-0
                         sm:p-3 sm:aspect-[3/2] sm:rounded-card sm:hover:-translate-y-0.5"
            >
              <div className="text-brand-burgundy w-12 h-12 shrink-0 flex items-center justify-center
                              sm:w-16 sm:h-16 lg:w-20 lg:h-20 sm:mb-2">
                <item.Icon className="w-full h-full" stroke={1.5} />
              </div>

              <div className="flex-1 min-w-0 sm:flex-none sm:w-full">
                <div className="text-sm font-semibold text-content-primary truncate
                                sm:text-base sm:whitespace-normal">
                  {item.title}
                </div>
                <div className="text-xs text-content-muted truncate sm:hidden">
                  {item.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Schools */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-medium">熱門語校</h2>
          <Link to="/schools" className="text-xs no-underline">
            全部語校 →
          </Link>
        </div>
        <HotSchoolsCarousel />
      </section>

      {/* Announcements */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-medium">最新公告</h2>
          <div className="flex items-center gap-2 text-content-muted">
            <IconBell className="w-4 h-4" />
            <span className="text-xs">最近 5 則</span>
          </div>
        </div>
        <Announcements />
      </section>

      <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </div>
  );
}
