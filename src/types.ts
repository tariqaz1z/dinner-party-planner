export type Allergen = 'nuts' | 'dairy' | 'gluten' | 'shellfish' | 'eggs' | 'soy';
export type Pref = 'vegetarian' | 'vegan' | 'halal' | 'pescatarian';
export type Meat = 'none' | 'fish' | 'meat';
export type Category = 'breakfast' | 'brunch' | 'lunch' | 'dinner';
export type BringMode = 'host' | 'byob' | 'potluck' | 'mystery' | 'choose';

export interface Diet {
  allergies: Allergen[];
  prefs: Pref[];
}

export interface Person {
  id: string;
  name: string;
  blurb: string;
  hue: number;
  diet: Diet;
  /** true when the person has shared a calendar. */
  calendar: boolean;
  /** friend who is not on the app and joins through a share link. */
  link?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  hue: number;
  effort: number;
  minutes: number;
  cost: number;
  excitement: number;
  serves: number;
  ingredients: string[];
  steps: string[];
  contains: Allergen[];
  meat: Meat;
  video: boolean;
}

export interface Dish {
  id?: string;
  name: string;
  contains: Allergen[];
  meat: Meat;
  minutes: number;
  serves: number;
}

export interface GuestEntry {
  personId: string;
  rsvp: 'pending' | 'accepted' | 'declined';
  votes: string[];
  diet: Diet;
  bring?: { dish: string; contains: Allergen[] };
  declineNote?: string;
}

export interface Comment {
  id: string;
  personId: string;
  text: string;
  at: number;
}

export interface Dinner {
  id: string;
  name: string;
  hostId: string;
  category: Category;
  time: string;
  shortlist: string[];
  confirmedDate?: string;
  dish: Dish;
  prepMinutes: number;
  bringMode: BringMode;
  location: string;
  note: string;
  guests: GuestEntry[];
  comments: Comment[];
  createdAt: number;
}

export interface Notice {
  id: string;
  text: string;
  at: number;
  read: boolean;
  to?: string;
}

export const ME = 'me';
