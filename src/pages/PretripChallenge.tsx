import { Link } from 'react-router-dom';
import { IconDeviceGamepad2 } from '@tabler/icons-react';
import CardRating from '../components/CardRating';
import { useCardRatingsMap } from '../lib/useCardRatings';

/**
 * Phase CB：行前互動工具子頁面（獨立於 `資源` 現有 11 分類體系之外，
 * 不進 RECOMMENDATION_CATEGORIES／DATA_MAP，不需 target_category CHECK
 * 約束擴充）。版型比照 RecommendationCategory.tsx 的「標題+卡片列表」
 * 慣例，但資料為本檔內建的固定陣列，非讀取 recommendations JSON，
 * 因為這不是使用者可提交/篩選的資源清單，而是治理端手動維護的少量
 * 精選工具入口——目前僅 1 筆，未來若新增更多行前互動工具可直接
 * 擴充此陣列，不需重新設計頁面。
 *
 * 路由識別碼 `pretrip-challenge` 與顯示名稱「行前生存挑戰」分層
 * （比照 PAT-156），沿用站內既有 kebab-case 路由慣例（如
 * `/edu/visa-selector`、`/my-profile`）。
 */
interface PretripTool {
  id: string;
  title: string;
  summary: string;
  points: string[];
  tags: string[];
  url: string;
  updated_at: string;
}

/**
 * Phase CC：卡片格式改比照全站既有 AU.a 三層標準（結論一行＋列點＋標籤＋
 * 更新日期，見 PAT-152，範例見 scholarship.json 的 DAAD 獎學金資料庫）。
 * 付費揭露（完成後有付費電子書購買選項）保留於 points，是本次調整
 * 唯一不能省略的內容，見驗收標準。
 */
const PRETRIP_TOOLS: PretripTool[] = [
  {
    id: 'stayinde-survival-game',
    title: '留德生存牌局',
    summary: '14 天情境模擬，免登入不需個資，可完整玩到結尾',
    points: [
      '免登入、不需個資，完整流程可玩到結尾',
      '完成後有付費電子書購買選項（非強制）',
      '遊戲本身附「不構成法律/簽證/就業/財務建議」免責聲明',
    ],
    tags: ['遊戲', '免費'],
    url: 'https://game.stayinde.de/',
    updated_at: '2026-07',
  },
];

export default function PretripChallenge() {
  const { statsMap, submitRating } = useCardRatingsMap('pretrip_tools');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-xs no-underline">
          ← 回首頁
        </Link>
      </div>

      <header className="flex items-start gap-4">
        <div className="text-brand-burgundy w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <IconDeviceGamepad2 className="w-full h-full" stroke={1.5} />
        </div>
        <div>
          <div className="text-xs text-content-muted uppercase tracking-wider mb-1">
            行前互動工具
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-content-primary">
            行前生存挑戰
          </h1>
          <p className="text-sm text-content-muted mt-2">
            {PRETRIP_TOOLS.length} 項工具
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRETRIP_TOOLS.map((tool) => (
          <div key={tool.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-content-primary leading-snug">
                {tool.title}
              </h3>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-burgundy no-underline hover:text-brand-burgundy-hover shrink-0"
              >
                官網 ↗
              </a>
            </div>

            <p className="text-sm text-content-secondary leading-relaxed">{tool.summary}</p>
            <ul className="space-y-1 pl-4 list-disc text-xs text-content-secondary marker:text-content-muted">
              {tool.points.map((p, i) => (
                <li key={i} className="leading-relaxed">{p}</li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-1 pt-1">
              {tool.tags.map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-content-muted">
                  {tag}
                </span>
              ))}
              <span className="text-xs text-content-muted ml-auto">更新於 {tool.updated_at}</span>
            </div>

            <CardRating
              category="pretrip_tools"
              cardTitle={tool.title}
              cardUrl={tool.url}
              stats={statsMap.get(tool.id)}
              onRate={(r) => submitRating(tool.id, r)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
