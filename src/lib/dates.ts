export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** The last day a dinner can be planned: three months out. */
export const lastPlannable = () => {
  const t = today();
  return new Date(t.getFullYear(), t.getMonth() + 3, t.getDate());
};

export const longDate = (s: string) =>
  parse(s).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export const shortDate = (s: string) =>
  parse(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export const monthLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

/** nth upcoming occurrence of a weekday (0 = Sunday), starting from tomorrow. */
export const nextDow = (dow: number, nth = 0) => {
  let d = addDays(today(), 1);
  while (d.getDay() !== dow) d = addDays(d, 1);
  return iso(addDays(d, nth * 7));
};

export const isPast = (s: string) => parse(s).getTime() < today().getTime();

export const timeAgo = (at: number) => {
  const mins = Math.round((Date.now() - at) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
};
