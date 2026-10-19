# Overlog

[![Tests and deploy](https://github.com/ViniciuscLemos/overlog/actions/workflows/deploy.yml/badge.svg)](https://github.com/ViniciuscLemos/overlog/actions/workflows/deploy.yml)

Gym log I'm making for myself. Progressive overload + log.

It's live at https://viniciusclemos.github.io/overlog/. On the phone you can add it to the home screen and it works offline.

<p>
  <img src="docs/library.png" alt="The exercise list with search, equipment filter and a drawing of each exercise" width="300">
  <img src="docs/exercise.png" alt="The bench press page with drawings of the start and end of the movement" width="300">
  <img src="docs/studies.png" alt="The studies tab: what each paper found, in Portuguese, with a link to it" width="300">
</p>

## Why

I write down every set I do. The apps I tried were either paywalled (Hevy's free plan only saves 4 routines, so no ABCDE), needed internet in the gym, or were full of badges and streaks I don't care about.

Muscle grows when you train close to failure and keep adding weight or reps, so I'm building the app around that. Every set will have weight, reps and RIR (reps left in the tank), next to what you did last time.

## What's there now

269 exercises with line drawings of the start and end of each movement (I didn't want photos). 236 already have the name we use in Brazilian gyms, like supino reto or remada cavalinho, and the search ignores accents and word order. Words like "rosca" or "halter" also find the ones that are still in English.

In the Workouts tab you set up your split, as many workouts as you want. They go in rotation instead of being tied to weekdays, so a 4-day upper/lower doesn't need to be Monday to Thursday. Each exercise starts at 2 sets of 5-9 reps with 3 min rest and you can change all of it, plus a note for stuff like seat height. It also counts sets per muscle.

There's a Studies tab too with the papers I based the app on (failure, progression, volume, rest, protein...), summarized in Portuguese with the links. I checked every DOI.

Everything stays on the phone in IndexedDB, no account.

## Next

Logging the workout (weight, reps, RIR), a suggestion for next time, and history with a chart per exercise. Then rest timer, custom exercises and backup. The exercises without a drawing will get a black and white muscle map in the same style.

## Running it

```bash
npm install
npm run dev
npm test
```

`scripts/import-exercises.mjs` builds the exercise list from Everkinetic's data (instructions at the top of the file). Portuguese names are in `scripts/names-pt.json`.

## Credits

Exercises and drawings by [Everkinetic](https://github.com/everkinetic/data), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The drawings load from their repo, and `src/data/exercises.json` keeps that license since it's made from their data. The rest is MIT.
