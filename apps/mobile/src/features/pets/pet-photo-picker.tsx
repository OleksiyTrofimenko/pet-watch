import type { Species } from '@petwatch/shared';
import { PhotoField } from './components/photo-field';
import { PhotoPermissionDialog } from './components/photo-permission-dialog';
import type { PetPhotoState } from './use-pet-photo';

type PetPhotoPickerProps = {
  /** From `usePetPhoto`: the screen keeps it, because Save waits for the upload. */
  photo: PetPhotoState;
  name: string;
  species: Species;
  /** The saved photo, shown until a new one is picked. */
  savedUri?: string | null;
};

/** The pet form's photo: field, take/choose/remove, upload progress and the permission dialog. */
export function PetPhotoPicker({ photo, name, species, savedUri = null }: PetPhotoPickerProps) {
  return (
    <>
      <PhotoField
        name={name}
        species={species}
        uri={photo.localUri ?? savedUri}
        progress={photo.upload.status === 'uploading' ? photo.upload.progress : null}
        hasError={photo.upload.status === 'error'}
        onTakePhoto={() => void photo.choose('camera')}
        onChooseFromLibrary={() => void photo.choose('library')}
        onRemove={() => void photo.remove()}
      />
      <PhotoPermissionDialog
        source={photo.deniedSource}
        onOpenSettings={photo.openSettings}
        onCancel={photo.dismissDenied}
      />
    </>
  );
}
