import type { LucideIcon } from 'lucide-react-native';
import {
  Button as UIButton,
  ButtonIcon as UIButtonIcon,
  ButtonText as UIButtonText,
} from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  COLOURS,
  DISABLED,
  SIZE,
  VARIANT,
  type Action,
  type Size,
  type Variant,
} from './button-classes';

type BaseProps = {
  label: string;
  onPress: () => void;
  action?: Action;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  /** Shows a spinner in place of the icon and blocks presses; keeps the action colours. */
  isLoading?: boolean;
  fullWidth?: boolean;
};

/**
 * Design rule: a disabled button always says why, directly below it.
 * The union makes a missing reason a compile error instead of a review comment.
 */
export type ButtonProps = BaseProps &
  ({ isDisabled?: false; disabledReason?: never } | { isDisabled: true; disabledReason: string });

export function Button(props: ButtonProps) {
  const {
    label,
    onPress,
    action = 'primary',
    variant = 'solid',
    size = 'md',
    icon,
    isLoading = false,
    fullWidth = false,
    isDisabled = false,
    disabledReason,
  } = props;
  const colours = isDisabled ? DISABLED[variant] : COLOURS[action][variant];
  const rootClassName = [
    'rounded border-[1.5px] data-[disabled=true]:opacity-100',
    SIZE[size],
    VARIANT[variant].root,
    colours.root,
    fullWidth ? 'w-full' : '',
  ].join(' ');

  const button = (
    <UIButton
      action={action}
      variant={variant}
      isDisabled={isDisabled || isLoading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={disabledReason}
      accessibilityState={{ disabled: isDisabled || isLoading, busy: isLoading }}
      className={rootClassName}
    >
      {isLoading ? (
        <Spinner size="small" className={colours.content} />
      ) : icon ? (
        <UIButtonIcon as={icon} className={`h-5 w-5 ${colours.content}`} />
      ) : null}
      <UIButtonText
        className={`font-body text-base font-semibold leading-5 ${VARIANT[variant].text} ${colours.content}`}
      >
        {label}
      </UIButtonText>
    </UIButton>
  );

  if (!disabledReason) return button;
  return (
    <VStack space="xs">
      {button}
      <Text size="sm" className="text-center text-typography-700">
        {disabledReason}
      </Text>
    </VStack>
  );
}
