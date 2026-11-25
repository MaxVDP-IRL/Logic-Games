import { tx, txf } from "./i18n.js";
import { loadProgress, saveProgress } from "./storage.js";
import { speak, stopSpeech } from "./speech.js";
import { planSession, SESSION_SIZE } from "./session.js";
import { TYPE_ORDER, metaOf, grade } from "./puzzles/index.js";
import { generateFresh } from "./puzzles/variety.js";
import { levelOf, recordResult, levelTrack } from "./progress.js";
import { mount } from "./render.js";
import { SETS, STICKERS, awardSessionSticker } from "./stickers.js";
import { icon, foxBadge } from "./icons.js";

const state = loadProgress();
let route = { name: "home" };
let session = null;
let mounted = null;
let misses = 0;
let solvedCount = 0;
let startedAt = 0;
let levelUps = [];
let locked = false;
let clockTimer = null;
const recentByType = {};

const app = document.querySelector("#app");

function L() {
  return state.lang === "en" ? "en" : "et";
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function save() {
  saveProgress(state);
}

function go(next) {
  route = next;
  draw();
}

function draw() {
  stopSpeech();
  if (mounted) {
    mounted.destroy();
    mounted = null;
  }
  clearInterval(clockTimer);
  app.innerHTML = "";
  app.append(header());
  const main = document.createElement("main");
  main.append(body());
  app.append(main);
  document.documentElement.lang = L() === "en" ? "en" : "et";
  wire();
  if (route.name === "play") armSpeech();
}

function header() {
  const bar = document.createElement("header");
  bar.className = "top";
  bar.innerHTML = `
    <button class="iconbtn" data-go="home" aria-label="${tx("home", L())}"><img src="icons/icon.svg" width="40" height="40" alt=""></button>
    <div class="brand">Nuputaja</div>
    <div class="spacer"></div>
    <div class="quiet" data-clock hidden></div>
    <div class="langswitch" role="group" aria-label="ET EN">
      <button type="button" data-set-lang="et" class="${L() === "et" ? "on" : ""}">ET</button>
      <button type="button" data-set-lang="en" class="${L() === "en" ? "on" : ""}">EN</button>
    </div>
    <button class="iconbtn" data-go="book" aria-label="${tx("stickers", L())}">
      ${icon("book", { size: 32 })}
      <span class="count">${state.stickers.length}</span>
    </button>`;
  return bar;
}

function body() {
  if (route.name === "types") return typesView();
  if (route.name === "book") return bookView();
  if (route.name === "play") return playView();
  if (route.name === "celebrate") return celebrateView();
  if (route.name === "bye") return byeView();
  return homeView();
}

function homeView() {
  const view = document.createElement("section");
  view.className = "home";
  view.innerHTML = `
    <article class="hero">
      <h1>${tx("hello", L())}</h1>
      <p>${txf("stickerGoal", L(), { n: SESSION_SIZE })}</p>
      <button class="btn primary" data-start>${tx("start", L())}</button>
    </article>
    <div class="home-row">
      <button class="btn" data-go="types">${tx("pick", L())}</button>
      <button class="btn" data-go="book">${tx("stickers", L())}</button>
    </div>
    <p class="parent">${tx("parent", L())}</p>`;
  return view;
}

function typesView() {
  const view = document.createElement("section");
  view.className = "types";
  const title = document.createElement("h2");
  title.style.color = "#fbf6ea";
  title.style.fontFamily = "Georgia, serif";
  title.textContent = tx("typesTitle", L());
  view.append(title);
  const list = document.createElement("div");
  list.className = "type-list";
  TYPE_ORDER.forEach((id) => {
    const meta = metaOf(id);
    const card = document.createElement("div");
    card.className = "type-card";
    const name = document.createElement("strong");
    name.textContent = meta.name[L()];
    const blurb = document.createElement("span");
    blurb.textContent = meta.blurb[L()];
    const levels = document.createElement("div");
    levels.className = "lv";
    const current = levelOf(state, id);
    for (let n = 1; n <= 5; n++) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = String(n);
      b.className = n === current ? "on" : "";
      b.addEventListener("click", () => startFree(id, n));
      levels.append(b);
    }
    card.append(name, blurb, levels);
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      startFree(id, current);
    });
    list.append(card);
  });
  view.append(list);
  return view;
}

