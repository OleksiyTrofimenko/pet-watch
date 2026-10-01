import type { ReactNode } from 'react';
import { PawPrint, type LucideIcon } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type BadgeTone = 'primary' | 'error';

const BADGE: Record<BadgeTone, { circle: string; icon: string }> = {
  primary: { circle: 'bg-primary-100', icon: 'text-primary-700' },
  error: { circle: 'bg-error-100', icon: 'text-error-700' },
};

type AuthLayoutProps = {
  title: string;
  lead?: ReactNode;
  /** Large round icon above the title (forgot → sent, reset → link expired). */
  badge?: { icon: LucideIcon; tone: BadgeTone };
  showBrand?: boolean;
  children: ReactNode;
  /** Secondary action pinned to the bottom, e.g. "New to PetWatch? Create an account". */
  footer?: ReactNode;
  testID?: string;
};

/** Account-access layout (ScreensAuth.dc.html): brand → heading + lead → content → footer. */
export function AuthLayout({
  title,
  lead,
  badge,
  showBrand = true,
  children,
  footer,
  testID,
}: AuthLayoutProps) {
  return (
    <VStack className="flex-1 gap-6 px-2 pt-4" testID={testID}>
      {showBrand ? (
        <HStack className="items-center gap-2.5">
          <Box className="h-10 w-10 items-center justify-center rounded bg-primary-100">
            <Icon as={PawPrint} className="h-[22px] w-[22px] text-primary-600" />
          </Box>
          <Text className="font-heading text-[22px] font-semibold text-typography-900">
            PetWatch
          </Text>
        </HStack>
      ) : null}
      {badge ? (
        <Box
          className={`h-16 w-16 items-center justify-center rounded-full ${BADGE[badge.tone].circle}`}
        >
          <Icon as={badge.icon} className={`h-7 w-7 ${BADGE[badge.tone].icon}`} />
        </Box>
      ) : null}
      <VStack className="gap-2">
        <Heading className="text-[32px] font-semibold leading-[38px]">{title}</Heading>
        {lead ? <Text className="text-base leading-6 text-typography-700">{lead}</Text> : null}
      </VStack>
      {children}
      {footer ? <Box className="mt-auto">{footer}</Box> : null}
    </VStack>
  );
}
