import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react-native';
import { useForm, useWatch } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  createPetSchema,
  type CreatePetFormValues,
  type CreatePetInput,
  type PetDto,
} from '@petwatch/shared';
import { Button, FormAlert, FormInput, SelectField } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { SPECIES_OPTIONS } from '../species-visuals';

const FIELDS = ['name', 'species', 'breed', 'ageYears', 'notes'] as const;

type PetFormProps = {
  /** Edit mode when set. */
  pet?: PetDto;
  /** The photo field, rendered above the inputs (its upload is driven by the screen). */
  photo: (name: string, species: CreatePetFormValues['species'] | undefined) => ReactNode;
  onSubmit: (values: CreatePetInput) => Promise<unknown>;
  /** Set while a photo uploads: Save waits for it and says why. */
  saveDisabledReason?: string;
  onDelete?: () => void;
};

export function PetForm({ pet, photo, onSubmit, saveDisabledReason, onDelete }: PetFormProps) {
  const form = useForm<CreatePetFormValues, unknown, CreatePetInput>({
    resolver: zodResolver(createPetSchema),
    defaultValues: {
      name: pet?.name ?? '',
      species: pet?.species,
      breed: pet?.breed ?? '',
      ageYears: pet?.ageYears ?? null,
      notes: pet?.notes ?? '',
    },
  });
  const { submit, formError } = useApiSubmit(form, FIELDS, onSubmit);
  const [name, species] = useWatch({ control: form.control, name: ['name', 'species'] });
  const saveLabel = pet ? 'Save changes' : 'Add pet';

  return (
    <VStack className="gap-5 pb-4">
      {photo(name, species)}
      {formError ? <FormAlert message={formError} testID="pet-form.alert" /> : null}
      <FormInput
        control={form.control}
        name="name"
        label="Name"
        placeholder="e.g. Rex"
        isRequired
        testID="pet-form.name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => form.setFocus('breed')}
      />
      <SelectField
        control={form.control}
        name="species"
        label="Species"
        placeholder="Choose species"
        options={SPECIES_OPTIONS}
        testID="pet-form.species"
      />
      <FormInput
        control={form.control}
        name="breed"
        label="Breed (optional)"
        placeholder="e.g. Labrador"
        testID="pet-form.breed"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => form.setFocus('ageYears')}
      />
      <FormInput
        control={form.control}
        name="ageYears"
        label="Age in years (optional)"
        placeholder="e.g. 4"
        keyboardType="number-pad"
        format={(value) => (typeof value === 'number' ? String(value) : '')}
        parse={(text) => (text.trim() === '' ? null : Number(text))}
        testID="pet-form.age"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => form.setFocus('notes')}
      />
      <FormInput
        control={form.control}
        name="notes"
        label="Notes (optional)"
        placeholder="Anything a sitter should know"
        multiline
        testID="pet-form.notes"
      />
      {saveDisabledReason ? (
        <Button
          label={saveLabel}
          size="lg"
          fullWidth
          onPress={() => undefined}
          isDisabled
          disabledReason={saveDisabledReason}
        />
      ) : (
        <Button
          label={saveLabel}
          size="lg"
          fullWidth
          isLoading={form.formState.isSubmitting}
          onPress={() => void submit()}
          requiresNetwork="save"
          testID="pet-form.save"
        />
      )}
      {pet && onDelete ? (
        <VStack className="mt-2 gap-2 border-t border-outline-100 pt-5">
          <Button
            label="Delete pet"
            icon={Trash2}
            action="negative"
            variant="outline"
            fullWidth
            onPress={onDelete}
            requiresNetwork="delete"
            testID="pet-form.delete"
          />
          <Text className="text-center text-sm text-typography-700">
            Removes {pet.name}&apos;s care routine and everyone&apos;s access.
          </Text>
        </VStack>
      ) : null}
    </VStack>
  );
}
