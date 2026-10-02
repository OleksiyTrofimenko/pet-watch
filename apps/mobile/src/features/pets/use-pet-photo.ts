import { useState } from 'react';
import { Linking } from 'react-native';
import { uploadFile } from '@/src/lib/upload-file';
import { petsApi } from './api';
import { pickPhoto, type PhotoSource } from './pick-photo';
import { useConfirmPetPhoto, useRemovePetPhoto } from './queries';

type Upload = { status: 'idle' } | { status: 'uploading'; progress: number } | { status: 'error' };

/**
 * pick → resize → presign → PUT to S3 → confirm, so screens stay thin.
 * Existing pet: uploads as soon as a photo is picked. New pet: keeps the local photo until
 * `uploadTo(newPetId)` after the pet is created (keys are scoped to a pet, see D44).
 */
export function usePetPhoto(petId: string | null) {
  const confirm = useConfirmPetPhoto();
  const removeRemote = useRemovePetPhoto(petId ?? '');
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [upload, setUpload] = useState<Upload>({ status: 'idle' });
  const [deniedSource, setDeniedSource] = useState<PhotoSource | null>(null);

  async function uploadTo(targetPetId: string, uri = localUri): Promise<void> {
    if (!uri) return;
    setUpload({ status: 'uploading', progress: 0 });
    try {
      const ticket = await petsApi.photoUploadUrl(targetPetId, { contentType: 'image/jpeg' });
      await uploadFile(ticket.uploadUrl, uri, 'image/jpeg', (progress) =>
        setUpload({ status: 'uploading', progress }),
      );
      await confirm.mutateAsync({ petId: targetPetId, key: ticket.key });
      setUpload({ status: 'idle' });
      setLocalUri(null);
    } catch (error) {
      setUpload({ status: 'error' });
      throw error;
    }
  }

  async function choose(source: PhotoSource): Promise<void> {
    const result = await pickPhoto(source);
    if (result.status === 'denied') return setDeniedSource(result.source);
    if (result.status === 'cancelled') return;
    setLocalUri(result.uri);
    // An upload failure is shown on the photo (status 'error'); nothing else to do here.
    if (petId) await uploadTo(petId, result.uri).catch(() => undefined);
  }

  async function remove(): Promise<void> {
    setLocalUri(null);
    setUpload({ status: 'idle' });
    if (petId) await removeRemote.mutateAsync();
  }

  return {
    /** The picked photo, shown until the confirmed one replaces it. */
    localUri,
    upload,
    isUploading: upload.status === 'uploading',
    choose,
    remove,
    uploadTo,
    /** Camera/library permission was refused: explain and offer Settings. */
    deniedSource,
    dismissDenied: () => setDeniedSource(null),
    openSettings: () => {
      setDeniedSource(null);
      void Linking.openSettings();
    },
  };
}

export type PetPhotoState = ReturnType<typeof usePetPhoto>;
