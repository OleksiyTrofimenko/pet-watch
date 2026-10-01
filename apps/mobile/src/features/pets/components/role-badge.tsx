import type { PetRole } from '@petwatch/shared';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';

const ROLE: Record<PetRole, { label: string; className: string; textClassName: string }> = {
  OWNER: { label: 'Owner', className: 'bg-primary-100', textClassName: 'text-primary-700' },
  WATCHER: { label: 'Watching', className: 'bg-info-100', textClassName: 'text-info-700' },
};

/** The caller's relationship to this pet (not a global role). */
export function RoleBadge({ role }: { role: PetRole }) {
  return (
    <Box className={`rounded-full px-2 py-0.5 ${ROLE[role].className}`}>
      <Text className={`text-xs font-semibold ${ROLE[role].textClassName}`}>
        {ROLE[role].label}
      </Text>
    </Box>
  );
}