function bookView() {
  const view = document.createElement("section");
  view.className = "book";
  const h = document.createElement("h2");
  h.textContent = tx("stickers", L());
  view.append(h);
  if (!state.stickers.length) {
    const p = document.createElement("p");
    p.className = "parent";
    p.textContent = tx("emptyBook", L());
    view.append(p);
  }
  if (state.bonusStars) {
    const stars = document.createElement("p");
    stars.className = "parent";
    stars.textContent = `${tx("bookFull", L())} × ${state.bonusStars}`;
    view.append(stars);
  }
  SETS.forEach((set) => {
    const title = document.createElement("h3");
    title.className = "set-title";
    title.textContent = set[L()];
    const grid = document.createElement("div");
    grid.className = "album";
    STICKERS.filter((s) => s.set === set.id).forEach((sticker, i) => {
      const earned = state.stickers.includes(sticker.id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = earned ? "sticker" : "sticker ghost";
      card.style.setProperty("--tilt", `${(i % 2 === 0 ? -2 : 2)}deg`);
      if (earned) card.style.background = sticker.bg;
      card.innerHTML = earned ? icon(sticker.icon, { size: 48 }) : "";
      const name = document.createElement("span");
      name.textContent = sticker[L()];
      card.append(name);
      card.addEventListener("click", () => speak(sticker[L()], L()));
      grid.append(card);
    });
    view.append(title, grid);
  });
  const badges = document.createElement("div");
  badges.className = "badges";
  TYPE_ORDER.forEach((id) => {
    const lvl = levelOf(state, id);
    const row = document.createElement("div");
    row.className = "badge-row";
    const name = document.createElement("span");
    name.textContent = metaOf(id).name[L()];
    const pips = document.createElement("span");
    pips.className = "pips";
    pips.textContent = "●".repeat(lvl) + "○".repeat(5 - lvl);
    row.append(name, pips);
    badges.append(row);
  });
  view.append(badges);
  return view;
}

function celebrateView() {
  const view = document.createElement("section");
  view.className = "home celebrate";
  const total = route.total || SESSION_SIZE;
  view.append(filledMeter(total));
  const doneLine = document.createElement("p");
  doneLine.className = "goal-line";
  const doneKey = route.award?.star ? "sessionDoneStar" : "sessionDone";
  doneLine.textContent = txf(doneKey, L(), { n: total });
  view.append(doneLine);
  const h = document.createElement("h2");
  h.textContent = route.praise;
  view.append(h);
  if (state.autoRead) speak(doneLine.textContent, L());
  if (route.award?.sticker) {
    const card = document.createElement("div");
    card.className = "sticker pop big-sticker";
    card.style.background = route.award.sticker.bg;
    card.innerHTML = icon(route.award.sticker.icon, { size: 96 });
    const name = document.createElement("span");
    name.textContent = route.award.sticker[L()];
    card.append(name);
    const line = document.createElement("p");
    line.textContent = tx("newSticker", L());
    view.append(card, line);
  } else if (route.award?.star) {
    const line = document.createElement("p");
    line.textContent = tx("bookFull", L());
    view.append(line);
  }
  (route.levelUps || []).forEach((up) => {
    const p = document.createElement("p");
    p.textContent = `${tx("levelUp", L())}: ${metaOf(up.type).name[L()]} ${up.level}`;
    view.append(p);
  });
  const more = document.createElement("button");
  more.className = "btn primary";
  more.textContent = tx("oneMore", L());
  more.addEventListener("click", () => {
    const known = TYPE_ORDER.filter((id) => (state.solved[id] || 0) > 0);
    const type = known[0] || "missing";
    startFree(type, levelOf(state, type), { returnHome: true });
  });
  const enough = document.createElement("button");
  enough.className = "btn ghost";
  enough.textContent = tx("enough", L());
  enough.addEventListener("click", () => go({ name: "home" }));
  const book = document.createElement("button");
  book.className = "btn ghost";
  book.textContent = tx("stickers", L());
  book.addEventListener("click", () => go({ name: "book" }));
  view.append(more, enough, book);
  return view;
}

function byeView() {
  const view = document.createElement("section");
  view.className = "home";
  const card = document.createElement("article");
  card.className = "hero";
  card.innerHTML = `<h1>${tx("bye", L())}</h1>`;
  const home = document.createElement("button");
  home.className = "btn primary";
  home.textContent = tx("home", L());
  home.addEventListener("click", () => go({ name: "home" }));
  card.append(home);
  view.append(card);
  return view;
}

function textLine(className, et, en) {
  const node = document.createElement("span");
  node.className = className;
  node.dataset.et = et;
  node.dataset.en = en;
  node.textContent = L() === "en" ? en : et;
  return node;
}

function filledMeter(total) {
  const box = document.createElement("div");
  box.className = "meter";
  const row = document.createElement("div");
  row.className = "meter-row";
  const dots = document.createElement("div");
  dots.className = "dots";
  for (let i = 0; i < total; i++) {
    const mark = document.createElement("i");
    mark.className = "done";
    dots.append(mark);
  }
  const count = document.createElement("span");
  count.className = "count";
  count.textContent = `${total} / ${total}`;
  const star = document.createElement("span");
  star.className = "meter-star";
  star.innerHTML = icon("star", { size: 28 });
  row.append(textLine("tag", tx("meterSticker", "et"), tx("meterSticker", "en")), dots, count, star);
  box.append(row);
  return box;
}

function levelMeter(item) {
  const track = levelTrack(state, item.type);
  const row = document.createElement("div");
  row.className = "meter-row level";
  row.dataset.levelMeter = "1";
  const pips = document.createElement("div");
  pips.className = "dots";
  pips.dataset.levelPips = "1";
  for (let i = 1; i <= 5; i++) {
    const mark = document.createElement("i");
    if (i <= track.level) mark.className = "done";
    pips.append(mark);
  }
  row.append(textLine("tag", tx("meterLevel", "et"), tx("meterLevel", "en")), pips);
  if (track.goal) {
    const sub = document.createElement("div");
    sub.className = "dots sub";
    sub.dataset.levelSub = "1";
    for (let i = 0; i < track.goal; i++) {
      const mark = document.createElement("i");
      if (i < track.have) mark.className = "done";
      sub.append(mark);
    }
    const count = document.createElement("span");
    count.className = "count";
    count.dataset.levelCount = "1";
    count.textContent = `${track.have} / ${track.goal}`;
    row.append(sub, count);
  }
  return row;
}

function sessionMeter(item) {
  const total = session.items.length;
  const done = session.index;
  const box = document.createElement("div");
  box.className = "meter";
  const row = document.createElement("div");
  row.className = "meter-row";
  const dots = document.createElement("div");
  dots.className = "dots";
  dots.dataset.sessionMeter = "1";
  session.items.forEach((it, i) => {
    const mark = document.createElement("i");
    if (i < done) mark.className = "done";
    else if (i === done) mark.className = "on";
    if (it.mode === "example") mark.classList.add("star");
    dots.append(mark);
  });
  const count = document.createElement("span");
  count.className = "count";
  count.dataset.sessionCount = "1";
  count.textContent = `${done} / ${total}`;
  const star = document.createElement("span");
  star.className = "meter-star";
  star.innerHTML = icon("star", { size: 22 });
  row.append(textLine("tag", tx("meterSticker", "et"), tx("meterSticker", "en")), dots, count, star);
  box.append(row);
  if (done === 0) {
    const line = document.createElement("p");
    line.className = "goal-line";
    const et = txf("stickerGoal", "et", { n: total });
    const en = txf("stickerGoal", "en", { n: total });
    line.dataset.et = et;
    line.dataset.en = en;
    line.textContent = L() === "en" ? en : et;
    box.append(line);
  }
  box.append(levelMeter(item));
  return box;
}

function syncMeters() {
  if (session && route.source === "session") {
    const shown = session.index + (locked ? 1 : 0);
    app.querySelectorAll("[data-session-meter] i").forEach((mark, i) => {
      mark.classList.toggle("done", i < shown);
      mark.classList.toggle("on", i === session.index && !locked);
    });
    const count = app.querySelector("[data-session-count]");
    if (count) count.textContent = `${Math.min(shown, session.items.length)} / ${session.items.length}`;
  }
  const host = app.querySelector("[data-level-meter]");
  if (!host || route.name !== "play") return;
  host.replaceWith(levelMeter(currentItem()));
}

function playView() {
  const item = currentItem();
  const meta = metaOf(item.type);
  const view = document.createElement("section");
  view.className = "stage";
  const meter = route.source === "session" && session ? sessionMeter(item) : levelMeter(item);
  const sheet = document.createElement("article");
  sheet.className = "sheet";
  const kicker = document.createElement("p");
  kicker.className = "kicker";
  const modeLabel = item.mode === "example" ? tx("example", L()) : item.mode === "guided" ? tx("guided", L()) : meta.name[L()];
  kicker.textContent = `${modeLabel} · ${tx("level", L())} ${item.level}`;
  const prompt = document.createElement("div");
  prompt.className = "prompt";
  const listen = document.createElement("button");
  listen.type = "button";
  listen.className = "speak";
  listen.textContent = tx("listen", L());
  listen.addEventListener("click", () => armSpeech(true));
  const words = document.createElement("div");
  words.className = "words";
  words.dataset.et = item.puzzle.prompt.et;
  words.dataset.en = item.puzzle.prompt.en;
  fillWords(words, item.puzzle.prompt[L()]);
  prompt.append(listen, words);
  const task = document.createElement("div");
  task.className = "task";
  if (item.mode === "example") {
    const banner = document.createElement("p");
    banner.className = "banner";
    banner.dataset.et = item.puzzle.explain.et;
    banner.dataset.en = item.puzzle.explain.en;
    banner.textContent = item.puzzle.explain[L()];
    sheet.append(kicker, prompt, banner, task);
  } else sheet.append(kicker, prompt, task);
  const dock = document.createElement("div");
  dock.className = "dock";
  const note = document.createElement("div");
  note.className = "note";
  note.hidden = true;
  note.innerHTML = `${foxBadge(40)}<p></p>`;
  const actions = document.createElement("div");
  actions.className = "actions";
  if (item.mode !== "example") {
    const hint = document.createElement("button");
    hint.className = "btn";
    hint.textContent = tx("hint", L());
    hint.addEventListener("click", () => showNote(item.puzzle.hint, "help"));
    actions.append(hint);
  }
  const done = document.createElement("button");
  done.className = "btn primary";
  done.textContent = item.mode === "example" ? tx("try", L()) : tx("done", L());
  done.addEventListener("click", () => {
    if (item.mode === "example" || locked) advance();
    else if (done.dataset.skip === "1") revealAndContinue(item);
    else submit();
  });
  actions.append(done);
  const quit = document.createElement("button");
  quit.className = "btn ghost";
  quit.textContent = tx("quit", L());
  quit.addEventListener("click", () => {
    if (route.source === "session") go({ name: "bye" });
    else go({ name: route.returnHome ? "home" : "types" });
  });
  dock.append(note, actions, quit);
  view.append(meter, sheet, dock);
  mounted = mount(task, item.puzzle, {
    lang: L(),
    mode: item.mode,
    onPick: (answer) => submit(answer),
  });
  locked = false;
  misses = 0;
  return view;
}

function currentItem() {
  if (route.source === "free") return route.item;
  return session.items[session.index];
}

function wire() {
  app.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => go({ name: btn.dataset.go === "home" ? "home" : btn.dataset.go }));
  });
  app.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.setLang));
  });
  const start = app.querySelector("[data-start]");
  if (start) start.addEventListener("click", startSession);
  if (route.name === "play") {
    const clock = app.querySelector("[data-clock]");
    const tick = () => {
      const mins = Math.floor((Date.now() - startedAt) / 60000);
      if (mins >= 1) {
        clock.hidden = false;
        clock.textContent = `${mins} ${tx("minutes", L())}`;
      }
    };
    tick();
    clockTimer = setInterval(tick, 15000);
  }
}

