import { useLang } from '../context/LangContext';
import type { Tri } from '../data/plastics';

/** Renders only the currently selected language from a trilingual string object. */
export function T({ s }: { s: Tri }) {
  const { lang } = useLang();
  return <>{s[lang]}</>;
}
