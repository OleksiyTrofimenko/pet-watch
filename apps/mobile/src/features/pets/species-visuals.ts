import { SPECIES, type Species } from '@petwatch/shared';

/** Exhaustive: a new species in the shared enum fails the build here until it has a label. */
export const SPECIES_LABEL: Record<Species, string> = {
  DOG: 'Dog',
  CAT: 'Cat',
  BIRD: 'Bird',
  RABBIT: 'Rabbit',
  FISH: 'Fish',
  REPTILE: 'Reptile',
  OTHER: 'Other',
};

export const SPECIES_OPTIONS = SPECIES.map((value) => ({ value, label: SPECIES_LABEL[value] }));

/** "Dog · Labrador · 4 yrs" — the one-line summary used on cards and the detail header. */
export function petSummary(pet: {
  species: Species;
  breed: string | null;
  ageYears: number | null;
}): string {
  const age = pet.ageYears === null ? null : `${pet.ageYears} ${pet.ageYears === 1 ? 'yr' : 'yrs'}`;
  return [SPECIES_LABEL[pet.species], pet.breed, age].filter(Boolean).join(' · ');
}
