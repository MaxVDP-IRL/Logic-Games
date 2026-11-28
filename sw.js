const VERSION = "nuputaja-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./js/app.js",
  "./js/content.js",
  "./js/i18n.js",
  "./js/icons.js",
  "./js/progress.js",
  "./js/render.js",
  "./js/rng.js",
  "./js/session.js",
  "./js/speech.js",
  "./js/stickers.js",
  "./js/storage.js",
  "./js/puzzles/analogy.js",
  "./js/puzzles/arithmetic.js",
  "./js/puzzles/bonds.js",
  "./js/puzzles/clock.js",
  "./js/puzzles/compare.js",
  "./js/puzzles/index.js",
  "./js/puzzles/listen.js",
  "./js/puzzles/matching.js",
  "./js/puzzles/matrix.js",
  "./js/puzzles/maze.js",
  "./js/puzzles/memory.js",
  "./js/puzzles/mirror.js",
  "./js/puzzles/missing.js",
  "./js/puzzles/money.js",
  "./js/puzzles/oddone.js",
  "./js/puzzles/order.js",
  "./js/puzzles/patterns.js",
  "./js/puzzles/position.js",
  "./js/puzzles/pyramid.js",
  "./js/puzzles/shapes.js",
  "./js/puzzles/signs.js",
  "./js/puzzles/stories.js",
  "./js/puzzles/sudoku.js",
  "./js/puzzles/util.js",
  "./js/puzzles/variety.js",
  "./js/puzzles/wordlogic.js",
  "./assets/art/odd-one-out/apple.svg",
  "./assets/art/odd-one-out/banana.svg",
  "./assets/art/odd-one-out/bee.svg",
  "./assets/art/odd-one-out/bicycle.svg",
  "./assets/art/odd-one-out/bird.svg",
  "./assets/art/odd-one-out/boat.svg",
  "./assets/art/odd-one-out/bus.svg",
  "./assets/art/odd-one-out/butterfly.svg",
  "./assets/art/odd-one-out/car.svg",
  "./assets/art/odd-one-out/carrot.svg",
  "./assets/art/odd-one-out/cat.svg",
  "./assets/art/odd-one-out/cow.svg",
  "./assets/art/odd-one-out/dog.svg",
  "./assets/art/odd-one-out/fish.svg",
  "./assets/art/odd-one-out/grapes.svg",
  "./assets/art/odd-one-out/hat.svg",
  "./assets/art/odd-one-out/hen.svg",
  "./assets/art/odd-one-out/horse.svg",
  "./assets/art/odd-one-out/jacket.svg",
  "./assets/art/odd-one-out/mitten.svg",
  "./assets/art/odd-one-out/orange.svg",
  "./assets/art/odd-one-out/pear.svg",
  "./assets/art/odd-one-out/pig.svg",
  "./assets/art/odd-one-out/plane.svg",
  "./assets/art/odd-one-out/rabbit.svg",
  "./assets/art/odd-one-out/sheep.svg",
  "./assets/art/odd-one-out/sock.svg",
  "./assets/art/odd-one-out/strawberry.svg",
  "./assets/art/odd-one-out/train.svg",
  "./assets/art/mirror/butterfly-left-half.svg",
  "./assets/art/mirror/butterfly-right-half.svg",
  "./assets/art/mirror/cat-face-left-half.svg",
  "./assets/art/mirror/cat-face-right-half.svg",
  "./assets/art/mirror/heart-left-half.svg",
  "./assets/art/mirror/heart-right-half.svg",
  "./assets/art/mirror/house-left-half.svg",
  "./assets/art/mirror/house-right-half.svg",
  "./assets/art/mirror/rocket-left-half.svg",
  "./assets/art/mirror/rocket-right-half.svg",
  "./assets/art/mirror/tree-left-half.svg",
  "./assets/art/mirror/tree-right-half.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const navigation = request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if (navigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put("./index.html", copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
