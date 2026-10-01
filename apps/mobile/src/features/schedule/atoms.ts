import { atom } from 'jotai';

/** UI state only (never server data): which view, and which pet it's filtered to. */
export type ViewMode = 'today' | 'week';
export type PetFilter = 'all' | { petId: string };

export const viewModeAtom = atom<ViewMode>('today');
/** Kept when switching between Today and This week (CARE-5). */
export const petFilterAtom = atom<PetFilter>('all');