function setLanguage(next) {
  if (next !== "et" && next !== "en") return;
  state.lang = next;
  save();
  if (route.name === "play" && mounted) {
    document.documentElement.lang = next === "en" ? "en" : "et";
    app.querySelectorAll("[data-et]").forEach((node) => {
      node.textContent = next === "en" ? node.dataset.en : node.dataset.et;
    });
    app.querySelectorAll("[data-set-lang]").forEach((btn) => btn.classList.toggle("on", btn.dataset.setLang === next));
    const item = currentItem();
    const words = app.querySelector(".prompt .words");
    if (words) fillWords(words, item.puzzle.prompt[next]);
    const kicker = app.querySelector(".kicker");
    if (kicker) {
      const meta = metaOf(item.type);
      const modeLabel = item.mode === "example" ? tx("example", next) : item.mode === "guided" ? tx("guided", next) : meta.name[next];
      kicker.textContent = `${modeLabel} · ${tx("level", next)} ${item.level}`;
    }
    app.querySelectorAll(".dock .btn").forEach((btn) => {
      if (btn.classList.contains("primary")) {
        if (locked) btn.textContent = tx("next", next);
        else if (btn.dataset.skip === "1") btn.textContent = tx("show", next);
        else btn.textContent = item.mode === "example" ? tx("try", next) : tx("done", next);
      } else if (!btn.classList.contains("ghost")) btn.textContent = tx("hint", next);
      else btn.textContent = tx("quit", next);
    });
    mounted.setLang(next);
    return;
  }
  draw();
}

