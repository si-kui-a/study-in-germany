import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export default function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="card text-center py-12 space-y-3">
      {icon && (
        <div className="mx-auto w-12 h-12 text-content-muted opacity-70">
          {icon}
        </div>
      )}
      <div className="text-base font-medium text-content-primary">{title}</div>
      {description && (
        <p className="text-sm text-content-secondary max-w-md mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
