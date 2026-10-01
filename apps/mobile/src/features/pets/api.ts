import type {
  CreatePetInput,
  PetDto,
  PhotoUploadRequest,
  PhotoUploadTicket,
  UpdatePetInput,
} from '@petwatch/shared';
import { apiClient } from '@/src/lib/api-client';

export const petsApi = {
  list: () => apiClient.get<PetDto[]>('/pets'),
  get: (id: string) => apiClient.get<PetDto>(`/pets/${id}`),
  create: (input: CreatePetInput) => apiClient.post<PetDto>('/pets', input),
  update: (id: string, input: UpdatePetInput) => apiClient.patch<PetDto>(`/pets/${id}`, input),
  remove: (id: string) => apiClient.delete<void>(`/pets/${id}`),
  photoUploadUrl: (id: string, input: PhotoUploadRequest) =>
    apiClient.post<PhotoUploadTicket>(`/pets/${id}/photo-upload-url`, input),
  confirmPhoto: (id: string, key: string) => apiClient.put<PetDto>(`/pets/${id}/photo`, { key }),
  removePhoto: (id: string) => apiClient.delete<PetDto>(`/pets/${id}/photo`),
};
