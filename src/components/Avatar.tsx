import type { Person } from '../types';

export function Avatar({ person, size = 44 }: { person: Pick<Person, 'name' | 'hue'>; size?: number }) {
  const bg = `linear-gradient(135deg, hsl(${person.hue} 95% 82%), hsl(${(person.hue + 70) % 360} 95% 78%))`;
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42, background: bg }} aria-hidden="true">
      {person.name.trim()[0]?.toUpperCase()}
    </span>
  );
}