function startSession() {
  session = planSession(state, Date.now() >>> 0, today());
  session.index = 0;
  startedAt = Date.now();
  solvedCount = 0;
  levelUps = [];
  route = { name: "play", source: "session" };
  draw();
}

function startFree(type, level, extra = {}) {
  const seen = Boolean(state.seen[type]);
  const item = {
    type,
    level,
    mode: seen ? "solo" : "example",
    puzzle: freshPuzzle(type, level),
  };
  session = null;
  startedAt = Date.now();
  route = { name: "play", source: "free", item, ...extra };
  draw();
}

function freshPuzzle(type, level) {
  const recent = recentByType[type] || [];
  const seed = (Date.now() + recent.length * 97) >>> 0;
  const { puzzle, key } = generateFresh(type, level, seed || 1, recent);
  recentByType[type] = recent.concat(key).slice(-8);
  return puzzle;
}

function submit(answer) {
  if (locked) return;
  const item = currentItem();
  if (item.mode === "example") return;
  const given = answer === undefined ? mounted.getAnswer() : answer;
  const ok = grade(item.puzzle, given);
  if (ok) {
    locked = true;
    showNote(item.puzzle.praise, "good");
    if (item.mode === "solo" || item.mode === "guided") {
      state.seen[item.type] = true;
      if (item.mode === "solo") {
        const clean = misses < 2;
        const res = recordResult(state, item.type, item.level, clean, today());
        if (res.leveledUp) levelUps.push({ type: item.type, level: res.level });
        if (clean) solvedCount += 1;
      }
      save();
    }
    const done = app.querySelector(".dock .btn.primary");
    if (done) done.textContent = tx("next", L());
    syncMeters();
    speak(item.puzzle.praise[L()], L());
    return;
  }
  misses += 1;
  showNote(misses >= 2 ? item.puzzle.nudge : item.puzzle.hint, "help");
  if (misses >= 2 && mounted?.revealStep) mounted.revealStep();
  if (misses >= 3) offerSkip();
}

