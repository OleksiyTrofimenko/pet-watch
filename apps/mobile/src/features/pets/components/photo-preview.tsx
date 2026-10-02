import { Camera } from 'lucide-react-native';
import type { Species } from '@petwatch/shared';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { PetPhoto } from './pet-photo';
import { UploadOverlay } from './upload-overlay';

type PhotoPreviewProps = {
  uri: string;
  species: Species;
  name: string;
  /** 0–1 while uploading, else null. */
  progress: number | null;
};

/** The picked or saved photo: upload progress on top, or a camera badge that hints "tap to change". */
export function PhotoPreview({ uri, species, name, progress }: PhotoPreviewProps) {
  return (
    <Box className="relative">
      <PetPhoto uri={uri} species={species} name={name} size="large" />
      {progress !== null ? (
        <UploadOverlay progress={progress} />
      ) : (
        <Box className="absolute -bottom-1.5 -right-1.5 h-10 w-10 items-center justify-center rounded-full border border-outline-100 bg-background-0">
          <Icon as={Camera} className="h-5 w-5 text-typography-900" />
        </Box>
      )}
    </Box>
  );
}
