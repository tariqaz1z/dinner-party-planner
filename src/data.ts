import type { Category, Dinner, Notice, Person, Recipe } from './types';
import { ME } from './types';
import { foodImages } from './lib/images';
import { addDays, iso, nextDow, today } from './lib/dates';

export const APP_NAME = 'crumb'; // working title, see plan Part 9

export const ROTD_ID = 'tomato-soup-loaf';

export const RECIPES: Recipe[] = [
  {
    id: 'tomato-soup-loaf',
    name: 'tomato soup + garlic pull-apart loaf',
    tagline: 'cozy, a little messy, everyone tears into the bread.',
    image: foodImages['tomato-soup-loaf'],
    hue: 8,
    effort: 2, minutes: 50, cost: 2, excitement: 4, serves: 6,
    ingredients: ['2 cans (28 oz) whole tomatoes', '1 onion, chopped', '4 cloves garlic', '1 cup vegetable stock', '½ cup cream', '1 round sourdough loaf', '6 tbsp butter, softened', '1 cup shredded mozzarella', 'fresh basil'],
    steps: ['Sweat the onion and half the garlic in olive oil for 8 minutes.', 'Add tomatoes and stock, simmer 20 minutes, then blend until smooth. Stir in the cream.', 'Cut the loaf in a grid without slicing through the bottom. Mix remaining garlic into the butter and work it into the cuts, then add the cheese.', 'Bake at 375°F for 20 minutes, until golden. Serve with the soup and basil.'],
    contains: ['dairy', 'gluten'], meat: 'none', video: true,
  },
  {
    id: 'pesto-pasta',
    name: 'pine nut pesto pasta',
    tagline: 'green, fast, and pretty on the table.',
    image: foodImages['pesto-pasta'],
    hue: 120,
    effort: 1, minutes: 30, cost: 2, excitement: 3, serves: 4,
    ingredients: ['1 lb spaghetti', '2 cups basil', '½ cup pine nuts', '½ cup parmesan', '2 cloves garlic', '⅔ cup olive oil', 'lemon'],
    steps: ['Toast the pine nuts until golden.', 'Blend basil, nuts, parmesan, garlic and oil into a rough pesto.', 'Boil pasta, reserve a cup of water, toss it all together with a squeeze of lemon.'],
    contains: ['nuts', 'dairy', 'gluten'], meat: 'none', video: false,
  },
  {
    id: 'harissa-chicken',
    name: 'sheet-pan harissa chicken + chickpeas',
    tagline: 'one pan, big flavor, almost no dishes.',
    image: foodImages['harissa-chicken'],
    hue: 20,
    effort: 2, minutes: 45, cost: 3, excitement: 4, serves: 4,
    ingredients: ['8 chicken thighs', '2 cans chickpeas', '3 tbsp harissa', '1 red onion', 'lemon', 'parsley', 'olive oil'],
    steps: ['Mix harissa, oil and lemon juice. Coat chicken and rest 15 minutes.', 'Scatter chickpeas and onion on a sheet pan, set the chicken on top.', 'Roast at 425°F for 35 minutes. Finish with parsley.'],
    contains: [], meat: 'meat', video: true,
  },
  {
    id: 'mushroom-risotto',
    name: 'mushroom risotto',
    tagline: 'slow stirring, big reward, good for talking while you cook.',
    image: foodImages['mushroom-risotto'],
    hue: 35,
    effort: 3, minutes: 55, cost: 3, excitement: 4, serves: 4,
    ingredients: ['1½ cups arborio rice', '1 lb mixed mushrooms', '5 cups warm stock', '1 shallot', '½ cup white wine', '¾ cup parmesan', '3 tbsp butter'],
    steps: ['Brown the mushrooms in batches and set aside.', 'Toast rice with shallot, deglaze with wine.', 'Add stock one ladle at a time, stirring, for about 20 minutes.', 'Fold in mushrooms, butter and parmesan.'],
    contains: ['dairy'], meat: 'none', video: true,
  },
  {
    id: 'shrimp-tacos',
    name: 'shrimp tacos + mango salsa',
    tagline: 'bright, quick, build-your-own.',
    image: foodImages['shrimp-tacos'],
    hue: 45,
    effort: 2, minutes: 35, cost: 3, excitement: 5, serves: 4,
    ingredients: ['1½ lb shrimp', '12 corn tortillas', '2 mangos', '1 red onion', 'lime', 'cilantro', 'chili powder', 'cabbage slaw'],
    steps: ['Dice mango, onion and cilantro with lime for the salsa.', 'Season shrimp with chili powder and sear 2 minutes per side.', 'Warm tortillas and let everyone build their own.'],
    contains: ['shellfish'], meat: 'fish', video: false,
  },
  {
    id: 'peanut-noodles',
    name: 'cold peanut noodles',
    tagline: 'make-ahead and good at room temperature.',
    image: foodImages['peanut-noodles'],
    hue: 30,
    effort: 1, minutes: 25, cost: 1, excitement: 3, serves: 4,
    ingredients: ['12 oz wheat noodles', '⅓ cup peanut butter', '3 tbsp soy sauce', '2 tbsp rice vinegar', 'chili crisp', 'cucumber', 'scallions'],
    steps: ['Whisk peanut butter, soy sauce, vinegar and warm water.', 'Cook noodles and rinse cold.', 'Toss with sauce and top with cucumber and scallions.'],
    contains: ['nuts', 'gluten', 'soy'], meat: 'none', video: false,
  },
  {
    id: 'apple-galette',
    name: 'free-form apple galette',
    tagline: 'rustic on purpose, so no one can say you got it wrong.',
    image: foodImages['apple-galette'],
    hue: 5,
    effort: 3, minutes: 70, cost: 2, excitement: 4, serves: 8,
    ingredients: ['1¼ cups flour', '½ cup cold butter', '1 egg', '4 apples', '⅓ cup sugar', 'cinnamon', 'lemon'],
    steps: ['Cut butter into flour, bind with ice water, chill an hour.', 'Roll out, pile on sliced apples with sugar and cinnamon, fold the edges.', 'Brush with egg and bake at 400°F for 45 minutes.'],
    contains: ['gluten', 'dairy', 'eggs'], meat: 'none', video: true,
  },
  {
    id: 'halloumi-tabbouleh',
    name: 'grilled halloumi + tabbouleh',
    tagline: 'fresh, salty, ready in half an hour.',
    image: foodImages['halloumi-tabbouleh'],
    hue: 100,
    effort: 1, minutes: 30, cost: 2, excitement: 3, serves: 4,
    ingredients: ['1 cup bulgur', '3 bunches parsley', '1 block halloumi', 'tomatoes', 'mint', 'lemon', 'olive oil'],
    steps: ['Soak the bulgur, then chop herbs and tomatoes fine.', 'Toss everything with lemon and oil.', 'Grill halloumi slices until striped and serve on top.'],
    contains: ['dairy', 'gluten'], meat: 'none', video: false,
  },
  {
    id: 'rice-bowl',
    name: 'roasted veg + rice bowls',
    tagline: 'everyone customizes. nobody argues.',
    image: foodImages['rice-bowl'],
    hue: 70,
    effort: 1, minutes: 40, cost: 1, excitement: 2, serves: 6,
    ingredients: ['2 cups rice', 'sweet potatoes', 'broccoli', 'chickpeas', 'lime', 'scallions', 'sriracha mayo'],
    steps: ['Roast vegetables and chickpeas at 425°F for 25 minutes.', 'Cook the rice.', 'Layer into bowls and add sauce.'],
    contains: ['eggs'], meat: 'none', video: false,
  },
];

