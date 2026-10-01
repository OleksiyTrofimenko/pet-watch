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
  textClassName: string;
  borderClassName: string;
};

/**
 * `Record<CareTaskType, …>` is exhaustive: adding a task type to the shared enum
 * fails the build here until it gets a label, icon and colour. Colour is never the only signal.
 * Colours from TaskForm.dc.html / TypeTag.
 */
export const TASK_TYPE_VISUALS: Record<CareTaskType, TaskTypeVisual> = {
  FEEDING: {
    label: 'Feeding',
    icon: Utensils,
    badgeClassName: 'bg-warning-100',
    textClassName: 'text-warning-700',
    borderClassName: 'border-warning-700',
  },
  WALK: {
    label: 'Walk',
    icon: Footprints,
    badgeClassName: 'bg-success-100',
    textClassName: 'text-success-700',
    borderClassName: 'border-success-700',
  },
  MEDICATION: {
    label: 'Medication',
    icon: Pill,
    badgeClassName: 'bg-info-100',
    textClassName: 'text-info-700',
    borderClassName: 'border-info-700',
  },
  PLAY: {
    label: 'Play',
    icon: Bone,
    badgeClassName: 'bg-primary-100',
    textClassName: 'text-primary-700',
    borderClassName: 'border-primary-700',
  },
  GROOMING: {
    label: 'Grooming',
    icon: Scissors,
    badgeClassName: 'bg-tertiary-100',
    textClassName: 'text-tertiary-700',
    borderClassName: 'border-tertiary-700',
  },
  OTHER: {
    label: 'Other',
    icon: Ellipsis,
    badgeClassName: 'bg-secondary-100',
    textClassName: 'text-secondary-700',
    borderClassName: 'border-secondary-700',
  },
};
