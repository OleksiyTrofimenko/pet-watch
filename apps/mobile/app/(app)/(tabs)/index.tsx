import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import type { ScheduleTaskDto } from '@petwatch/shared';
import { Heading } from '@/components/ui/heading';
import { QueryView, Screen, SegmentedControl } from '@/src/design-system';
import { useSchedule } from '@/src/features/care-tasks/queries';
import { usePets } from '@/src/features/pets/queries';
import { petFilterAtom, viewModeAtom } from '@/src/features/schedule/atoms';
import { PetFilterChips } from '@/src/features/schedule/components/pet-filter-chips';
import { ScheduleSkeleton } from '@/src/features/schedule/components/schedule-skeleton';
import { TodayView } from '@/src/features/schedule/components/today-view';
import { WeekView } from '@/src/features/schedule/components/week-view';
import { effectiveFilter, filterTasks, staleLabel } from '@/src/features/schedule/schedule-view';
import { useNow } from '@/src/features/schedule/use-now';
import { useIsOnline } from '@/src/lib/use-is-online';
import { useRefreshScreen } from '@/src/lib/use-refresh-screen';

const VIEW_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
] as const;

/** Today / This week, expanded on the device from the rules of every pet I own or watch. */
export default function ScheduleScreen() {
  const router = useRouter();
  const [mode, setMode] = useAtom(viewModeAtom);
  const [filter, setFilter] = useAtom(petFilterAtom);
  const schedule = useSchedule();
  const pets = usePets();
  const now = useNow();
  const online = useIsOnline();
  const refresh = useRefreshScreen();

  const petList = (pets.data ?? []).map((pet) => ({ id: pet.id, name: pet.name }));
  const active = effectiveFilter(
    filter,
    petList.map((pet) => pet.id),
  );
  const petName = active === 'all' ? undefined : petList.find((p) => p.id === active.petId)?.name;
  const openTask = (task: ScheduleTaskDto) =>
    router.push({
      pathname: '/pets/[petId]/tasks/[taskId]/edit',
      params: { petId: task.petId, taskId: task.id },
    });

  return (
    <Screen scroll onRefresh={refresh}>
      <Heading className="text-[32px] font-semibold leading-[38px]" testID="schedule.title">
        Schedule
      </Heading>
      <SegmentedControl
        options={VIEW_OPTIONS}
        value={mode}
        onChange={setMode}
        label="Schedule view"
        testID="schedule.view"
      />
      {petList.length > 0 ? (
        <PetFilterChips pets={petList} value={active} onChange={setFilter} />
      ) : null}
      <QueryView query={schedule} loading={<ScheduleSkeleton />}>
        {(tasks) => {
          const visible = filterTasks(tasks, active);
          return mode === 'today' ? (
            <TodayView
              tasks={visible}
              now={now}
              petName={petName}
              staleLabel={staleLabel(online, schedule.dataUpdatedAt)}
              onOpen={openTask}
            />
          ) : (
            <WeekView tasks={visible} now={now} petName={petName} onOpen={openTask} />
          );
        }}
      </QueryView>
    </Screen>
  );
}
