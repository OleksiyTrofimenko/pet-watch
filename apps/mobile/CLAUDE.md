# Mobile patterns (Expo SDK 57 + Expo Router + Gluestack UI v3)

## Layers — imports only point downward (lint-enforced)

```
app/                      Screens (routes). Thin: read params, call hooks, compose components.
  └─ src/features/<x>/    Feature code: api.ts, queries.ts, atoms.ts, components/, pure utils.
      └─ src/design-system/  App building blocks: Screen, FormInput, QueryView, EmptyState…
          │                  Domain-agnostic: no features, no API, no @petwatch/shared.
          └─ components/ui/  Gluestack primitives (vendored by the CLI). Don't hand-edit;
              │              add new ones with `npx gluestack-ui add <name>`.
              └─ tokens      components/ui/gluestack-ui-provider/config.ts (light/dark CSS vars)
                             + tailwind.config.js (maps vars → classes).
```

ESLint (`eslint.config.js`) enforces:

- screens and feature code don't use raw RN `View/Text/TextInput/Image/Button/TouchableOpacity`;
- presentational components (`features/*/components`) don't import TanStack Query, `api` or `queries`;
- screens don't import `features/*/api` (only hooks from `queries.ts`);
- the design system doesn't import features, API code or the shared contract.

## Styling rules

- **Tokens only**: `bg-background-0`, `text-typography-500`, `border-outline-200`, `bg-primary-500`…
  No hex/rgb values, no colour in `style={}`. Dark mode then comes for free.
- **Literal class strings.** Tailwind only generates classes it finds whole in source:
  `className={isPast ? 'opacity-50' : undefined}` ✅ — ``className={`bg-${tone}-100`}`` ❌.
  Map variants through a typed record (see `features/care-tasks/task-type-visuals.ts`).
- Spacing with `gap-*` / `space` props on stacks, not margins between siblings.
- Rebranding = edit the CSS variables in `gluestack-ui-provider/config.ts` (the Claude Design token
  sheet goes there). Components never change for a rebrand.

## Extending the design system

- A UI pattern used in **two** features moves to `src/design-system/` with a small typed props API,
  exported from `src/design-system/index.ts`.
- Domain visuals (task type → icon/label/colour, species → placeholder) stay in the feature, as
  exhaustive `Record<Enum, …>` so a new enum value fails the build until it's designed.
- Every screen renders exactly one `<Screen>`. Every query-driven area renders through `<QueryView>`
  with a skeleton shaped like the content and an `EmptyState`.

## Components

- One component per file, kebab-case filename, **named export** (routes in `app/` are the only
  default exports — Expo Router requires them).
- `type XProps = {...}` next to the component. Callbacks named `onX`. No data fetching in presentational components.
- Aim for < 150 lines. If a screen grows, extract sections into `features/<x>/components/`.
- Icon-only buttons get `accessibilityLabel`. Touch targets ≥ 44pt.

## Data (server state) — TanStack Query only

```ts
// src/features/pets/api.ts — thin typed calls through the shared apiClient
export const petsApi = {
  list: () => apiClient.get<PetDto[]>('/pets'),
  update: (id: string, input: UpdatePetInput) => apiClient.patch<PetDto>(`/pets/${id}`, input),
};

// src/features/pets/queries.ts — keys, hooks and invalidation in one place
export const petKeys = {
  all: ['pets'] as const,
  detail: (id: string) => [...petKeys.all, id] as const,
};

export function usePets() {
  return useQuery({ queryKey: petKeys.all, queryFn: petsApi.list });
}

export function useUpdatePet(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePetInput) => petsApi.update(id, input),
    onSuccess: (pet) => {
      qc.setQueryData(petKeys.detail(id), pet);
      void qc.invalidateQueries({ queryKey: petKeys.all });
    },
  });
}
```

- No server data in `useState`, Context or Jotai. Jotai atoms (`features/<x>/atoms.ts`) hold UI state
  only (schedule view mode, pet filter). The auth session is the one Context.

## Forms

- `useForm<Input>({ resolver: zodResolver(sharedSchema) })` + `<FormInput control name label />`.
- Server `fieldErrors` from `ApiErrorBody` are mapped onto fields with `setError`, so API validation
  and client validation look identical.
- Submit buttons show loading from `mutation.isPending` and are disabled while offline.

## Testing

- Testing Library v14: `render` and `fireEvent` are **async** — always `await` them.
- Test design-system components and pure feature utils (see `form-input.test.tsx`).