export const FRIENDS: Person[] = [
  { id: 'priya', name: 'Priya Nair', blurb: 'college roommate, always brings dessert', hue: 330, diet: { allergies: ['nuts'], prefs: [] }, calendar: true },
  { id: 'jordan', name: 'Jordan Ellis', blurb: 'book club, makes a mean playlist', hue: 210, diet: { allergies: [], prefs: ['vegetarian'] }, calendar: true },
  { id: 'maya', name: 'Maya Torres', blurb: 'neighbor with the good patio', hue: 150, diet: { allergies: ['dairy'], prefs: [] }, calendar: true },
  { id: 'sam', name: 'Sam Okafor', blurb: 'coworker turned friend', hue: 40, diet: { allergies: ['shellfish'], prefs: [] }, calendar: true },
  { id: 'devon', name: 'Devon Park', blurb: 'cousin, never checks their phone', hue: 270, diet: { allergies: [], prefs: [] }, calendar: false },
  { id: 'alex', name: 'Alex Rahman', blurb: 'gym buddy, always hungry', hue: 190, diet: { allergies: [], prefs: ['halal'] }, calendar: false },
  { id: 'riley', name: 'Riley Chen', blurb: 'pottery class', hue: 90, diet: { allergies: ['gluten'], prefs: ['vegetarian'] }, calendar: true },
];

