import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTokenColor } from '@/src/design-system';

/**
 * System tab bar (D57): UITabBarController on iOS (Liquid Glass, sidebar on iPad), Material bottom
 * navigation on Android. Icons: SF Symbols on iOS, Material Symbols on Android. Trigger names are
 * the route files in this folder; testIDs are what Maestro taps.
 */
export default function TabsLayout() {
  const tint = useTokenColor('primary-600');
  const selected = useTokenColor('primary-700');
  const idle = useTokenColor('typography-600');

  return (
    <NativeTabs
      tintColor={tint}
      iconColor={{ default: idle, selected }}
      labelStyle={{ default: { color: idle }, selected: { color: selected } }}
      backgroundColor={useTokenColor('background-0')}
      indicatorColor={useTokenColor('primary-100')}
    >
      <NativeTabs.Trigger name="index" testID="tab.index">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          md={{ default: 'calendar_month', selected: 'calendar_month' }}
        />
        <NativeTabs.Trigger.Label>Schedule</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pets" testID="tab.pets">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'pawprint', selected: 'pawprint.fill' }}
          md={{ default: 'pets', selected: 'pets' }}
        />
        <NativeTabs.Trigger.Label>Pets</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account" testID="tab.account">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md={{ default: 'account_circle', selected: 'account_circle' }}
        />
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
