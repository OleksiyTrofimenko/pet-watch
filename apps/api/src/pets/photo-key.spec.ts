import { isPhotoKeyOfPet, newPhotoKey } from './photo-key';

const PET = '0199a0b0-0000-7000-8000-000000000001';
const OTHER = '0199a0b0-0000-7000-8000-000000000002';

describe('photo keys', () => {
  it('issues keys under the pet with the right extension', () => {
    expect(newPhotoKey(PET, 'image/jpeg')).toMatch(new RegExp(`^pets/${PET}/[0-9a-f-]{36}\\.jpg$`));
    expect(newPhotoKey(PET, 'image/webp')).toMatch(/\.webp$/);
  });

  it('accepts a key issued for the pet', () => {
    expect(isPhotoKeyOfPet(newPhotoKey(PET, 'image/png'), PET)).toBe(true);
  });

  it.each([
    ['another pet', () => newPhotoKey(OTHER, 'image/jpeg')],
    ['path traversal', () => `pets/${PET}/../${OTHER}/a.jpg`],
    ['nested path', () => `pets/${PET}/x/${newPhotoKey(PET, 'image/jpeg').split('/')[2]}`],
    ['a different prefix', () => `avatars/${PET}/0199a0b0-0000-7000-8000-000000000003.jpg`],
    ['an unknown extension', () => `pets/${PET}/0199a0b0-0000-7000-8000-000000000003.exe`],
  ])('rejects %s', (_, key) => {
    expect(isPhotoKeyOfPet(key(), PET)).toBe(false);
  });
});
