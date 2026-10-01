import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

/** Rows the height of TaskRow, so nothing jumps when tasks arrive. */
export function ScheduleSkeleton() {
  return (
    <VStack className="gap-2" accessibilityLabel="Loading schedule">
      {[0, 1, 2].map((key) => (
        <HStack key={key} className="min-h-[72px] gap-3 rounded-lg border border-outline-100 p-3">
          <Skeleton className="h-5 w-12 rounded" />
          <VStack className="flex-1 gap-2">
            <SkeletonText className="h-4 w-1/3" />
            <SkeletonText className="h-4 w-2/3" />
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
}
