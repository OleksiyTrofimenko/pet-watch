import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

/** `count` rows the height of RuleRow / WatcherRow / TaskRow, so content doesn't jump in. */
export function RowSkeleton({ count = 2, label }: { count?: number; label: string }) {
  return (
    <VStack className="gap-2" accessibilityLabel={label}>
      {Array.from({ length: count }, (_, key) => (
        <HStack
          key={key}
          className="min-h-[72px] items-center gap-3 rounded-lg border border-outline-100 p-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <VStack className="flex-1 gap-2">
            <SkeletonText className="h-4 w-2/3" />
            <SkeletonText className="h-3 w-1/3" />
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
}
