import type { LucideIcon } from 'lucide-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { Text } from '@/components/ui/text';

export type SheetOption = {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  /** Destructive options (e.g. "Remove photo") are red; never colour alone, the label says it. */
  tone?: 'default' | 'negative';
  testID?: string;
};

type OptionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: SheetOption[];
};

/** A bottom sheet of choices. Picking one closes the sheet, then runs the option. */
export function OptionSheet({ isOpen, onClose, title, options }: OptionSheetProps) {
  const items: SheetOption[] = [...options, { label: 'Cancel', onPress: () => undefined }];
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="pb-8">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        {title ? <Text className="py-2 text-sm text-typography-700">{title}</Text> : null}
        {items.map((option) => {
          const negative = option.tone === 'negative';
          return (
            <ActionsheetItem
              key={option.label}
              className="min-h-12"
              testID={option.testID}
              onPress={() => {
                onClose();
                option.onPress();
              }}
            >
              {option.icon ? (
                <ActionsheetIcon
                  as={option.icon}
                  className={negative ? 'text-error-700' : 'text-typography-900'}
                />
              ) : null}
              <ActionsheetItemText
                className={negative ? 'text-base text-error-700' : 'text-base text-typography-900'}
              >
                {option.label}
              </ActionsheetItemText>
            </ActionsheetItem>
          );
        })}
      </ActionsheetContent>
    </Actionsheet>
  );
}
