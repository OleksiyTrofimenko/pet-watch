import { render, screen } from '@testing-library/react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ConfirmDialog } from './confirm-dialog';

const props = {
  isOpen: true,
  title: 'Delete Rex?',
  body: "Rex's care routine will be deleted.",
  confirmLabel: 'Delete pet',
  onConfirm: () => undefined,
  onCancel: () => undefined,
  testID: 'pet-delete',
};

type DialogProps = Parameters<typeof ConfirmDialog>[0];

/** The dialog renders through Gluestack's overlay, which needs its provider. */
const renderDialog = (overrides: Partial<DialogProps>) =>
  render(
    <OverlayProvider>
      <ConfirmDialog {...props} {...overrides} />
    </OverlayProvider>,
  );

describe('ConfirmDialog', () => {
  it('shows why the last confirm failed, and keeps the confirm button for a retry', async () => {
    await renderDialog({ error: 'Only the owner can do this.' });

    expect(screen.getByTestId('pet-delete-error')).toHaveTextContent('Only the owner can do this.');
    expect(screen.getByTestId('pet-delete-confirm')).toBeTruthy();
  });

  it('shows no alert without an error', async () => {
    await renderDialog({ error: null });

    expect(screen.getByText('Delete Rex?')).toBeTruthy();
    expect(screen.queryByTestId('pet-delete-error')).toBeNull();
  });
});
