import type { LucideIcon } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

export type TabItem = { key: string; label: string; icon: LucideIcon };

type TabBarProps = {
  tabs: readonly TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  bottomInset: number;
};

/** Bottom tabs (TabBar.dc.html): active tab = tinted pill + bold label, not colour alone. */
export function TabBar({ tabs, activeKey, onSelect, bottomInset }: TabBarProps) {
  return (
    <HStack
      className="border-t border-outline-100 bg-background-0 px-2 pt-2"
      style={{ paddingBottom: Math.max(bottomInset, 8) }}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            testID={`tab.${tab.key}`}
            className="min-h-12 flex-1 items-center gap-1"
          >
            <HStack
              className={`rounded-full px-4 py-1 ${active ? 'bg-primary-100' : 'bg-transparent'}`}
            >
              <Icon
                as={tab.icon}
                className={`h-6 w-6 ${active ? 'text-primary-700' : 'text-typography-600'}`}
              />
            </HStack>
            <Text
              className={`text-xs ${active ? 'font-bold text-primary-700' : 'font-medium text-typography-600'}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
