# Nuputaja

A calm browser app for practising the logic and maths puzzles used in Estonian pre-school homework and in the kinds of tasks that show up in 1st-grade school-readiness checks. It is built for Mia (age 7, Tallinn). Estonian is the language she practises in. English is one tap away so a parent can follow.

The puzzle sheet stays close to a paper worksheet: cream paper, black lines, boxes, circling and joining. Colour and the sticker book live in the frame around that sheet.

Nothing is sent anywhere. Progress and the sticker album stay in `localStorage` on the device. There is no account and no analytics.

## Run it

```bash
npm test
npm start
```

`npm start` serves the folder at <http://localhost:4173>. Open that address on a phone or tablet, or use the browser’s device toolbar. A plain static server works too:

```bash
python3 -m http.server 4173
```

Do not open `index.html` as a file. The app is a set of ES modules, so it needs HTTP.

## Puzzle types

Each type is generated from a seed, checked before it is shown, and has five levels. A practice session is about six short puzzles: a new type starts with a worked example and a guided one, then known types are mixed. The level moves up after 4 of the last 5 clean solves and steps back after three struggles.

| Type | What Mia does |
|---|---|
| Puuduv arv | Write the missing number on a line, or the neighbour before and after. |
| Liitmine ja lahutamine | Add and subtract within 5, then 10, 12 and 20, including a missing number and matching a sum to its answer. |
| Võrdlemine | More, fewer, or the same, with pictures and with numerals. |
| Arvu koostis | Number bonds of 5, 10 and 12, and pairs that make a target. |
| Mustrid | Continue a colour or shape pattern, including a pattern she builds herself. |
| Mis ei sobi | Odd one out, with a reason at the last level, and sorting into two boxes. |
| Asukohasõnad | On, under, left, right, above, in front, behind, and a short step on a grid. Left and right are from the child’s side of the screen. |
| Kujundid | Circle, triangle, square, rectangle, sphere and cube. |
| Paarid | Join matching pictures, things that belong together, shadows, and sums with answers. |
| Jutuke | A short picture story: some arrive, some leave, or a two-step story. |
| Lühimälu | Remember a short row of pictures, what disappeared, or which ones were animals. |
| Kuula ja tee | Listen, then colour or circle. |
| Arvupüramiid | Three-level addition pyramids, then a four-level one. Every puzzle is unique and can be filled one box at a time, including by subtracting. |
| Sudoku | 2×2 picture sudoku, then 4×4 with pictures or the numbers 1–4, including the 2×2 blocks. Only puzzles that can be solved by looking at a row, column or block are kept. |
| Sõnaloogika | Who is taller, and who has which hat or stands where, from a few spoken clues. |
| Labürint | A wide path home, then paths that stay on even numbers or on circles. |
| Peegelpilt | Choose or tap the reflection across a vertical line, then a horizontal one. |
| Järjestamine | Shortest to longest, yesterday–today–tomorrow, weekdays, seasons, months. |
| Analoogiad | Picture pairs, then a simple number link. |
| Puuduv kujund | A small grid with one missing shape. |
| Kell | Hours, then half hours. Estonian uses *kell on kolm* and *pool kaks* (1:30). |
| Raha | 1€ and 2€ coins, small totals, “is there enough?”, cents, and change from 10 euros. |

Instructions use the short imperative style of Estonian worksheets (*Kirjuta*, *Ühenda*, *Tõmba ring ümber*, *Leia*, *Järjesta*). The speaker button reads the instruction. If the device has an Estonian voice it is used; otherwise an English voice reads the same text. If speech is unavailable, the words stay on the page.

## Stickers

A sticker is added to the album when a short session is finished, and a level pip is filled when a type is mastered. Stickers are not given for each tap, and they are never taken away. When the 24-sticker album is full, a finished session adds a gold star instead.

## Deploy on GitHub Pages

The site is static. `.github/workflows/pages.yml` runs the tests and deploys the repository root with GitHub Actions.

In the repository on GitHub:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main`. The Pages workflow runs the tests, then publishes the site.

The address will look like `https://<user>.github.io/<repository>/`. Paths are relative, so a project site works without a build step.

The service worker cache is named `nuputaja-v1`. Raise that name in `sw.js` when you ship a change you want already-installed phones to pick up. Pages also loads HTML from the network first, so an open online phone gets the new page and then the new files.

A private repository may need GitHub Pages enabled for private sites (this depends on the account plan). The workflow does not change repository settings for you.
