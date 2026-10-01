import { ConfirmDialog } from '@/src/design-system';
import type { PhotoSource } from '../pick-photo';

const COPY: Record<PhotoSource, { title: string; body: string }> = {
  camera: {
    title: 'Allow camera access',
    body: 'PetWatch needs the camera to take a photo of your pet. You can turn it on in Settings.',
  },
  library: {
    title: 'Allow photo access',
    body: 'PetWatch needs access to your photos to add a picture of your pet. You can turn it on in Settings.',
  },
};

type PhotoPermissionDialogProps = {
  /** The source whose permission was refused; null = closed. */
  source: PhotoSource | null;
  onOpenSettings: () => void;
  onCancel: () => void;
};

/** Permission refused: explain why, and offer the way out (the OS won't ask again). */
export function PhotoPermissionDialog({
  source,
  onOpenSettings,
  onCancel,
}: PhotoPermissionDialogProps) {
  return (
    <ConfirmDialog
      isOpen={source !== null}
      title={source ? COPY[source].title : ''}
      body={source ? COPY[source].body : ''}
      confirmLabel="Open Settings"
      action="primary"
      onConfirm={onOpenSettings}
      onCancel={onCancel}
    />
  );
}
