import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { useIsOnline } from '@/src/lib/use-is-online';

type ScreenProps = {
  children: ReactNode;
  /** Scrollable screens (forms, details). Lists should use FlatList inside a non-scroll Screen. */
  scroll?: boolean;
  /** Stays put while the content scrolls, e.g. a Fab. */
  floating?: ReactNode;
};

/** Every route renders exactly one Screen: consistent background, safe areas and spacing. */
export function Screen({ children, scroll = false, floating }: ScreenProps) {
  // Offline, the OfflineBanner above the screen already covers the status bar area.
  const online = useIsOnline();
  // The view's own safe area (not the window's): on iOS it includes the native tab bar, which
  // floats over the content, so the last row and a Fab stay above it.
  const edges: Edge[] = online ? ['top', 'bottom'] : ['bottom'];
  const content = <Box className="flex-1 gap-4 px-4 py-4">{children}</Box>;

  return (
    <Box className="flex-1 bg-background-0">
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        {/* Positioning box for `floating`: absolute children ignore the safe-area padding. */}
        <Box className="flex-1">
          {scroll ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              // iOS: the keyboard overlays the screen; inset the content so focused fields scroll
              // into view. (Android resizes the window instead.)
              automaticallyAdjustKeyboardInsets
            >
              {content}
            </ScrollView>
          ) : (
            content
          )}
          {floating}
        </Box>
      </SafeAreaView>
    </Box>
  );
}
