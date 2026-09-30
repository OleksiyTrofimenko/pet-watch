import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { Pressable, Text } from 'react-native';
import { loginSchema, type LoginInput } from '@petwatch/shared';
import { FormInput } from './form-input';

function LoginFormHarness({ onValid }: { onValid: (values: LoginInput) => void }) {
  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  return (
    <>
      <FormInput control={control} name="email" label="Email" placeholder="Email" />
      <FormInput control={control} name="password" label="Password" placeholder="Password" />
      <Pressable onPress={handleSubmit((values) => onValid(values))}>
        <Text>Submit</Text>
      </Pressable>
    </>
  );
}

describe('FormInput + shared schema', () => {
  it('shows validation errors under the right field and blocks submit', async () => {
    const onValid = jest.fn();
    await render(<LoginFormHarness onValid={onValid} />);

    await fireEvent.press(screen.getByText('Submit'));

    expect(await screen.findByText('Password is required')).toBeTruthy();
    expect(onValid).not.toHaveBeenCalled();
  });

  it('submits values normalised by the shared schema', async () => {
    const onValid = jest.fn();
    await render(<LoginFormHarness onValid={onValid} />);

    await fireEvent.changeText(screen.getByPlaceholderText('Email'), '  Ana@Example.com ');
    await fireEvent.changeText(screen.getByPlaceholderText('Password'), 'secret');
    await fireEvent.press(screen.getByText('Submit'));

    await waitFor(() =>
      expect(onValid).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secret' }),
    );
  });
});
