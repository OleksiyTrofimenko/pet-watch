import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

/** Shaped like two pet cards, so content doesn't jump when it arrives. */
export function PetListSkeleton() {
  return (
    <VStack className="gap-3" accessibilityLabel="Loading pets">
      {[0, 1].map((key) => (
        <HStack key={key} className="items-center gap-4 rounded-lg border border-outline-100 p-3">
          <Skeleton className="h-[72px] w-[72px] rounded" />
          <VStack className="flex-1 gap-2">
            <SkeletonText className="h-5 w-1/2" />
            <SkeletonText className="h-3 w-3/4" />
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
}
