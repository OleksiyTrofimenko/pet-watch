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
import { VStack } from '@/components/ui/vstack';
import { Button } from './button';
import { FormAlert } from './form-alert';

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
  /** Why the last confirm failed (e.g. 403, server down); the dialog stays open so it can be retried. */
  error?: string | null;
  /** Passed to the confirm Button, e.g. "delete" (Open Settings needs no network). */
  requiresNetwork?: string;
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
  error,
  requiresNetwork,
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
          <VStack space="md">
            <Text className="text-typography-700">{body}</Text>
            {error ? (
              <FormAlert message={error} testID={testID ? `${testID}-error` : undefined} />
            ) : null}
          </VStack>
        </AlertDialogBody>
        <AlertDialogFooter className="gap-3">
          <Button label="Cancel" variant="outline" action="secondary" onPress={onCancel} />
          <Button
            label={confirmLabel}
            action={action}
            isLoading={isLoading}
            requiresNetwork={requiresNetwork}
            onPress={onConfirm}
            testID={testID ? `${testID}-confirm` : undefined}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
