import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';

type ScreenProps = {
  children: ReactNode;
  /** Scrollable screens (forms, details). Lists should use FlatList inside a non-scroll Screen. */
  scroll?: boolean;
  /** Stays put while the content scrolls, e.g. a Fab. */
  floating?: ReactNode;
};

/** Every route renders exactly one Screen: consistent background, safe areas and spacing. */
export function Screen({ children, scroll = false, floating }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = <Box className="flex-1 gap-4 px-4 py-4">{children}</Box>;

  return (
    <Box
      className="flex-1 bg-background-0"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {scroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {floating}
    </Box>
  );
}
