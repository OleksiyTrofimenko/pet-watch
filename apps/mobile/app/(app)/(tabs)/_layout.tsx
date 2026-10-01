import { Tabs } from 'expo-router';
import { CalendarDays, PawPrint, UserRound } from 'lucide-react-native';
import { TabBar, type TabItem } from '@/src/design-system';

// Keys are the route names in this folder.
const TABS: TabItem[] = [
  { key: 'index', label: 'Schedule', icon: CalendarDays },
  { key: 'pets', label: 'Pets', icon: PawPrint },
  { key: 'account', label: 'Account', icon: UserRound },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation, insets }) => (
        <TabBar
          tabs={TABS}
          activeKey={state.routes[state.index]?.name ?? 'index'}
          onSelect={(key) => navigation.navigate(key)}
          bottomInset={insets.bottom}
        />
      )}
    />
  );
}
