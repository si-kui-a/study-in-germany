import type { FC } from 'react';
import Berlin from './Berlin';
import Frankfurt from './Frankfurt';
import Munich from './Munich';
import Duesseldorf from './Duesseldorf';
import Koeln from './Koeln';
import Stuttgart from './Stuttgart';
import Dresden from './Dresden';
import Heidelberg from './Heidelberg';
import Aachen from './Aachen';
import Hamburg from './Hamburg';
import Bremen from './Bremen';
import Nuernberg from './Nuernberg';
import Mannheim from './Mannheim';
import Essen from './Essen';
import Freiburg from './Freiburg';
import Bonn from './Bonn';
import Leipzig from './Leipzig';
import Hannover from './Hannover';
import Duisburg from './Duisburg';
import Dortmund from './Dortmund';
import Karlsruhe from './Karlsruhe';
import Regensburg from './Regensburg';
import Konstanz from './Konstanz';
import Fallback from './Fallback';

const REGISTRY: Record<string, FC<{ className?: string }>> = {
  berlin: Berlin,
  frankfurt: Frankfurt,
  munich: Munich,
  duesseldorf: Duesseldorf,
  koeln: Koeln,
  stuttgart: Stuttgart,
  dresden: Dresden,
  heidelberg: Heidelberg,
  aachen: Aachen,
  hamburg: Hamburg,
  bremen: Bremen,
  nuernberg: Nuernberg,
  mannheim: Mannheim,
  essen: Essen,
  freiburg: Freiburg,
  bonn: Bonn,
  leipzig: Leipzig,
  hannover: Hannover,
  duisburg: Duisburg,
  dortmund: Dortmund,
  karlsruhe: Karlsruhe,
  regensburg: Regensburg,
  konstanz: Konstanz,
};

export function CityIllustration({ cityKey, className }: { cityKey?: string; className?: string }) {
  const C = (cityKey && REGISTRY[cityKey]) || Fallback;
  return <C className={className} />;
}

export const KNOWN_CITY_KEYS = Object.keys(REGISTRY);
