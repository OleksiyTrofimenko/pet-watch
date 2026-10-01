import type { LucideIcon } from 'lucide-react-native';
import { Fab as UIFab, FabIcon, FabLabel } from '@/components/ui/fab';

type FabProps = {
  /** Always labelled (design rule): an icon alone doesn't say what it adds. */
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  testID?: string;
};

/** The screen's one primary action, floating bottom-right. */
export function Fab({ label, icon, onPress, testID }: FabProps) {
  return (
    <UIFab
      placement="bottom right"
      size="lg"
      onPress={onPress}
      testID={testID}
      accessibilityLabel={label}
      className="bg-primary-600 data-[active=true]:bg-primary-700"
    >
      <FabIcon as={icon} className="text-typography-0" />
      <FabLabel className="font-semibold text-typography-0">{label}</FabLabel>
    </UIFab>
  );
}
