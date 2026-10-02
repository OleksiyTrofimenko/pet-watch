import { VStack } from '@/components/ui/vstack';
import { Button } from '@/src/design-system';
import type { InviteScreenState } from '../invite-state';

type InviteActionsProps = {
  state: InviteScreenState;
  /** "View Rex's schedule" once the pet name is known. */
  scheduleLabel: string;
  isAccepting: boolean;
  onAccept: () => void;
  onNotNow: () => void;
  onViewSchedule: () => void;
  onGoToPets: () => void;
  onSwitchAccount: () => void;
};

/** The buttons under the accept screen, one set per state (AcceptScreen.dc.html). */
export function InviteActions(props: InviteActionsProps) {
  const { state } = props;
  const notNow = (
    <Button
      label="Not now"
      variant="outline"
      action="secondary"
      size="lg"
      fullWidth
      onPress={props.onNotNow}
    />
  );

  return (
    <VStack className="mt-auto gap-2 pt-6">
      {state === 'invite' ? (
        <>
          <Button
            label="Accept"
            size="lg"
            fullWidth
            isLoading={props.isAccepting}
            onPress={props.onAccept}
            requiresNetwork="accept"
            testID="invite.accept"
          />
          {/* The invite stays pending; the link keeps working until it expires. */}
          {notNow}
        </>
      ) : null}
      {state === 'accepted' || state === 'already' ? (
        <Button
          label={props.scheduleLabel}
          size="lg"
          fullWidth
          onPress={props.onViewSchedule}
          testID="invite.view-schedule"
        />
      ) : null}
      {state === 'expired' ||
      state === 'cancelled' ||
      state === 'unavailable' ||
      state === 'error' ? (
        <Button label="Go to my pets" size="lg" fullWidth onPress={props.onGoToPets} />
      ) : null}
      {state === 'wrong-account' ? (
        <>
          <Button
            label="Switch account"
            size="lg"
            fullWidth
            onPress={props.onSwitchAccount}
            testID="invite.switch-account"
          />
          {notNow}
        </>
      ) : null}
    </VStack>
  );
}
