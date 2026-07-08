import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <div className="text-6xl font-serif text-brand-burgundy">404</div>
      <div className="text-lg text-content-primary">找不到這個頁面</div>
      <p className="text-sm text-content-secondary max-w-md mx-auto">
        路徑可能已變更或不存在。回首頁重新開始。
      </p>
      <div>
        <Link to="/" className="btn-primary no-underline inline-flex">
          回首頁
        </Link>
      </div>
    </div>
  );
}
