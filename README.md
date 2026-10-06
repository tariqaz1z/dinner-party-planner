# crumb: Dinner Party Planner

Mobile-first responsive web app built from `Dinner_Party_Planner_Plan.docx`. It plans one dinner party at a time: create the dinner, find the best date with the availability heatmap, collect RSVPs and dietary needs, and show the confirmed plan. "crumb" is a working title (see `APP_NAME` in `src/data.ts`).

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production build
```

All data is fictional and stored in `localStorage` (key `crumb-v1`). Profile → "reset demo data" restores the starting state.

## Where each part of the plan lives

| Plan part | Code |
| --- | --- |
| 3 Structure + navigation (floating pill nav, Add button, search, notifications) | `components/Layout.tsx`, `pages/Simple.tsx` |
| 3 Home / Recipe of the Day, Cookbook, Profile | `pages/Simple.tsx`, `pages/Profile.tsx`, `components/RecipeBits.tsx` |
| 4 Host flow (7 steps) | `pages/Host.tsx` |
| 5 Availability heatmap + day sheet + shortlist | `components/Heatmap.tsx`, `lib/availability.ts` |
| 6 Guest RSVP (ticket, respond, break bread, decline) | `pages/Rsvp.tsx`, `components/Ticket.tsx`, `components/Bread.tsx` |
| 7 Dinner page, confirm date, invite more, comments, plan the next one | `pages/Dinner.tsx` |
| 8 Dietary safety rules | `components/DietTags.tsx`, `lib/diet.ts` |
| 9 Visual direction (tokens, fonts, stickers, stacked cards) | `styles.css`, `components/Starburst.tsx`, `components/Logo.tsx` |
| 10 Accessibility | throughout, see below |
| 11 Voice and tone | lowercase UI copy; allergy warnings in plain sentence case |

## Trying the flows

- **Host:** tap the pink **+** button (or "host a dinner with this" on any recipe). Pick friends with different allergies to see warnings. Step 3 is the heatmap: tap a day, add two to four to the shortlist.
- **Dish conflicts:** "autumn supper" on the Calendar tab is a seeded dinner with a pesto dish that conflicts with two guests.
- **Guest:** open the bell. "jordan's risotto night" has an invite waiting for you (route `#/rsvp/d-risotto`). Open your own dinner's `#/rsvp/<id>` to preview the guest screens. A dinner opened by someone who is neither host nor invited is treated as a link guest and asked for a name.
- **Confirm a date:** open a dinner you host and tap "confirm this date".
- **Plan the next one:** Profile → Past dinners → "housewarming".

## Accessibility notes

- Visible labels on every input; no placeholder-only fields. Secondary text is `#5C5C66` on `#F6F6F8` (about 6:1).
- Allergies: solid red, warning icon, the word "allergy", bold border. Preferences: outlined pill. Red (`#B3261E`) is used for nothing else, including error messages.
- Heatmap days carry a count and a full spoken label; month arrows are provided alongside swipe; unknown calendars are never counted as busy; day text flips to white on dark shades automatically.
- Selected items are filled black or get a thick border plus a check mark.
- Breaking bread has a single "accept" button alternative. Floating objects, the bottom sheet and the bread animation stop under `prefers-reduced-motion`.
- Focus moves to the page content or step title on navigation; skip link; 44px minimum targets (calendar cells are about 48px on a 375px phone and slightly smaller below 330px).

## Known limits

- Data is local to one browser, so the "share link" only opens in the browser that created the dinner. A backend is the next step.
- Calendar availability is generated from a seeded formula (Friday and Saturday evenings are open; weekdays are busy), not a real calendar integration.
- Notifications are local; nothing is actually sent.
- Recipes, profile avatars, and welcome-screen objects use locally bundled generated artwork. Full prompts and asset provenance are in `src/assets/illustrations/PROMPTS.md`. The video guide link opens a YouTube search.
