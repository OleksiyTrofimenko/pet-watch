import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { CreatePetInput, PetDto, UpdatePetInput } from '@petwatch/shared';
import { petsApi } from './api';

export const petKeys = {
  all: ['pets'] as const,
  detail: (id: string) => [...petKeys.all, id] as const,
};

/** A mutation returned the fresh pet: show it on the detail now, refetch the list. */
function storePet(queryClient: QueryClient, pet: PetDto): void {
  queryClient.setQueryData(petKeys.detail(pet.id), pet);
  void queryClient.invalidateQueries({ queryKey: petKeys.all, exact: true });
}

export function usePets() {
  return useQuery({ queryKey: petKeys.all, queryFn: petsApi.list });
}

export function usePet(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: petKeys.detail(id),
    queryFn: () => petsApi.get(id),
    // Opening a pet from the list renders instantly from the list data, then refreshes.
    initialData: () => queryClient.getQueryData<PetDto[]>(petKeys.all)?.find((p) => p.id === id),
    // …as old as the list it came from, so the usual staleness rules decide the refetch.
    initialDataUpdatedAt: () => queryClient.getQueryState(petKeys.all)?.dataUpdatedAt,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePetInput) => petsApi.create(input),
    onSuccess: (pet) => storePet(queryClient, pet),
  });
}

export function useUpdatePet(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePetInput) => petsApi.update(id, input),
    onSuccess: (pet) => storePet(queryClient, pet),
  });
}

export function useDeletePet(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => petsApi.remove(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: petKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: petKeys.all, exact: true });
    },
  });
}

export function useRemovePetPhoto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => petsApi.removePhoto(id),
    onSuccess: (pet) => storePet(queryClient, pet),
  });
}

/** Step 3 of the upload, after the file is in S3. Exposed for usePetPhoto only. */
export function useConfirmPetPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, key }: { petId: string; key: string }) =>
      petsApi.confirmPhoto(petId, key),
    onSuccess: (pet) => storePet(queryClient, pet),
  });
}
