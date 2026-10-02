import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

type UploadOverlayProps = {
  /** 0–1. */
  progress: number;
};

/** Dims the photo with "Uploading… 42%" and a bar while the PUT to S3 runs. */
export function UploadOverlay({ progress }: UploadOverlayProps) {
  const percent = Math.round(progress * 100);
  return (
    <Box className="absolute inset-0 items-center justify-center gap-2.5 rounded-lg bg-typography-900/60 p-4">
      <Text className="text-sm font-bold text-typography-0">Uploading… {percent}%</Text>
      <Box className="h-1.5 w-full overflow-hidden rounded-full bg-typography-0/30">
        <Box className="h-full rounded-full bg-typography-0" style={{ width: `${percent}%` }} />
      </Box>
    </Box>
  );
}