export const MY_PROFILE: Person = {
  id: ME,
  name: 'Tariq',
  blurb: 'you',
  hue: 255,
  diet: { allergies: ['soy'], prefs: ['pescatarian'] },
  calendar: true,
};

export const SLOTS: Record<Category, string[]> = {
  breakfast: ['8:00 am', '8:30 am', '9:00 am', '9:30 am', '10:00 am'],
  brunch: ['10:30 am', '11:00 am', '11:30 am', '12:00 pm', '12:30 pm'],
  lunch: ['12:00 pm', '12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm'],
  dinner: ['6:30 pm', '7:00 pm', '7:30 pm', '8:00 pm', '8:30 pm', '9:00 pm', '9:30 pm', '10:00 pm'],
};

export const recipeById = (id: string) => RECIPES.find((r) => r.id === id);

const ago = (mins: number) => Date.now() - mins * 60000;

export function seedDinners(): Dinner[] {
  const fri = nextDow(5);
  const sat = nextDow(6);
  const sat2 = nextDow(6, 1);
  const pesto = RECIPES[1];
  const risotto = RECIPES[3];
  return [
    {
      id: 'd-autumn',
      name: 'autumn supper',
      hostId: ME,
      category: 'dinner',
      time: '7:00 pm',
      shortlist: [fri, sat, sat2],
      dish: { id: pesto.id, name: pesto.name, contains: pesto.contains, meat: pesto.meat, minutes: pesto.minutes, serves: pesto.serves },
      prepMinutes: 40,
      bringMode: 'mystery',
      location: 'my place, 214 Maple St, apt 3',
      note: 'come hungry. i will handle the pasta, you handle the surprise.',
      guests: [
        { personId: 'priya', rsvp: 'accepted', votes: [sat, sat2], diet: { allergies: ['nuts'], prefs: [] }, bring: { dish: 'lemon olive oil cake', contains: ['gluten', 'eggs', 'dairy'] } },
        { personId: 'jordan', rsvp: 'accepted', votes: [fri, sat], diet: { allergies: [], prefs: ['vegetarian'] } },
        { personId: 'maya', rsvp: 'pending', votes: [], diet: { allergies: ['dairy'], prefs: [] } },
        { personId: 'sam', rsvp: 'declined', votes: [], diet: { allergies: ['shellfish'], prefs: [] }, declineNote: 'out of town that weekend, next time!' },
        { personId: 'devon', rsvp: 'pending', votes: [], diet: { allergies: [], prefs: [] } },
      ],
      comments: [
        { id: 'c1', personId: 'jordan', text: 'i can do either of the first two dates. saturday is easier for me.', at: ago(190) },
        { id: 'c2', personId: 'priya', text: 'saturday works! bringing something sweet.', at: ago(75) },
      ],
      createdAt: ago(60 * 26),
    },
    {
      id: 'd-risotto',
      name: "jordan's risotto night",
      hostId: 'jordan',
      category: 'dinner',
      time: '7:30 pm',
      shortlist: [nextDow(6), nextDow(0, 1)],
      dish: { id: risotto.id, name: risotto.name, contains: risotto.contains, meat: risotto.meat, minutes: risotto.minutes, serves: risotto.serves },
      prepMinutes: 55,
      bringMode: 'potluck',
      location: "jordan's place, 88 Elm Ave",
      note: 'i will make the risotto. bring a side, a drink, or a dessert.',
      guests: [
        { personId: ME, rsvp: 'pending', votes: [], diet: { allergies: ['soy'], prefs: ['pescatarian'] } },
        { personId: 'priya', rsvp: 'accepted', votes: [nextDow(6)], diet: { allergies: ['nuts'], prefs: [] } },
        { personId: 'riley', rsvp: 'accepted', votes: [nextDow(0, 1)], diet: { allergies: ['gluten'], prefs: ['vegetarian'] }, bring: { dish: 'roasted carrots', contains: [] } },
        { personId: 'maya', rsvp: 'pending', votes: [], diet: { allergies: ['dairy'], prefs: [] } },
      ],
      comments: [],
      createdAt: ago(60 * 5),
    },
    {
      id: 'd-brunch',
      name: "priya's birthday brunch",
      hostId: 'priya',
      category: 'brunch',
      time: '11:00 am',
      shortlist: [iso(addDays(today(), 16))],
      confirmedDate: iso(addDays(today(), 16)),
      dish: { name: 'baked french toast + fruit', contains: ['gluten', 'eggs', 'dairy'], meat: 'none', minutes: 60, serves: 8 },
      prepMinutes: 60,
      bringMode: 'host',
      location: "priya's apartment, 12 Orchard Ln",
      note: 'no gifts, just come.',
      guests: [
        { personId: ME, rsvp: 'accepted', votes: [iso(addDays(today(), 16))], diet: { allergies: ['soy'], prefs: ['pescatarian'] } },
        { personId: 'jordan', rsvp: 'accepted', votes: [], diet: { allergies: [], prefs: ['vegetarian'] } },
        { personId: 'sam', rsvp: 'accepted', votes: [], diet: { allergies: ['shellfish'], prefs: [] } },
      ],
      comments: [{ id: 'c3', personId: 'priya', text: 'mimosas are on me.', at: ago(60 * 30) }],
      createdAt: ago(60 * 24 * 9),
    },
    {
      id: 'd-housewarming',
      name: 'housewarming',
      hostId: ME,
      category: 'dinner',
      time: '7:00 pm',
      shortlist: [iso(addDays(today(), -21))],
      confirmedDate: iso(addDays(today(), -21)),
      dish: { name: 'harissa chicken + chickpeas', contains: [], meat: 'meat', minutes: 45, serves: 4 },
      prepMinutes: 55,
      bringMode: 'byob',
      location: 'my place',
      note: '',
      guests: [
        { personId: 'priya', rsvp: 'accepted', votes: [], diet: { allergies: ['nuts'], prefs: [] }, bring: { dish: 'a bottle of red', contains: [] } },
        { personId: 'jordan', rsvp: 'accepted', votes: [], diet: { allergies: [], prefs: ['vegetarian'] } },
        { personId: 'maya', rsvp: 'accepted', votes: [], diet: { allergies: ['dairy'], prefs: [] } },
        { personId: 'sam', rsvp: 'accepted', votes: [], diet: { allergies: ['shellfish'], prefs: [] } },
      ],
      comments: [],
      createdAt: ago(60 * 24 * 40),
    },
  ];
}

export function seedNotices(): Notice[] {
  return [
    { id: 'n1', text: "jordan invited you to jordan's risotto night. respond to vote on dates.", at: ago(60 * 5), read: false, to: '/rsvp/d-risotto' },
    { id: 'n2', text: 'Priya voted on autumn supper dates.', at: ago(75), read: false, to: '/dinner/d-autumn' },
    { id: 'n3', text: "Sam can't make autumn supper. You can invite someone else.", at: ago(60 * 20), read: false, to: '/dinner/d-autumn' },
    { id: 'n4', text: 'No reply yet from Maya and Devon for autumn supper.', at: ago(60 * 23), read: true, to: '/dinner/d-autumn' },
    { id: 'n5', text: "Reminder: priya's birthday brunch is coming up.", at: ago(60 * 48), read: true, to: '/dinner/d-brunch' },
  ];
}
