import { useColorScheme } from 'nativewind';
import { tokens } from '@/components/ui/gluestack-ui-provider/config';

type TokenVars = typeof tokens.light;
/** Token names without the `--color-` prefix, e.g. 'primary-500', 'background-0'. */
export type ColorToken = {
  [K in keyof TokenVars]: K extends `--color-${infer Name}` ? Name : never;
}[keyof TokenVars];

/**
 * A token as an `rgb()` string for the current colour scheme. Only for native components that take a
 * colour value instead of a className (native tabs); everything else uses token classes.
 */
export function useTokenColor(name: ColorToken): string {
  const { colorScheme } = useColorScheme();
  const rgb = tokens[colorScheme === 'dark' ? 'dark' : 'light'][`--color-${name}`];
  return `rgb(${rgb.split(' ').join(', ')})`;
}
