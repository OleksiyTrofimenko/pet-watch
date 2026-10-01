import type { ReactNode } from 'react';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type DaySectionProps = {
  title: string;
  count: string;
  isToday: boolean;
  isEmpty: boolean;
  children: ReactNode;
};

/**
 * One day of the week view. Today = tinted + outlined + "Today" pill (three cues). Empty days
 * keep their header so the week reads Mon–Sun without gaps.
 */
export function DaySection({ title, count, isToday, isEmpty, children }: DaySectionProps) {
  return (
    <VStack
      className={`gap-2 ${isToday ? 'rounded-lg border border-primary-200 bg-primary-50 p-2' : ''}`}
      testID={`day.${title}`}
    >
      <HStack className="items-center justify-between px-1">
        <HStack className="items-center gap-2">
          <Text className="text-base font-bold text-typography-900">{title}</Text>
          {isToday ? (
            <Text className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-typography-0">
              Today
            </Text>
          ) : null}
        </HStack>
        <Text className="text-sm text-typography-700">{count}</Text>
      </HStack>
      {isEmpty ? (
        <Text className="rounded-lg border border-dashed border-outline-200 p-3 text-center text-typography-600">
          Nothing scheduled
        </Text>
      ) : (
        children
      )}
    </VStack>
  );
}
