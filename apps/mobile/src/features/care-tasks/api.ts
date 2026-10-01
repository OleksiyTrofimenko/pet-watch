import type { CareTaskDto, CareTaskPayload, ScheduleTaskDto } from '@petwatch/shared';
import { apiClient } from '@/src/lib/api-client';

export const careTasksApi = {
  schedule: () => apiClient.get<ScheduleTaskDto[]>('/care-tasks'),
  listForPet: (petId: string) => apiClient.get<CareTaskDto[]>(`/pets/${petId}/care-tasks`),
  create: (petId: string, input: CareTaskPayload) =>
    apiClient.post<CareTaskDto>(`/pets/${petId}/care-tasks`, input),
  replace: (petId: string, taskId: string, input: CareTaskPayload) =>
    apiClient.put<CareTaskDto>(`/pets/${petId}/care-tasks/${taskId}`, input),
  remove: (petId: string, taskId: string) =>
    apiClient.delete<void>(`/pets/${petId}/care-tasks/${taskId}`),
};
