import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EduTopicIcon } from '../assets/icons/edu';
import { visaWorkflow } from '../data/edu/visa';
import { arrivalWorkflow } from '../data/edu/arrival';
import { renewalWorkflow } from '../data/edu/renewal';
import { applicationWorkflow } from '../data/edu/application';
import { scholarshipWorkflow } from '../data/edu/scholarship';
import { policyWorkflow } from '../data/edu/policy';
import { exitWorkflow } from '../data/edu/exit';
import type { WorkflowTopic } from '../data/edu/workflow';
import WorkflowTimeline from '../components/edu/WorkflowTimeline';
import WorkflowCard from '../components/edu/WorkflowCard';
import { useWorkflowProgressContext } from '../lib/WorkflowProgressContext';
import { getStepStatus } from '../lib/workflowProgress';

const TOPIC_MAP: Record<string, WorkflowTopic> = {
  visa: visaWorkflow,
  arrival: arrivalWorkflow,
  renewal: renewalWorkflow,
  application: applicationWorkflow,
  scholarship: scholarshipWorkflow,
  policy: policyWorkflow,
  exit: exitWorkflow,
};

const OTHER_TOPICS = [
  { slug: 'visa', title: '簽證' },
  { slug: 'arrival', title: '落地' },
  { slug: 'renewal', title: '延簽' },
  { slug: 'application', title: '學程' },
  { slug: 'scholarship', title: '獎學金' },
  { slug: 'policy', title: '政策' },
  { slug: 'exit', title: '離開指南' },
];

/**
 * DS v4.2 · EduTopic
 * §六 資訊架構：Hero → 流程總覽 → Workflow Cards → 常見錯誤 → 官方資源
 * 「常見錯誤」與「官方資源」已內建於每張 Card 的 Accordion，避免重複。
 */
export default function EduTopic() {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? TOPIC_MAP[slug] : null;
  const [currentStep, setCurrentStep] = useState<number | undefined>(undefined);
  const { progress, toggleStep, clearStep } = useWorkflowProgressContext();

  useEffect(() => {
    setCurrentStep(undefined);
  }, [slug]);

  if (!topic) {
    return (
      <div className="py-16 text-center text-content-secondary">
        找不到這個主題。
        <Link to="/edu" className="ml-2">回作戰手冊</Link>
      </div>
    );
  }

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    const el = document.getElementById(`step-${step}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link to="/edu" className="text-xs no-underline">
          ← 回作戰手冊
        </Link>
      </div>

      {/* Hero */}
      <header className="flex items-start gap-4">
        <div className="text-module-edu w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <EduTopicIcon slug={topic.slug} className="w-full h-full" />
        </div>
        <div>
          <div className="text-xs text-content-muted uppercase tracking-wider mb-1">
            {topic.subtitle}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-content-primary">
            {topic.title}
          </h1>
          <p className="text-sm text-content-secondary mt-2 max-w-2xl leading-relaxed">
            {topic.description}
          </p>
        </div>
      </header>

      {/* 流程總覽 */}
      <section aria-label="流程總覽">
        <div className="text-xs text-content-muted uppercase tracking-wider mb-3">
          流程總覽
        </div>
        <WorkflowTimeline
          steps={topic.steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </section>

      {/* Workflow Cards */}
      <section className="space-y-4">
        {topic.steps.map((s) => (
          <WorkflowCard
            key={s.step}
            step={s}
            status={getStepStatus(progress, topic.slug, s.step)}
            onMarkCompleted={() => toggleStep(topic.slug, s.step, 'completed')}
            onMarkSkipped={() => toggleStep(topic.slug, s.step, 'skipped')}
            onClear={() => clearStep(topic.slug, s.step)}
          />
        ))}
      </section>

      {/* General notes */}
      {topic.general_notes && topic.general_notes.length > 0 && (
        <section className="card bg-surface-section border-border-subtle">
          <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">
            說明
          </div>
          <ul className="space-y-1.5 text-sm text-content-secondary">
            {topic.general_notes.map((n, i) => (
              <li key={i} className="pl-4 border-l-2 border-brand-gold/50">
                {n}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 跨主題導航 */}
      <section className="pt-4 border-t border-border-subtle">
        <div className="text-xs text-content-muted mb-3">其他主題</div>
        <div className="flex flex-wrap gap-2">
          {OTHER_TOPICS.filter((t) => t.slug !== slug).map((t) => (
            <Link
              key={t.slug}
              to={`/edu/${t.slug}`}
              className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle
                         hover:border-brand-gold hover:text-brand-burgundy
                         no-underline transition-colors"
            >
              {t.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
