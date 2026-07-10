import { Link } from 'react-router-dom';
import type { School } from '../lib/types';
import { CityIllustration } from '../assets/cities';

interface Props {
  schools: School[];
}

export default function SchoolList({ schools }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {schools.map((s) => (
        <Link key={s.id} to={`/schools/${s.id}`} className="card-interactive block no-underline">
          <div className="w-full h-24 mb-3 text-brand-burgundy overflow-hidden rounded-lg
                          bg-surface-hover flex items-center justify-center">
            <CityIllustration cityKey={s.city_key} className="w-full h-full opacity-70" />
          </div>
          <div className="text-sm text-content-muted mb-1">{s.city}</div>
          <div className="font-semibold text-content-primary">{s.name_zh}</div>
          <div className="text-xs text-content-secondary mt-0.5">{s.name_de}</div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-brand-gold">{s.level}</span>
            <span className="text-content-muted">查看評價 →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
