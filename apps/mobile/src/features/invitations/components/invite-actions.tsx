import { VStack } from '@/components/ui/vstack';
import { Button } from '@/src/design-system';
import type { InviteScreenState } from '../invite-state';

type InviteActionsProps = {
  state: InviteScreenState;
  /** "View Rex's schedule" once the pet name is known. */
  scheduleLabel: string;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: () => void;
  onDecline: () => void;
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
          {/* Closes the link for good; only a new invite from the owner brings it back. */}
          <Button
            label="Decline"
            variant="outline"
            action="negative"
            size="lg"
            fullWidth
            isLoading={props.isDeclining}
            onPress={props.onDecline}
            requiresNetwork="decline"
            testID="invite.decline"
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
      {state === 'declined' ||
      state === 'expired' ||
      state === 'cancelled' ||
      state === 'unavailable' ||
      state === 'error' ? (
        <Button
          label="Go to my pets"
          size="lg"
          fullWidth
          onPress={props.onGoToPets}
          testID="invite.go-to-pets"
        />
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
