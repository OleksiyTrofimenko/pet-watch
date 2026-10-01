import { useCallback } from 'react';
import { CircleCheck, CircleAlert } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';

type NotifyKind = 'success' | 'error';

const KIND: Record<NotifyKind, { icon: typeof CircleCheck; circle: string; iconClass: string }> = {
  success: { icon: CircleCheck, circle: 'bg-success-100', iconClass: 'text-success-700' },
  error: { icon: CircleAlert, circle: 'bg-error-100', iconClass: 'text-error-700' },
};

/** Short confirmation after an action, e.g. "Password updated" (design: Toast.dc.html). */
export function useNotify() {
  const toast = useToast();
  return useCallback(
    (title: string, kind: NotifyKind = 'success') => {
      const visual = KIND[kind];
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast
            nativeID={`toast-${id}`}
            className="flex-row items-center gap-3 rounded-lg bg-typography-900 px-4 py-3.5"
            accessibilityRole="alert"
          >
            <Box className={`h-7 w-7 items-center justify-center rounded-full ${visual.circle}`}>
              <Icon as={visual.icon} className={`h-4 w-4 ${visual.iconClass}`} />
            </Box>
            <ToastTitle className="text-[15px] font-semibold text-typography-0">{title}</ToastTitle>
          </Toast>
        ),
      });
    },
    [toast],
  );
}
