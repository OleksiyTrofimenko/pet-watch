import { fireEvent, render, screen } from '@testing-library/react-native';
import { Plus } from 'lucide-react-native';
import { Button } from './button';

describe('Button', () => {
  it('renders the label and calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save pet" icon={Plus} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save pet' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner, reports busy and blocks presses while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save pet" isLoading onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Save pet' });
    await fireEvent.press(button);

    expect(screen.getByLabelText('loading')).toBeTruthy();
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows why it is disabled, below the button and as the accessibility hint', async () => {
    const onPress = jest.fn();
    const reason = 'Connect to the internet to send invites.';
    await render(
      <Button label="Send invite" isDisabled disabledReason={reason} onPress={onPress} />,
    );

    const button = screen.getByRole('button', { name: 'Send invite' });
    await fireEvent.press(button);

    expect(screen.getByText(reason)).toBeTruthy();
    expect(button.props.accessibilityHint).toBe(reason);
    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();

    // Type test (D39): a disabled Button without a reason must not compile.
    // @ts-expect-error disabledReason is required when isDisabled is true
    void (<Button label="Send invite" isDisabled onPress={onPress} />);
  });
});
