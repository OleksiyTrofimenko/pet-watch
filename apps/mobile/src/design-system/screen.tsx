import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { useIsOnline } from '@/src/lib/use-is-online';

type ScreenProps = {
  children: ReactNode;
  /** Scrollable screens (forms, details). Lists should use FlatList inside a non-scroll Screen. */
  scroll?: boolean;
  /**
   * Forms: scrolls the focused field into view above the keyboard (react-native-keyboard-controller),
   * leaving room for the row below it (the next field or the submit button). Implies `scroll`.
   */
  keyboardAware?: boolean;
  /** Stays put while the content scrolls, e.g. a Fab. */
  floating?: ReactNode;
};

// Space kept between the focused field and the keyboard: one button (h-12) plus the form gap (gap-4).
const KEYBOARD_CLEARANCE = 48 + 16;

/** Every route renders exactly one Screen: consistent background, safe areas and spacing. */
export function Screen({ children, scroll = false, keyboardAware = false, floating }: ScreenProps) {
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
          {keyboardAware ? (
            <KeyboardAwareScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              bottomOffset={KEYBOARD_CLEARANCE}
            >
              {content}
            </KeyboardAwareScrollView>
          ) : scroll ? (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
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
