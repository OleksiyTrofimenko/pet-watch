// The design's Btn (docs/design/…/Btn.dc.html) as full literal Tailwind classes.

export type Action = 'primary' | 'secondary' | 'negative';
export type Variant = 'solid' | 'outline' | 'link';
export type Size = 'sm' | 'md' | 'lg';

type Colours = { root: string; content: string };

/**
 * The design's Btn colours as full literal classes (Tailwind only generates whole strings).
 * They are merged over the primitive's defaults; `data-[active=true]` is the pressed state.
 */
export const COLOURS: Record<Action, Record<Variant, Colours>> = {
  primary: {
    solid: {
      root: 'bg-primary-600 border-primary-600 data-[active=true]:bg-primary-700 data-[active=true]:border-primary-700',
      content: 'text-typography-0 data-[active=true]:text-typography-0',
    },
    outline: {
      root: 'bg-background-0 border-primary-600 data-[active=true]:bg-primary-50',
      content: 'text-primary-700 data-[active=true]:text-primary-700',
    },
    link: { root: '', content: 'text-primary-700 data-[active=true]:text-primary-800' },
  },
  negative: {
    solid: {
      root: 'bg-error-600 border-error-600 data-[active=true]:bg-error-700 data-[active=true]:border-error-700',
      content: 'text-typography-0 data-[active=true]:text-typography-0',
    },
    outline: {
      root: 'bg-background-0 border-error-600 data-[active=true]:bg-error-50',
      content: 'text-error-700 data-[active=true]:text-error-700',
    },
    link: { root: '', content: 'text-error-700 data-[active=true]:text-error-800' },
  },
  secondary: {
    solid: {
      root: 'bg-secondary-100 border-secondary-100 data-[active=true]:bg-secondary-200 data-[active=true]:border-secondary-200',
      content: 'text-secondary-900 data-[active=true]:text-secondary-900',
    },
    outline: {
      root: 'bg-background-0 border-outline-600 data-[active=true]:bg-secondary-50',
      content: 'text-secondary-900 data-[active=true]:text-secondary-900',
    },
    link: { root: '', content: 'text-typography-700 data-[active=true]:text-typography-900' },
  },
};

const DISABLED_FILLED: Colours = {
  root: 'bg-outline-100 border-outline-100',
  content: 'text-typography-600',
};

export const DISABLED: Record<Variant, Colours> = {
  solid: DISABLED_FILLED,
  outline: DISABLED_FILLED,
  link: { root: '', content: 'text-typography-600' },
};

// Heights are minimums (44 / 48 / 52) so labels can wrap when the OS text size grows.
export const SIZE: Record<Size, string> = {
  sm: 'h-auto min-h-11 px-4 py-2',
  md: 'h-auto min-h-12 px-5 py-2',
  lg: 'h-auto min-h-[52px] px-6 py-2',
};

export const VARIANT: Record<Variant, { root: string; text: string }> = {
  solid: { root: '', text: '' },
  outline: { root: '', text: '' },
  link: {
    root: 'px-0 bg-transparent border-transparent data-[active=true]:bg-transparent',
    text: 'underline',
  },
};
