import { Link } from 'react-router-dom';
import { EduTopicIcon } from '../assets/icons/edu';
import { visaWorkflow } from '../data/edu/visa';
import { arrivalWorkflow } from '../data/edu/arrival';
import { renewalWorkflow } from '../data/edu/renewal';
import { applicationWorkflow } from '../data/edu/application';
import { scholarshipWorkflow } from '../data/edu/scholarship';
import { policyWorkflow } from '../data/edu/policy';
import { exitWorkflow } from '../data/edu/exit';

const TOPICS = [
  visaWorkflow,
  arrivalWorkflow,
  renewalWorkflow,
  applicationWorkflow,
  scholarshipWorkflow,
  policyWorkflow,
  exitWorkflow,
];

/**
 * DS v4.2 · Edu Hub
 * 從 Article Portal 改為 Workflow Portal。
 * 每卡顯示：Geometry SVG + Title + Subtitle + step 數量 + 進入
 */
export default function Edu() {
  return (
    <div className="space-y-10">
      <section>
        <div className="text-xs text-content-muted uppercase tracking-wider mb-2">
          German Study Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-content-primary">
          德國留學作戰手冊
        </h1>
        <p className="text-sm text-content-secondary mt-3 max-w-2xl leading-relaxed">
          把德國留學所有行政程序拆解成可執行步驟。
          點入任一主題查看 workflow · 每一步告訴你要做什麼、需要什麼、去哪辦、完成後可以往下走哪。
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((t) => (
            <Link
              key={t.slug}
              to={`/edu/${t.slug}`}
              className="card-interactive p-5 no-underline
                         flex flex-col justify-between aspect-[4/3]"
            >
              <div className="text-module-edu w-20 h-20 sm:w-24 sm:h-24
                              mt-auto mb-3 mx-auto flex items-center justify-center">
                <EduTopicIcon slug={t.slug} className="w-full h-full" />
              </div>

              <div className="space-y-1 text-center">
                <div className="text-base font-semibold text-content-primary">
                  {t.title}
                </div>
                <div className="text-xs text-content-muted italic">
                  {t.subtitle}
                </div>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-content-secondary">
                    {t.steps.length} 個步驟
                  </span>
                  <span className="text-brand-burgundy font-medium">進入 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="card bg-brand-gold-soft border-brand-gold/30 max-w-3xl">
        <div className="text-sm font-medium text-content-primary mb-2">
          📝 貢獻你的經驗
        </div>
        <p className="text-sm text-content-secondary leading-relaxed">
          內容以官方公開資料為基礎，仍持續補充中。
          若你走過某段流程有實用細節，請於
          <Link to="/board" className="mx-1">佈告欄</Link>
          留言分享，或直接開 GitHub issue。留言功能將於後續版本上線。
        </p>
      </section>
    </div>
  );
}
