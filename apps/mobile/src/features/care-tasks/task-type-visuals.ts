import type { CareTaskType } from '@petwatch/shared';
import {
  Bone,
  Ellipsis,
  Footprints,
  Pill,
  Scissors,
  Utensils,
  type LucideIcon,
} from 'lucide-react-native';

type TaskTypeVisual = {
  label: string;
  icon: LucideIcon;
  /** Full literal class names: Tailwind only generates classes it can find as whole strings. */
  badgeClassName: string;
};

/**
 * `Record<CareTaskType, …>` is exhaustive: adding a task type to the shared enum
 * fails the build here until it gets a label, icon and colour. Colour is never the only signal.
 */
export const TASK_TYPE_VISUALS: Record<CareTaskType, TaskTypeVisual> = {
  FEEDING: { label: 'Feeding', icon: Utensils, badgeClassName: 'bg-warning-100' },
  WALK: { label: 'Walk', icon: Footprints, badgeClassName: 'bg-success-100' },
  MEDICATION: { label: 'Medication', icon: Pill, badgeClassName: 'bg-error-100' },
  PLAY: { label: 'Play', icon: Bone, badgeClassName: 'bg-info-100' },
  GROOMING: { label: 'Grooming', icon: Scissors, badgeClassName: 'bg-tertiary-100' },
  OTHER: { label: 'Other', icon: Ellipsis, badgeClassName: 'bg-background-100' },
};
