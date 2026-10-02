import type { LucideIcon } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';

export type IconCircleTone = 'neutral' | 'primary' | 'error' | 'success' | 'info' | 'warning';
type Size = 'md' | 'lg' | 'xl';

const TONE: Record<IconCircleTone, { circle: string; icon: string }> = {
  neutral: { circle: 'bg-secondary-100', icon: 'text-secondary-700' },
  primary: { circle: 'bg-primary-100', icon: 'text-primary-700' },
  error: { circle: 'bg-error-100', icon: 'text-error-700' },
  success: { circle: 'bg-success-100', icon: 'text-success-700' },
  info: { circle: 'bg-info-100', icon: 'text-info-700' },
  warning: { circle: 'bg-warning-100', icon: 'text-warning-700' },
};

const SIZE: Record<Size, { circle: string; icon: string }> = {
  md: { circle: 'h-14 w-14', icon: 'h-6 w-6' },
  lg: { circle: 'h-16 w-16', icon: 'h-7 w-7' },
  xl: { circle: 'h-20 w-20', icon: 'h-9 w-9' },
};

type IconCircleProps = {
  icon: LucideIcon;
  tone?: IconCircleTone;
  size?: Size;
};

/** An icon in a soft tone circle: empty states, results and confirmations. */
export function IconCircle({ icon, tone = 'neutral', size = 'lg' }: IconCircleProps) {
  return (
    <Box
      className={`items-center justify-center rounded-full ${SIZE[size].circle} ${TONE[tone].circle}`}
    >
      <Icon as={icon} className={`${SIZE[size].icon} ${TONE[tone].icon}`} />
    </Box>
  );
}