function offerSkip() {
  const done = app.querySelector(".dock .btn.primary");
  if (!done || done.dataset.skip) return;
  done.dataset.skip = "1";
  done.textContent = tx("show", L());
}

function revealAndContinue(item) {
  if (locked) return;
  if (mounted?.revealStep) mounted.revealStep();
  showNote(item.puzzle.explain, "help");
  if (item.mode === "solo" || item.mode === "guided") {
    state.seen[item.type] = true;
    if (item.mode === "solo") recordResult(state, item.type, item.level, false, today());
    save();
  }
  locked = true;
  const done = app.querySelector(".dock .btn.primary");
  if (done) done.textContent = tx("next", L());
  syncMeters();
}

function showNote(copy, kind) {
  const note = app.querySelector(".note");
  if (!note) return;
  note.hidden = false;
  note.className = `note ${kind}`;
  note.querySelector("p").textContent = copy[L()];
}

function advance() {
  if (route.source === "free") {
    const item = currentItem();
    if (item.mode === "example" || item.mode === "guided") {
      route.item = { ...item, mode: "solo", puzzle: freshPuzzle(item.type, item.level) };
      draw();
      return;
    }
    if (route.returnHome) {
      go({ name: "home" });
      return;
    }
    route.item = { ...item, mode: "solo", puzzle: freshPuzzle(item.type, item.level) };
    draw();
    return;
  }
  session.index += 1;
  if (session.index >= session.items.length) finishSession();
  else draw();
}

