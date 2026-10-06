import type { Person } from '../types';
import { avatarImages } from '../lib/images';

export function Avatar({ person, size = 44 }: { person: Pick<Person, 'id' | 'name' | 'hue'>; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: `hsl(${person.hue} 80% 90%)` }} aria-hidden="true">
      <img src={avatarImages[person.id] ?? avatarImages.guest} alt="" width={size} height={size} loading="lazy" decoding="async" />
    </span>
  );
}
