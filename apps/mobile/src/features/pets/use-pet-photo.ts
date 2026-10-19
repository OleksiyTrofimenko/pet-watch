import { useState } from 'react';
import { Linking } from 'react-native';
import { errorMessage } from '@/src/lib/form-errors';
import { uploadFile } from '@/src/lib/upload-file';
import { petsApi } from './api';
import { pickPhoto, type PhotoSource } from './pick-photo';
import { useConfirmPetPhoto, useRemovePetPhoto } from './queries';

type Upload =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  /** `retryable`: the picked photo is still here and can be uploaded again without re-picking. */
  | { status: 'error'; message: string; retryable: boolean };

const UPLOAD_FAILED = 'Upload failed. Tap to try again.';
const PICK_FAILED = "That photo couldn't be opened. Try another one.";

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
      setUpload({ status: 'error', message: UPLOAD_FAILED, retryable: true });
      throw error;
    }
  }

  // choose/remove/retry are called from onPress (fire and forget): they never reject, every
  // failure lands in `upload` and is shown on the photo.
  async function choose(source: PhotoSource): Promise<void> {
    let result: Awaited<ReturnType<typeof pickPhoto>>;
    try {
      result = await pickPhoto(source);
    } catch {
      return setUpload({ status: 'error', message: PICK_FAILED, retryable: false });
    }
    if (result.status === 'denied') return setDeniedSource(result.source);
    if (result.status === 'cancelled') return;
    setLocalUri(result.uri);
    // An upload failure is shown on the photo (status 'error'); nothing else to do here.
    if (petId) await uploadTo(petId, result.uri).catch(() => undefined);
  }

  async function retry(): Promise<void> {
    if (petId && localUri) await uploadTo(petId).catch(() => undefined);
  }

  async function remove(): Promise<void> {
    try {
      if (petId) await removeRemote.mutateAsync();
      setLocalUri(null);
      setUpload({ status: 'idle' });
    } catch (error) {
      // The saved photo is still there: keep showing it, and say why it wasn't removed.
      setUpload({ status: 'error', message: errorMessage(error), retryable: false });
    }
  }

  return {
    /** The picked photo, shown until the confirmed one replaces it. */
    localUri,
    upload,
    isUploading: upload.status === 'uploading',
    choose,
    remove,
    /** Shown on the photo after a failed upload; offered only when `canRetry`. */
    canRetry: upload.status === 'error' && upload.retryable && petId !== null && localUri !== null,
    retry,
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
