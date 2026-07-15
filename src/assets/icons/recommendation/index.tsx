import {
  IconCoin,
  IconTrain,
  IconDeviceMobile,
  IconHome2,
  IconSearch,
  IconMedal,
  IconReceipt,
  IconApps,
  type Icon as TablerIcon,
} from '@tabler/icons-react';

/** Phase AQ：分類重組為 8 新分類（PAT-145），圖示比照 Tabler Icons 家族（PAT-122） */
const REGISTRY: Record<string, TablerIcon> = {
  finance: IconCoin,
  transport: IconTrain,
  telecom: IconDeviceMobile,
  housing: IconHome2,
  lookup: IconSearch,
  scholarship: IconMedal,
  expense: IconReceipt,
  general: IconApps,
};

export function RecommendationCategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = REGISTRY[slug];
  if (!Icon) return null;
  return <Icon className={className} stroke={1.5} />;
}