function finishSession() {
  const total = session.items.length;
  const award = awardSessionSticker(state);
  state.sessionsCompleted = (state.sessionsCompleted || 0) + 1;
  save();
  const praise = solvedCount > 0 ? tx("sessionPraise", L()) : tx("effort", L());
  const ups = levelUps.slice();
  session = null;
  go({ name: "celebrate", award, praise, levelUps: ups, total });
}

function progressSpeech(item) {
  const lang = L();
  const bits = [];
  if (route.source === "session" && session) {
    const total = session.items.length;
    if (session.index === 0) bits.push(txf("stickerGoal", lang, { n: total }));
    else bits.push(txf("progressSay", lang, { have: session.index, n: total }));
  }
  const track = levelTrack(state, item.type);
  if (track.goal && track.have > 0) bits.push(txf("levelSay", lang, { have: track.have, n: track.goal }));
  else if (track.goal && route.source === "session" && session && session.index === 0) {
    bits.push(txf("levelNeed", lang, { n: track.goal }));
  }
  return bits.join(" ");
}

function speechText(puzzle) {
  const lang = L();
  let body;
  if (puzzle.clues) {
    body = `${puzzle.clues.map((c) => c[lang]).join(" ")} ${puzzle.question ? puzzle.question[lang] : ""}`;
  } else if (puzzle.say) body = puzzle.say[lang];
  else if (puzzle.text) body = `${puzzle.prompt[lang]} ${puzzle.text[lang]}`;
  else body = puzzle.prompt[lang];
  const intro = progressSpeech(currentItem());
  return intro ? `${intro} ${body}` : body;
}

function armSpeech(force = false) {
  if (!state.autoRead && !force) return;
  const item = currentItem();
  const text = speechText(item.puzzle);
  const words = app.querySelector(".prompt .words");
  speak(text, L(), {
    onWord(index) {
      if (!words) return;
      const spans = [...words.querySelectorAll("span")];
      let cursor = 0;
      spans.forEach((span) => {
        const next = cursor + span.textContent.length;
        span.classList.toggle("on", index >= cursor && index < next);
        cursor = next;
      });
    },
  });
}

function fillWords(node, text) {
  node.innerHTML = "";
  String(text).split(/(\s+)/).forEach((part) => {
    const span = document.createElement("span");
    span.textContent = part;
    node.append(span);
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

draw();
