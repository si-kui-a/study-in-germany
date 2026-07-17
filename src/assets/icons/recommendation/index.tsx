import {
  IconCoin,
  IconTrain,
  IconDeviceMobile,
  IconHome2,
  IconSearch,
  IconMedal,
  IconReceipt,
  IconBuildingBank,
  IconApps,
  IconLanguage,
  IconBriefcase,
  type Icon as TablerIcon,
} from '@tabler/icons-react';

/**
 * Phase AQ：分類重組為 8 新分類（PAT-145），圖示比照 Tabler Icons 家族（PAT-122）
 * Phase AR：新增第 9 分類 immigration（外事局），見 PAT-146
 * Phase BE：新增第 10 分類 german_learning（德文學習），見 PAT-165
 * Phase BG：新增第 11 分類 career（DACH 實習/求職）
 */
const REGISTRY: Record<string, TablerIcon> = {
  finance: IconCoin,
  transport: IconTrain,
  telecom: IconDeviceMobile,
  housing: IconHome2,
  lookup: IconSearch,
  scholarship: IconMedal,
  expense: IconReceipt,
  immigration: IconBuildingBank,
  general: IconApps,
  german_learning: IconLanguage,
  career: IconBriefcase,
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
