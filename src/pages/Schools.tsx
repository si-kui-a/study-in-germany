import { useMemo, useState } from 'react';
import SchoolList from '../components/SchoolList';
import SubmissionForm from '../components/SubmissionForm';
import UserSubmissionsList from '../components/UserSubmissionsList';
import schoolsData from '../data/schools.json';
import type { School } from '../lib/types';

const schools = schoolsData as School[];

type AccommodationFilter = 'all' | 'yes' | 'no';

export default function Schools() {
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [accommodationFilter, setAccommodationFilter] = useState<AccommodationFilter>('all');

  const availableCities = useMemo(() => {
    const cities = Array.from(new Set(schools.map((s) => s.city)));
    return cities.sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  }, []);

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (cityFilter !== 'all' && s.city !== cityFilter) return false;
      const hasAccommodation = Boolean((s as any).accommodation);
      if (accommodationFilter === 'yes' && !hasAccommodation) return false;
      if (accommodationFilter === 'no' && hasAccommodation) return false;
      return true;
    });
  }, [cityFilter, accommodationFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-content-primary">語言學校</h1>
        <p className="mt-1 text-sm text-content-secondary">
          點進學校可查看學生評價；登入後即可發表自己的評價。
        </p>
      </div>

      {/* Filter bar（PAT-55） */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border border-border-subtle
                     bg-surface-canvas text-content-primary
                     focus:outline-none focus:border-brand-burgundy
                     hover:border-brand-gold transition-colors"
        >
          <option value="all">所有城市</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={accommodationFilter}
          onChange={(e) => setAccommodationFilter(e.target.value as AccommodationFilter)}
          className="text-sm px-3 py-2 rounded-lg border border-border-subtle
                     bg-surface-canvas text-content-primary
                     focus:outline-none focus:border-brand-burgundy
                     hover:border-brand-gold transition-colors"
        >
          <option value="all">住宿：任意</option>
          <option value="yes">提供住宿</option>
          <option value="no">不提供住宿</option>
        </select>

        <span className="text-xs text-content-muted ml-auto">
          共 {filtered.length} 所
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center text-content-muted py-8">
          沒有符合條件的學校，試試調整篩選條件。
        </div>
      ) : (
        <SchoolList schools={filtered} />
      )}

      {/* 提交新學校 · user_submissions form（PAT-67/68/69） */}
      <details className="text-sm">
        <summary className="cursor-pointer inline-flex items-center gap-1.5
                            text-brand-burgundy hover:text-brand-burgundy-hover">
          <span>➕</span>
          <span>提交新語校</span>
        </summary>
        <div className="pt-4 mt-3">
          <SubmissionForm
            submissionType="new_school"
            titlePlaceholder="學校中文名稱"
            contentPlaceholder="學校德文名稱、所在城市、官網、其他資訊"
          />
        </div>
      </details>

      <UserSubmissionsList
        submissionType="new_school"
        title="使用者建議的新學校"
        emptyMessage="還沒有使用者建議 · 你可以第一個提交"
      />
    </div>
  );
}
