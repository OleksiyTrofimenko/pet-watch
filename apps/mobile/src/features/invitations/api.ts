import type {
  AcceptInvitationResult,
  CreateInvitationInput,
  CreateInvitationResult,
  InvitationPreview,
  PetWatchersDto,
} from '@petwatch/shared';
import { apiClient } from '@/src/lib/api-client';

export const invitationsApi = {
  invite: (petId: string, input: CreateInvitationInput) =>
    apiClient.post<CreateInvitationResult>(`/pets/${petId}/invitations`, input),
  watchers: (petId: string) => apiClient.get<PetWatchersDto>(`/pets/${petId}/watchers`),
  revokeWatcher: (petId: string, userId: string) =>
    apiClient.delete<void>(`/pets/${petId}/watchers/${userId}`),
  cancelInvitation: (petId: string, invitationId: string) =>
    apiClient.delete<void>(`/pets/${petId}/invitations/${invitationId}`),
  preview: (token: string) =>
    apiClient.get<InvitationPreview>(`/invitations/${encodeURIComponent(token)}`),
  accept: (token: string) =>
    apiClient.post<AcceptInvitationResult>(`/invitations/${encodeURIComponent(token)}/accept`),
};
