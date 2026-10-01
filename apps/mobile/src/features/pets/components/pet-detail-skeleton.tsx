import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import { RowSkeleton } from '@/src/design-system';

/** Shaped like PetDetails + Care routine: large photo, name, summary, then rule rows. */
export function PetDetailSkeleton() {
  return (
    <VStack className="gap-6" accessibilityLabel="Loading pet">
      <HStack className="items-center gap-4">
        <Skeleton className="h-32 w-32 rounded-lg" />
        <VStack className="flex-1 gap-2">
          <SkeletonText className="h-7 w-2/3" />
          <SkeletonText className="h-4 w-full" />
          <SkeletonText className="h-4 w-1/2" />
        </VStack>
      </HStack>
      <RowSkeleton count={3} label="Loading care routine" />
    </VStack>
  );
}
