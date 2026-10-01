import { petSummary } from './species-visuals';

describe('petSummary', () => {
  it('joins species, breed and age, skipping what is missing', () => {
    expect(petSummary({ species: 'DOG', breed: 'Labrador', ageYears: 4 })).toBe(
      'Dog · Labrador · 4 yrs',
    );
    expect(petSummary({ species: 'CAT', breed: null, ageYears: 1 })).toBe('Cat · 1 yr');
    expect(petSummary({ species: 'FISH', breed: null, ageYears: 0 })).toBe('Fish · 0 yrs');
    expect(petSummary({ species: 'BIRD', breed: null, ageYears: null })).toBe('Bird');
  });
});
