import type { Diet } from '../types';
import { allergyLabel } from '../lib/diet';
import { WarnIcon } from './Icon';

export function AllergyTag({ label }: { label: string }) {
  return (
    <span className="tag tag-allergy">
      <WarnIcon />
      {label}
    </span>
  );
}

export function PrefTag({ label }: { label: string }) {
  return <span className="tag tag-pref">{label}</span>;
}

/** Allergies and preferences always render as two clearly different types. */
export function DietTags({ diet, empty }: { diet: Diet; empty?: string }) {
  if (!diet.allergies.length && !diet.prefs.length) return empty ? <span className="muted small">{empty}</span> : null;
  return (
    <span className="tags">
      {diet.allergies.map((a) => (
        <AllergyTag key={a} label={allergyLabel(a)} />
      ))}
      {diet.prefs.map((p) => (
        <PrefTag key={p} label={p} />
      ))}
    </span>
  );
}

export function Warning({ text }: { text: string }) {
  return (
    <p className="warning" role="alert">
      <WarnIcon size={20} />
      <span>{text}</span>
    </p>
  );
}

export function Notice({ text }: { text: string }) {
  return <p className="notice">{text}</p>;
}
