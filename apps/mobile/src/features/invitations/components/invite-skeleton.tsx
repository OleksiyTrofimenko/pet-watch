import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

/** 12-accept/loading: photo circle, two title lines, the details card. */
export function InviteSkeleton() {
  return (
    <VStack className="items-center gap-4 pt-2" accessibilityLabel="Loading invite">
      <Skeleton className="h-36 w-36 rounded-full" />
      <SkeletonText className="mt-2 h-6 w-4/5" />
      <SkeletonText className="h-6 w-3/5" />
      <Skeleton className="mt-2 h-32 w-full rounded-lg" />
    </VStack>
  );
}
