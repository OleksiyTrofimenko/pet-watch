import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from './button';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  /** Name the consequence, e.g. "Rex's care routine will be deleted." */
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** `negative` for destructive actions; `primary` for e.g. "Open Settings". */
  action?: 'negative' | 'primary';
  isLoading?: boolean;
  testID?: string;
};

/** Confirmation before an action that can't be undone. Cancel comes first and is the default. */
export function ConfirmDialog({
  isOpen,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  action = 'negative',
  isLoading = false,
  testID,
}: ConfirmDialogProps) {
  return (
    <AlertDialog isOpen={isOpen} onClose={onCancel}>
      <AlertDialogBackdrop />
      <AlertDialogContent testID={testID}>
        <AlertDialogHeader>
          <Heading size="md">{title}</Heading>
        </AlertDialogHeader>
        <AlertDialogBody className="mb-4 mt-2">
          <Text className="text-typography-700">{body}</Text>
        </AlertDialogBody>
        <AlertDialogFooter className="gap-3">
          <Button label="Cancel" variant="outline" action="secondary" onPress={onCancel} />
          <Button
            label={confirmLabel}
            action={action}
            isLoading={isLoading}
            onPress={onConfirm}
            testID={testID ? `${testID}-confirm` : undefined}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
