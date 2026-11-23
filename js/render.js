import { icon, shapeSvg, coinSvg, clockSvg, childSvg, stickSvg } from "./icons.js";
import { nextStep } from "./puzzles/pyramid.js";
import { tx } from "./i18n.js";

const HEX = { ink: "#1c1915", red: "#c44536", blue: "#2f6fad", gold: "#c49214", green: "#2f7d4a" };

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

function t(node, et, en, lang) {
  node.dataset.et = et;
  node.dataset.en = en;
  node.textContent = lang === "en" ? en : et;
  return node;
}

function sayAttr(node, et, en) {
  node.dataset.sayEt = et;
  node.dataset.sayEn = en;
}

export function mount(host, puzzle, ctx) {
  host.innerHTML = "";
  const api = { lang: ctx.lang, mode: ctx.mode || "solo", onPick: ctx.onPick || (() => {}) };
  const view = VIEWS[puzzle.view] || VIEWS.blanks;
  const handle = view(host, puzzle, api);
  return {
    getAnswer: () => handle.getAnswer(),
    revealStep: () => handle.revealStep && handle.revealStep(),
    setLang(lang) {
      api.lang = lang;
      host.querySelectorAll("[data-et]").forEach((node) => {
        node.textContent = lang === "en" ? node.dataset.en : node.dataset.et;
      });
      if (handle.setLang) handle.setLang(lang);
    },
    destroy() {
      if (handle.destroy) handle.destroy();
    },
  };
}

function choiceRow(host, puzzle, api, renderOption) {
  const row = el("div", "choices");
  let picked = api.mode === "example" ? puzzle.solution : null;
  puzzle.options.forEach((opt, i) => {
    const b = el("button", "choice");
    b.type = "button";
    b.innerHTML = renderOption(opt, api.lang);
    if (api.mode === "example" && i === puzzle.solution) b.classList.add("circled");
    b.addEventListener("click", () => {
      if (api.mode === "example") return;
      picked = i;
      row.querySelectorAll(".choice").forEach((n) => n.classList.remove("circled"));
      b.classList.add("circled");
      api.onPick(i);
    });
    row.append(b);
  });
  host.append(row);
  return { getAnswer: () => picked };
}

const VIEWS = {
  blanks(host, puzzle, api) {
    const values = puzzle.solution.map(() => "");
    if (api.mode === "example") puzzle.solution.forEach((n, i) => { values[i] = String(n); });
    else if (api.mode === "guided" && puzzle.solution.length > 1) values[0] = String(puzzle.solution[0]);
    const locked = values.map((v, i) => api.mode === "example" || (api.mode === "guided" && i === 0 && puzzle.solution.length > 1));
    let current = values.findIndex((v, i) => !locked[i]);
    const row = el("div", "row");
    const buttons = [];
    puzzle.tokens.forEach((token) => {
      if (token.blank == null) {
        row.append(el("div", "blank given", String(token.n)));
        return;
      }
      const b = el("button", "blank dashed");
      b.type = "button";
      b.textContent = values[token.blank];
      if (locked[token.blank]) b.classList.add("given");
      b.addEventListener("click", () => {
        if (locked[token.blank]) return;
        current = token.blank;
        paint();
      });
      buttons[token.blank] = b;
      row.append(b);
    });
    host.append(row);
    const pad = makePad(puzzle.max || 20, (digit) => {
      if (current < 0 || locked[current]) return;
      const next = `${values[current] || ""}${digit}`.replace(/^0+(\d)/, "$1");
      values[current] = Number(next) > (puzzle.max || 20) ? String(digit) : next.slice(-2);
      paint();
    }, () => {
      if (current < 0 || locked[current]) return;
      values[current] = String(values[current] || "").slice(0, -1);
      paint();
    });
    if (api.mode !== "example") host.append(pad);
    function paint() {
      buttons.forEach((b, i) => {
        if (!b) return;
        b.textContent = values[i];
        b.classList.toggle("selected", i === current && !locked[i]);
      });
    }
    paint();
    return {
      getAnswer: () => values.map((v) => Number(v)),
      revealStep() {
        const i = values.findIndex((v, idx) => !locked[idx] && Number(v) !== puzzle.solution[idx]);
        if (i < 0) return;
        values[i] = String(puzzle.solution[i]);
        locked[i] = true;
        buttons[i].classList.add("given");
        current = values.findIndex((v, idx) => !locked[idx]);
        paint();
      },
    };
  },

  equation(host, puzzle, api) {
    let value = api.mode === "example" ? String(puzzle.solution) : "";
    const row = el("div", "row");
    let blankBtn;
    puzzle.slots.forEach((slot) => {
      if (slot.t === "op") row.append(el("div", "op", slot.v));
      else if (slot.t === "n") row.append(el("div", "blank given", String(slot.v)));
      else if (slot.t === "pics") row.append(pics(slot.icon, slot.n));
      else {
        blankBtn = el("button", "blank dashed");
        blankBtn.type = "button";
        blankBtn.textContent = value;
        row.append(blankBtn);
      }
    });
    host.append(row);
    if (api.mode !== "example") {
      host.append(makePad(puzzle.max || 20, (d) => {
        const next = `${value}${d}`.replace(/^0+(\d)/, "$1");
        value = Number(next) > (puzzle.max || 20) ? String(d) : next.slice(-2);
        blankBtn.textContent = value;
      }, () => {
        value = value.slice(0, -1);
        blankBtn.textContent = value;
      }));
    }
    return { getAnswer: () => Number(value) };
  },

  match(host, puzzle, api) {
    const pairs = new Map();
    if (api.mode === "example" || (api.mode === "guided" && puzzle.solution.length > 1)) {
      const preset = api.mode === "example" ? puzzle.solution : puzzle.solution.slice(0, 1);
      preset.forEach((key) => {
        const [l, r] = key.split(">");
        pairs.set(l, r);
      });
    }
    let armed = null;
    const board = el("div", "match");
    const leftCol = el("div", "col");
    const rightCol = el("div", "col");
    const buttons = new Map();
    function paint() {
      buttons.forEach((btn, id) => {
        const linked = [...pairs.entries()].some(([l, r]) => l === id || r === id);
        btn.classList.toggle("linked", linked);
        btn.classList.toggle("selected", armed === id);
      });
    }
    puzzle.left.forEach((item) => leftCol.append(sideButton(item, "l")));
    puzzle.right.forEach((item) => rightCol.append(sideButton(item, "r")));
    function sideButton(item, side) {
      const b = el("button", "choice");
      b.type = "button";
      b.innerHTML = `${item.icon ? icon(item.icon, { size: 56 }) : ""}${item.shadow ? icon(item.icon, { size: 56 }).replace('fill="none"', 'fill="#1c1915"') : ""}`;
      const cap = t(el("span", "caption"), item.et, item.en, api.lang);
      if (!item.icon) cap.style.fontSize = "1.3rem";
      b.append(cap);
      sayAttr(b, item.et, item.en);
      buttons.set(item.id, b);
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        if (!armed) {
          armed = item.id;
        } else if (armed === item.id) armed = null;
        else if (sideOf(armed) === side) armed = item.id;
        else {
          const left = side === "l" ? item.id : armed;
          const right = side === "r" ? item.id : armed;
          [...pairs.entries()].forEach(([l, r]) => {
            if (l === left || r === right) pairs.delete(l);
          });
          pairs.set(left, right);
          armed = null;
        }
        paint();
      });
      return b;
    }
    function sideOf(id) {
      return puzzle.left.some((x) => x.id === id) ? "l" : "r";
    }
    board.append(leftCol, rightCol);
    host.append(board);
    paint();
    return {
      getAnswer: () => [...pairs.entries()].map(([l, r]) => `${l}>${r}`).sort(),
    };
  },

  compare(host, puzzle, api) {
    let picked = api.mode === "example" ? puzzle.solution : null;
    const row = el("div", "choices");
    const mark = () => {
      row.querySelectorAll("button").forEach((b) => b.classList.toggle("circled", b.dataset.id === String(picked)));
    };
    const add = (id, labelEt, labelEn, picture) => {
      const b = el("button", "choice");
      b.type = "button";
      b.dataset.id = id;
      if (picture) b.innerHTML = picture;
      const cap = t(el("span", "caption"), labelEt, labelEn, api.lang);
      b.append(cap);
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        picked = id;
        mark();
        api.onPick(id);
      });
      row.append(b);
    };
    if (puzzle.mode === "groups") {
      puzzle.groups.forEach((g) => add(g.id, String(g.count), String(g.count), pics(g.icon, g.count).outerHTML));
      if (puzzle.allowEqual) add("equal", "võrdselt", "the same");
    } else if (puzzle.mode === "numerals") {
      puzzle.numerals.forEach((n) => add(n.id, String(n.n), String(n.n)));
    } else if (puzzle.mode === "sign") {
      const show = el("div", "row");
      show.append(el("div", "blank given", String(puzzle.left)), el("div", "op", "?"), el("div", "blank given", String(puzzle.right)));
      host.append(show);
      puzzle.options.forEach((o) => add(o.id, o.et, o.en));
    } else if (puzzle.mode === "extra") {
      const show = el("div", "row");
      show.append(pics(puzzle.icon, puzzle.base));
      show.append(el("div", "op", `+${puzzle.add}`));
      show.append(el("div", "op", "?"));
      show.append(el("div", "blank given", String(puzzle.other)));
      host.append(show);
      add("left", "vasak", "left");
      add("right", "parem", "right");
      add("equal", "võrdselt", "the same");
    }
    host.append(row);
    mark();
    return { getAnswer: () => picked };
  },

  bonds(host, puzzle, api) {
    if (puzzle.mode === "pairs") {
      const chosen = new Set(api.mode === "example" ? puzzle.solution : []);
      const row = el("div", "choices");
      puzzle.options.forEach((o) => {
        const b = el("button", "choice");
        b.type = "button";
        b.textContent = `${o.a} + ${o.b}`;
        if (chosen.has(o.id)) b.classList.add("circled");
        b.addEventListener("click", () => {
          if (api.mode === "example") return;
          if (chosen.has(o.id)) chosen.delete(o.id);
          else chosen.add(o.id);
          b.classList.toggle("circled", chosen.has(o.id));
        });
        row.append(b);
      });
      host.append(row);
      return { getAnswer: () => [...chosen].sort() };
    }
    let value = api.mode === "example" ? String(puzzle.solution) : "";
    const row = el("div", "row");
    if (puzzle.mode === "pictures") {
      row.append(pics(puzzle.icon, puzzle.visible));
      row.append(el("div", "op", "+"));
      const bowl = el("div", "plate");
      bowl.innerHTML = icon("bowl", { size: 64 });
      row.append(bowl);
    } else {
      row.append(el("div", "blank given", String(puzzle.visible)));
      row.append(el("div", "op", "+"));
    }
    const blank = el("button", "blank dashed", value);
    blank.type = "button";
    row.append(el("div", "op", "="), el("div", "blank given", String(puzzle.target)));
    if (puzzle.mode === "pictures") row.append(blank);
    else row.insertBefore(blank, row.children[2]);
    host.append(row);
    if (api.mode !== "example") {
      host.append(makePad(puzzle.max || 12, (d) => {
        value = `${value}${d}`.slice(-2);
        blank.textContent = value;
      }, () => {
        value = value.slice(0, -1);
        blank.textContent = value;
      }));
    }
    return { getAnswer: () => Number(value) };
  },

  pattern(host, puzzle, api) {
    const line = el("div", "row");
    puzzle.tiles.forEach((tile) => {
      if (!tile) line.append(el("div", "blank dashed"));
      else line.append(tileBox(tile));
    });
    host.append(line);
    if (puzzle.mode === "build") {
      const holes = [];
      const values = puzzle.tiles.map((tile) => (tile ? null : ""));
      if (api.mode === "example") puzzle.solution.forEach((k, i) => { values[values.indexOf("")] = k; });
      let cursor = values.findIndex((v) => v === "");
      const blanks = [];
      values.forEach((v, i) => {
        if (puzzle.tiles[i]) return;
        const b = el("button", "blank dashed");
        b.type = "button";
        b.addEventListener("click", () => { cursor = i; paint(); });
        blanks.push({ i, b });
        holes.push(b);
      });
      const holeRow = el("div", "row");
      holes.forEach((b) => holeRow.append(b));
      host.append(holeRow);
      const pal = el("div", "choices");
      puzzle.palette.forEach((tile) => {
        const key = `${tile.shape}:${tile.color}`;
        const b = el("button", "choice");
        b.type = "button";
        b.append(tileBox(tile));
        b.addEventListener("click", () => {
          if (api.mode === "example" || cursor < 0) return;
          values[cursor] = key;
          const next = values.findIndex((v, idx) => puzzle.tiles[idx] == null && v === "");
          cursor = next;
          paint();
        });
        pal.append(b);
      });
      if (api.mode !== "example") host.append(pal);
      function paint() {
        blanks.forEach(({ i, b }) => {
          b.innerHTML = values[i] ? tileBoxHtml(values[i]) : "";
          b.classList.toggle("selected", i === cursor);
        });
      }
      paint();
      return { getAnswer: () => values.filter((_, i) => puzzle.tiles[i] == null) };
    }
    return choiceRow(host, puzzle, api, (opt) => tileBox(opt).outerHTML);
  },

  odd(host, puzzle, api) {
    let picked = null;
    let reason = null;
    const row = el("div", "choices");
    puzzle.items.forEach((item) => {
      const b = el("button", "choice");
      b.type = "button";
      b.innerHTML = icon(item.icon, { size: 64 });
      if (item.striped) b.append(el("div", "caption", "≡"));
      b.append(t(el("span", "caption"), item.et, item.en, api.lang));
      if (api.mode === "example" && item.id === (puzzle.solution.id || puzzle.solution)) b.classList.add("circled");
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        picked = item.id;
        row.querySelectorAll(".choice").forEach((n) => n.classList.remove("circled"));
        b.classList.add("circled");
        const solutionId = puzzle.needReason ? puzzle.solution.id : puzzle.solution;
        if (!puzzle.needReason || picked !== solutionId) api.onPick(puzzle.needReason ? { id: picked, reason: null } : picked);
        else showReasons();
      });
      row.append(b);
    });
    host.append(row);
    const reasonRow = el("div", "choices");
    function showReasons() {
      reasonRow.innerHTML = "";
      puzzle.reasons.forEach((r) => {
        const b = el("button", "choice");
        b.type = "button";
        t(b, r.et, r.en, api.lang);
        b.addEventListener("click", () => {
          reason = r.id;
          api.onPick({ id: picked, reason });
        });
        reasonRow.append(b);
      });
      host.append(reasonRow);
    }
    if (api.mode === "example" && puzzle.needReason) showReasons();
    return {
      getAnswer: () => (puzzle.needReason ? { id: picked, reason } : picked),
    };
  },

  sort(host, puzzle, api) {
    const placed = new Map();
    if (api.mode === "example") {
      puzzle.solution.forEach((key) => {
        const [id, box] = key.split(">");
        placed.set(id, box);
      });
    }
    let armed = null;
    const pool = el("div", "pool");
    const boxes = el("div", "choices");
    function paint() {
      pool.querySelectorAll("button").forEach((b) => b.classList.toggle("selected", b.dataset.id === armed));
    }
    puzzle.items.forEach((item) => {
      const b = el("button", "choice");
      b.type = "button";
      b.dataset.id = item.id;
      b.innerHTML = icon(item.icon, { size: 56 });
      b.append(t(el("span", "caption"), item.et, item.en, api.lang));
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        armed = item.id;
        paint();
      });
      pool.append(b);
    });
    puzzle.boxes.forEach((box) => {
      const b = el("button", "plate");
      b.type = "button";
      t(el("strong"), box.et, box.en, api.lang);
      const hold = el("div", "caption");
      b.append(t(el("span"), box.et, box.en, api.lang), hold);
      b.addEventListener("click", () => {
        if (api.mode === "example" || !armed) return;
        placed.set(armed, box.id);
        armed = null;
        hold.textContent = [...placed.entries()].filter(([, bx]) => bx === box.id).map(([id]) => puzzle.items.find((it) => it.id === id).et).join(" ");
        paint();
      });
      boxes.append(b);
    });
    host.append(pool, boxes);
    return { getAnswer: () => [...placed.entries()].map(([id, box]) => `${id}>${box}`).sort() };
  },

  scene(host, puzzle, api) {
    let picked = api.mode === "example" ? puzzle.solution : null;
    if (puzzle.mode === "grid") {
      const grid = el("div", "grid3");
      puzzle.cells.forEach((cell) => {
        const b = el("button", "choice");
        b.type = "button";
        b.innerHTML = icon(cell.icon, { size: 56 });
        if (picked === cell.id) b.classList.add("circled");
        b.addEventListener("click", () => {
          if (api.mode === "example") return;
          picked = cell.id;
          grid.querySelectorAll("button").forEach((n) => n.classList.remove("circled"));
          b.classList.add("circled");
          api.onPick(cell.id);
        });
        grid.append(b);
      });
      host.append(grid);
      return { getAnswer: () => picked };
    }
    const scene = el("div", "scene table");
    puzzle.items.forEach((item) => {
      const b = el("button", "obj");
      b.type = "button";
      b.style.left = `${item.x}%`;
      b.style.top = `${item.y}%`;
      b.innerHTML = icon(item.icon, { size: 56 });
      b.append(t(el("span", "caption"), item.et, item.en, api.lang));
      if (picked === item.id) b.classList.add("circled");
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        picked = item.id;
        scene.querySelectorAll(".obj").forEach((n) => n.classList.remove("circled"));
        b.classList.add("circled");
        api.onPick(item.id);
      });
      scene.append(b);
    });
    host.append(scene);
    return { getAnswer: () => picked };
  },

  shapes(host, puzzle, api) {
    if (puzzle.mode === "tap") {
      const chosen = new Set(api.mode === "example" ? puzzle.solution : []);
      const row = el("div", "choices");
      puzzle.items.forEach((item) => {
        const b = el("button", "choice");
        b.type = "button";
        b.innerHTML = shapeSvg(item.shape, { size: 72, color: item.color || "#1c1915", rotation: item.rotation || 0 });
        if (chosen.has(item.id)) b.classList.add("circled");
        b.addEventListener("click", () => {
          if (api.mode === "example") return;
          if (chosen.has(item.id)) chosen.delete(item.id);
          else chosen.add(item.id);
          b.classList.toggle("circled", chosen.has(item.id));
        });
        row.append(b);
      });
      host.append(row);
      return { getAnswer: () => [...chosen].sort() };
    }
    if (puzzle.figure) {
      host.append(el("div", "row", shapeSvg(puzzle.figure.shape, { size: 120, color: puzzle.figure.color })));
    }
    let picked = api.mode === "example" ? puzzle.solution : null;
    const row = el("div", "choices");
    puzzle.options.forEach((opt) => {
      const b = el("button", "choice");
      b.type = "button";
      if (opt.shape && puzzle.mode === "which") b.innerHTML = shapeSvg(opt.shape, { size: 84 });
      b.append(t(el("span", "caption"), opt.et, opt.en, api.lang));
      if (picked === opt.id) b.classList.add("circled");
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        picked = opt.id;
        row.querySelectorAll(".choice").forEach((n) => n.classList.remove("circled"));
        b.classList.add("circled");
        api.onPick(opt.id);
      });
      row.append(b);
    });
    host.append(row);
    return { getAnswer: () => picked };
  },

  story(host, puzzle, api) {
    const text = t(el("p", "story"), puzzle.text.et, puzzle.text.en, api.lang);
    host.append(text);
    const row = el("div", "row");
    (puzzle.scenes || []).forEach((scene) => {
      const box = el("div", "plate");
      if (scene.plus) box.append(el("div", "op", "+"));
      box.append(pics(scene.icon, scene.count));
      if (scene.caption) box.append(el("span", "caption", scene.caption));
      row.append(box);
    });
    host.append(row);
    let value = api.mode === "example" ? String(puzzle.solution) : "";
    const blank = el("button", "blank dashed", value);
    blank.type = "button";
    const answerRow = el("div", "row");
    answerRow.append(blank);
    host.append(answerRow);
    if (api.mode !== "example") {
      host.append(makePad(puzzle.max || 12, (d) => {
        value = `${value}${d}`.slice(-2);
        blank.textContent = value;
      }, () => {
        value = value.slice(0, -1);
        blank.textContent = value;
      }));
    }
    return { getAnswer: () => Number(value) };
  },

  memory(host, puzzle, api) {
    let timer = null;
    const stage = el("div", "task");
    host.append(stage);
    let answer = puzzle.mode === "sequence" ? [] : puzzle.mode === "filter" ? [] : null;
    const showFace = () => {
      stage.innerHTML = "";
      const row = el("div", "row");
      puzzle.show.forEach((card) => row.append(cardButton(card, null)));
      stage.append(row);
    };
    const ask = () => {
      stage.innerHTML = "";
      if (puzzle.mode === "gone") {
        const remain = el("div", "row");
        puzzle.remain.forEach((card) => remain.append(cardButton(card, null)));
        stage.append(remain);
        const opts = el("div", "choices");
        puzzle.options.forEach((card) => {
          const b = cardButton(card, () => {
            answer = card.id;
            api.onPick(card.id);
          });
          if (api.mode === "example" && card.id === puzzle.solution) b.classList.add("circled");
          opts.append(b);
        });
        stage.append(opts);
      } else if (puzzle.mode === "filter") {
        const opts = el("div", "choices");
        const chosen = new Set(api.mode === "example" ? puzzle.solution : []);
        puzzle.options.forEach((card) => {
          const b = cardButton(card, () => {
            if (chosen.has(card.id)) chosen.delete(card.id);
            else chosen.add(card.id);
            b.classList.toggle("circled", chosen.has(card.id));
            answer = [...chosen].sort();
          });
          if (chosen.has(card.id)) b.classList.add("circled");
          opts.append(b);
        });
        stage.append(opts);
      } else {
        const slots = el("div", "slots");
        const bank = el("div", "pool");
        const chosen = api.mode === "example" ? puzzle.solution.slice() : [];
        const paint = () => {
          slots.innerHTML = "";
          chosen.forEach((id) => {
            const card = puzzle.bank.find((c) => c.id === id) || puzzle.show.find((c) => c.id === id);
            slots.append(cardButton(card, () => {
              if (api.mode === "example") return;
              chosen.splice(chosen.indexOf(id), 1);
              answer = chosen.slice();
              paint();
            }));
          });
          for (let i = chosen.length; i < puzzle.show.length; i++) slots.append(el("div", "slot"));
        };
        puzzle.bank.forEach((card) => {
          bank.append(cardButton(card, () => {
            if (api.mode === "example" || chosen.length >= puzzle.show.length || chosen.includes(card.id)) return;
            chosen.push(card.id);
            answer = chosen.slice();
            paint();
          }));
        });
        answer = chosen.slice();
        paint();
        stage.append(slots, bank);
      }
    };
    showFace();
    const wait = (puzzle.show.length * 1300) + (puzzle.hold || 0) * 1000;
    if (api.mode === "example") ask();
    else timer = setTimeout(ask, wait);
    return {
      getAnswer: () => answer,
      destroy() { clearTimeout(timer); },
    };
  },

  listen(host, puzzle, api) {
    const say = t(el("p", "story"), puzzle.say.et, puzzle.say.en, api.lang);
    host.append(say);
    const marks = {};
    if (api.mode === "example") Object.assign(marks, JSON.parse(JSON.stringify(puzzle.solution)));
    let selected = puzzle.objects[0].id;
    let tool = puzzle.colors[0].id;
    const scene = el("div", "scene");
    const buttons = new Map();
    function paint() {
      buttons.forEach((b, id) => {
        const mark = marks[id] || {};
        b.style.background = mark.color ? HEX[mark.color] || "#fff" : "transparent";
        b.classList.toggle("circled", Boolean(mark.circle));
        b.classList.toggle("selected", id === selected);
      });
    }
    puzzle.objects.forEach((obj) => {
      const b = el("button", "obj");
      b.type = "button";
      b.style.left = `${obj.x}%`;
      b.style.top = `${obj.y}%`;
      b.innerHTML = icon(obj.icon, { size: 56 });
      b.append(t(el("span", "caption"), obj.et, obj.en, api.lang));
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        selected = obj.id;
        marks[selected] = marks[selected] || {};
        if (tool === "circle") marks[selected].circle = !marks[selected].circle;
        else marks[selected].color = tool;
        paint();
      });
      buttons.set(obj.id, b);
      scene.append(b);
    });
    const tools = el("div", "colors");
    puzzle.colors.forEach((c) => {
      const b = el("button", "crayon");
      b.type = "button";
      b.style.background = c.hex;
      b.addEventListener("click", () => { tool = c.id; });
      tools.append(b);
    });
    const circle = el("button", "choice");
    circle.type = "button";
    t(circle, "ring", "circle", api.lang);
    circle.addEventListener("click", () => { tool = "circle"; });
    tools.append(circle);
    host.append(scene);
    if (api.mode !== "example") host.append(tools);
    paint();
    return {
      getAnswer: () => marks,
    };
  },

  pyramid(host, puzzle, api) {
    const grid = puzzle.rows.map((row, r) => row.map((value, i) => (puzzle.given[r][i] || api.mode === "example" ? value : null)));
    if (api.mode === "guided") {
      const empties = grid.reduce((n, row) => n + row.filter((v) => v == null).length, 0);
      const step = empties > 1 ? nextStep(puzzle, grid) : null;
      if (step) grid[step.r][step.i] = step.value;
    }
    let current = findEmpty(grid);
    const board = el("div", "pyramid");
    const buttons = [];
    puzzle.rows.forEach((row, r) => {
      const line = el("div", "prow");
      row.forEach((_, i) => {
        const given = puzzle.given[r][i] || api.mode === "example";
        const b = el("button", given ? "pbox" : "pbox");
        b.type = "button";
        b.textContent = grid[r][i] == null ? "" : String(grid[r][i]);
        if (puzzle.given[r][i] || (api.mode === "guided" && grid[r][i] != null && !puzzle.given[r][i] && false)) b.disabled = true;
        if (puzzle.given[r][i] || api.mode === "example") b.disabled = true;
        b.addEventListener("click", () => { current = { r, i }; paint(); });
        buttons.push({ r, i, b });
        line.append(b);
      });
      board.append(line);
    });
    host.append(board);
    if (api.mode !== "example") {
      host.append(makePad(puzzle.max || 20, (d) => {
        if (!current || puzzle.given[current.r][current.i]) return;
        const prev = grid[current.r][current.i] == null ? "" : String(grid[current.r][current.i]);
        const next = `${prev}${d}`.replace(/^0+(\d)/, "$1");
        grid[current.r][current.i] = Number(next) > (puzzle.max || 20) ? Number(d) : Number(next.slice(-2));
        paint();
      }, () => {
        if (!current) return;
        const prev = String(grid[current.r][current.i] ?? "");
        grid[current.r][current.i] = prev.length <= 1 ? null : Number(prev.slice(0, -1));
        paint();
      }));
    }
    function paint() {
      buttons.forEach(({ r, i, b }) => {
        b.textContent = grid[r][i] == null ? "" : String(grid[r][i]);
        b.classList.toggle("selected", current && current.r === r && current.i === i);
      });
    }
    paint();
    return {
      getAnswer: () => grid,
      revealStep() {
        const step = nextStep(puzzle, grid);
        if (!step) return;
        grid[step.r][step.i] = step.value;
        current = findEmpty(grid);
        paint();
      },
    };
  },

  sudoku(host, puzzle, api) {
    const grid = puzzle.clues.map((row) => row.slice());
    if (api.mode === "example") {
      puzzle.solution.forEach((row, r) => row.forEach((v, c) => { grid[r][c] = v; }));
    } else if (api.mode === "guided") {
      const empties = [];
      grid.forEach((row, r) => row.forEach((v, c) => { if (v == null) empties.push([r, c]); }));
      if (empties.length > 1) {
        const [r, c] = empties[0];
        grid[r][c] = puzzle.solution[r][c];
      }
    }
    let current = findEmpty(grid);
    let armed = puzzle.symbols[0].id;
    const board = el("div", "sudoku");
    const size = puzzle.size;
    const px = size === 2 ? 96 : 68;
    board.style.gridTemplateColumns = `repeat(${size}, ${px}px)`;
    const buttons = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const b = el("button", "cell");
        b.type = "button";
        b.style.width = `${px}px`;
        b.style.height = `${px}px`;
        if (puzzle.regions) {
          if (c % 2 === 1) b.classList.add("b-r");
          if (r % 2 === 1) b.classList.add("b-b");
          if (c % 2 === 0) b.classList.add("b-l");
          if (r % 2 === 0) b.classList.add("b-t");
        } else {
          b.style.borderWidth = "2px";
        }
        const given = puzzle.clues[r][c] != null;
        if (given || api.mode === "example") b.disabled = true;
        b.addEventListener("click", () => {
          if (given || api.mode === "example") return;
          current = { r, c };
          grid[r][c] = armed;
          paint();
        });
        buttons.push({ r, c, b });
        board.append(b);
      }
    }
    host.append(board);
    const bank = el("div", "bank");
    puzzle.symbols.forEach((sym) => {
      const b = el("button", "token");
      b.type = "button";
      b.innerHTML = sym.icon ? icon(sym.icon, { size: 48 }) : sym.text;
      b.addEventListener("click", () => { armed = sym.id; bank.querySelectorAll(".token").forEach((n) => n.classList.remove("selected")); b.classList.add("selected"); });
      if (sym.id === armed) b.classList.add("selected");
      bank.append(b);
    });
    if (api.mode !== "example") host.append(bank);
    function paint() {
      buttons.forEach(({ r, c, b }) => {
        const v = grid[r][c];
        const sym = puzzle.symbols.find((s) => s.id === v);
        b.innerHTML = !sym ? "" : sym.icon ? icon(sym.icon, { size: size === 2 ? 56 : 40 }) : sym.text;
        b.classList.toggle("selected", current && current.r === r && (current.c === c || current.i === c));
      });
    }
    paint();
    return {
      getAnswer: () => grid,
      revealStep() {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (grid[r][c] == null) {
              grid[r][c] = puzzle.solution[r][c];
              paint();
              return;
            }
          }
        }
      },
    };
  },

  word(host, puzzle, api) {
    puzzle.clues.forEach((clue) => host.append(t(el("p", "clue"), clue.et, clue.en, api.lang)));
    if (puzzle.question) host.append(t(el("p", "clue"), puzzle.question.et, puzzle.question.en, api.lang));
    if (puzzle.mode === "who") {
      let picked = api.mode === "example" ? puzzle.solution : null;
      const row = el("div", "people");
      puzzle.people.forEach((person) => {
        const b = el("button", "person");
        b.type = "button";
        b.innerHTML = childSvg({ size: 72 });
        b.append(t(el("span", "caption"), person.et, person.en, api.lang));
        if (picked === person.id) b.classList.add("circled");
        b.addEventListener("click", () => {
          if (api.mode === "example") return;
          picked = person.id;
          row.querySelectorAll("button").forEach((n) => n.classList.remove("circled"));
          b.classList.add("circled");
          api.onPick(person.id);
        });
        row.append(b);
      });
      host.append(row);
      return { getAnswer: () => picked };
    }
    const map = {};
    if (api.mode === "example") {
      puzzle.solution.split("|").forEach((pair) => {
        const [k, v] = pair.split("=");
        map[k] = v;
      });
    }
    let armed = puzzle.people[0].id;
    const row = el("div", "people");
    function paint() {
      row.querySelectorAll(".person").forEach((b) => {
        b.classList.toggle("selected", b.dataset.id === armed);
        const trait = map[b.dataset.id];
        const hat = b.querySelector(".worn");
        if (puzzle.mode === "assign") {
          const found = (puzzle.traits || []).find((h) => h.id === trait);
          hat.style.background = found ? found.color : "transparent";
        } else hat.textContent = trait ? (puzzle.places.find((p) => p.id === trait)?.[api.lang] || trait) : "";
      });
    }
    puzzle.people.forEach((person) => {
      const b = el("button", "person");
      b.type = "button";
      b.dataset.id = person.id;
      b.innerHTML = `${childSvg({ size: 72 })}<i class="worn" style="display:block;height:14px;border-radius:8px"></i>`;
      b.append(t(el("span", "caption"), person.et, person.en, api.lang));
      b.addEventListener("click", () => { armed = person.id; paint(); });
      row.append(b);
    });
    const bank = el("div", "hats");
    const options = puzzle.mode === "assign" ? puzzle.traits : puzzle.places;
    options.forEach((opt) => {
      const b = el("button", "hatbtn");
      b.type = "button";
      if (opt.color) b.style.background = opt.color;
      t(b, opt.et, opt.en, api.lang);
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        map[armed] = opt.id;
        paint();
      });
      bank.append(b);
    });
    host.append(row, bank);
    paint();
    return {
      getAnswer: () => Object.keys(map).sort().map((k) => `${k}=${map[k]}`).join("|"),
      setLang() { paint(); },
    };
  },

  maze(host, puzzle, api) {
    const path = [{ ...puzzle.start }];
    const board = el("div", "maze");
    const size = Math.max(42, Math.min(64, Math.floor(320 / puzzle.cols)));
    board.style.gridTemplateColumns = `repeat(${puzzle.cols}, ${size}px)`;
    board.style.width = `${size * puzzle.cols}px`;
    const buttons = [];
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const b = el("button", "");
        b.type = "button";
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        if (puzzle.kind === "walls") {
          b.style.borderTop = puzzle.hWall[r][c] ? "4px solid #1c1915" : "1px solid transparent";
          b.style.borderBottom = puzzle.hWall[r + 1][c] ? "4px solid #1c1915" : "1px solid transparent";
          b.style.borderLeft = puzzle.vWall[r][c] ? "4px solid #1c1915" : "1px solid transparent";
          b.style.borderRight = puzzle.vWall[r][c + 1] ? "4px solid #1c1915" : "1px solid transparent";
        } else {
          const symbol = puzzle.symbols[`${c},${r}`];
          b.style.border = "1px solid #ddd";
          if (typeof symbol === "number") b.textContent = String(symbol);
          else b.innerHTML = shapeSvg(symbol === "circle" ? "circle" : "square", { size: size - 16 });
        }
        b.addEventListener("click", () => {
          if (api.mode === "example") return;
          const here = path[path.length - 1];
          const target = { c, r };
          if (path.length > 1 && path[path.length - 2].c === c && path[path.length - 2].r === r) {
            path.pop();
            paint();
            return;
          }
          if (!can(puzzle, here, target)) {
            b.classList.add("shake");
            setTimeout(() => b.classList.remove("shake"), 350);
            return;
          }
          path.push(target);
          paint();
          if (c === puzzle.end.c && r === puzzle.end.r) api.onPick(path.map((p) => ({ ...p })));
        });
        buttons.push({ c, r, b });
        board.append(b);
      }
    }
    function paint() {
      const here = path[path.length - 1];
      buttons.forEach(({ c, r, b }) => {
        b.classList.toggle("here", here.c === c && here.r === r);
        if (puzzle.kind === "walls" && c === puzzle.end.c && r === puzzle.end.r && !(here.c === c && here.r === r)) {
          b.innerHTML = icon("house", { size: size - 18 });
        }
        if (puzzle.kind === "walls" && here.c === c && here.r === r) b.innerHTML = icon("fox", { size: size - 16 });
        if (puzzle.kind === "symbols" && here.c === c && here.r === r) b.style.background = "#f3e2a4";
        else if (puzzle.kind === "symbols") b.style.background = "#fff";
      });
    }
    host.append(board);
    if (api.mode === "example") {
      puzzle.solution.forEach((step, i) => { if (i) path.push({ ...step }); });
    }
    paint();
    return { getAnswer: () => path.map((p) => ({ ...p })) };
  },

  mirror(host, puzzle, api) {
    if (puzzle.mode === "tap") {
      const value = puzzle.solution.map((row) => row.map(() => false));
      if (api.mode === "example") puzzle.solution.forEach((row, r) => row.forEach((v, c) => { value[r][c] = v; }));
      const full = el("div", "bits");
      const cols = puzzle.axis === "v" ? puzzle.full[0].length : puzzle.full[0].length;
      full.style.gridTemplateColumns = `repeat(${cols}, 28px)`;
      if (puzzle.axis === "v") {
        puzzle.full.forEach((row, r) => {
          row.forEach((bit, c) => {
            const editable = c >= 2;
            const b = el("button", bit && !editable ? "bit on fixed" : "bit");
            b.type = "button";
            if (!editable && bit) b.classList.add("on");
            if (editable) {
              const ec = c - 2;
              if (value[r][ec]) b.classList.add("on");
              b.addEventListener("click", () => {
                if (api.mode === "example") return;
                value[r][ec] = !value[r][ec];
                b.classList.toggle("on", value[r][ec]);
              });
            }
            full.append(b);
          });
        });
      } else {
        puzzle.full.forEach((row, r) => {
          row.forEach((bit, c) => {
            const editable = r >= 2;
            const b = el("button", "bit");
            b.type = "button";
            if (!editable && bit) b.classList.add("on");
            if (editable) {
              if (value[r - 2][c]) b.classList.add("on");
              b.addEventListener("click", () => {
                if (api.mode === "example") return;
                value[r - 2][c] = !value[r - 2][c];
                b.classList.toggle("on", value[r - 2][c]);
              });
            }
            full.append(b);
          });
        });
      }
      host.append(full);
      return { getAnswer: () => value };
    }
    let picked = api.mode === "example" ? puzzle.solution : null;
    const row = el("div", "choices");
    const figures = puzzle.mode === "odd"
      ? puzzle.figures.map((f) => f.left.map((line, r) => line.concat(f.right[r])))
      : puzzle.options;
    figures.forEach((grid, i) => {
      const b = el("button", "choice");
      b.type = "button";
      b.append(bitGrid(grid));
      if (picked === i) b.classList.add("circled");
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        picked = i;
        row.querySelectorAll(".choice").forEach((n) => n.classList.remove("circled"));
        b.classList.add("circled");
        api.onPick(i);
      });
      row.append(b);
    });
    host.append(row);
    return { getAnswer: () => picked };
  },

  order(host, puzzle, api) {
    const placed = api.mode === "example" ? puzzle.solution.slice() : [];
    const slots = el("div", "slots");
    const pool = el("div", "pool");
    function paint() {
      slots.innerHTML = "";
      for (let i = 0; i < puzzle.solution.length; i++) {
        const id = placed[i];
        const s = el("button", "slot");
        s.type = "button";
        if (id) s.append(orderFace(puzzle, id));
        s.addEventListener("click", () => {
          if (!id || api.mode === "example") return;
          placed.splice(i, 1);
          paint();
        });
        slots.append(s);
      }
      pool.querySelectorAll("button").forEach((b) => {
        b.disabled = placed.includes(b.dataset.id);
      });
    }
    puzzle.items.forEach((item) => {
      const b = el("button", "choice");
      b.type = "button";
      b.dataset.id = item.id;
      b.append(orderFace(puzzle, item.id));
      b.addEventListener("click", () => {
        if (api.mode === "example" || placed.includes(item.id) || placed.length >= puzzle.solution.length) return;
        placed.push(item.id);
        paint();
      });
      pool.append(b);
    });
    host.append(slots, pool);
    paint();
    return { getAnswer: () => placed.slice() };
  },

  analogy(host, puzzle, api) {
    const stem = el("div", "row");
    if (puzzle.mode === "number") {
      stem.append(el("div", "blank given", String(puzzle.stem.a)), el("div", "op", "→"), el("div", "blank given", String(puzzle.stem.b)), el("div", "op", "·"), el("div", "blank given", String(puzzle.stem.c)), el("div", "op", "→"), el("div", "blank dashed", "?"));
    } else {
      stem.append(face(puzzle.stem.a), el("div", "op", "→"), face(puzzle.stem.b));
      stem.append(el("div", "op", "·"), face(puzzle.stem.c), el("div", "op", "→ ?"));
    }
    host.append(stem);
    if (puzzle.mode === "number") {
      return choiceRow(host, puzzle, api, (opt) => `<span class="op">${opt}</span>`);
    }
    return choiceRow(host, puzzle, api, (opt) => `${icon(opt.icon, { size: 56 })}<span class="caption">${api.lang === "en" ? opt.en : opt.et}</span>`);
  },

  matrix(host, puzzle, api) {
    const grid = el("div", "bits");
    grid.style.gridTemplateColumns = `repeat(${puzzle.grid[0].length}, 64px)`;
    grid.style.gap = "8px";
    puzzle.grid.forEach((row) => {
      row.forEach((cell) => {
        const box = el("div", "choice");
        if (!cell) box.textContent = "?";
        else box.append(matrixCell(cell));
        grid.append(box);
      });
    });
    host.append(grid);
    return choiceRow(host, puzzle, api, (opt) => matrixCell(opt).outerHTML);
  },

  clock(host, puzzle, api) {
    if (puzzle.mode === "set") {
      let h = api.mode === "example" ? puzzle.solution.h : 12;
      const face = el("div", "row");
      const draw = () => { face.innerHTML = clockSvg(h, 0, 220); };
      draw();
      host.append(face);
      const nums = el("div", "choices");
      for (let n = 1; n <= 12; n++) {
        const b = el("button", "choice", String(n));
        b.type = "button";
        b.addEventListener("click", () => { if (api.mode === "example") return; h = n; draw(); });
        nums.append(b);
      }
      if (api.mode !== "example") host.append(nums);
      return { getAnswer: () => ({ h, m: 0 }) };
    }
    let picked = api.mode === "example" ? puzzle.solution : null;
    const row = el("div", "choices");
    puzzle.faces.forEach((face, i) => {
      const b = el("button", "clockbtn");
      b.type = "button";
      b.innerHTML = clockSvg(face.h, face.m, 120);
      if (picked === i) b.classList.add("circled");
      b.addEventListener("click", () => {
        if (api.mode === "example") return;
        picked = i;
        row.querySelectorAll("button").forEach((n) => n.classList.remove("circled"));
        b.classList.add("circled");
        api.onPick(i);
      });
      row.append(b);
    });
    host.append(row);
    return { getAnswer: () => picked };
  },

  money(host, puzzle, api) {
    if (puzzle.mode === "circle" || puzzle.mode === "choice" || puzzle.mode === "enough") {
      let picked = api.mode === "example" ? puzzle.solution : null;
      if (puzzle.coins) {
        const row = el("div", "row");
        puzzle.coins.forEach((c) => row.append(el("div", "", coinSvg(c, 74))));
        host.append(row);
      }
      if (puzzle.price) host.append(t(el("p", "story"), `Hind: ${puzzle.price} eurot`, `Price: ${puzzle.price} euros`, api.lang));
      const row = el("div", "choices");
      const options = puzzle.mode === "enough"
        ? [{ id: "yes", et: "Jah, jätkub", en: "Yes, enough" }, { id: "no", et: "Ei, ei jätku", en: "No, not enough" }]
        : puzzle.mode === "choice"
          ? puzzle.options
          : puzzle.coins.map((c) => ({ id: c.uid, et: c.et, en: c.en, coin: c }));
      options.forEach((opt) => {
        const b = el("button", "choice");
        b.type = "button";
        if (opt.coin) b.innerHTML = coinSvg(opt.coin, 64);
        b.append(t(el("span", "caption"), opt.et, opt.en, api.lang));
        if (picked === opt.id) b.classList.add("circled");
        b.addEventListener("click", () => {
          if (api.mode === "example") return;
          picked = opt.id;
          row.querySelectorAll(".choice").forEach((n) => n.classList.remove("circled"));
          b.classList.add("circled");
          api.onPick(opt.id);
        });
        row.append(b);
      });
      host.append(row);
      return { getAnswer: () => picked };
    }
    if (puzzle.coins) {
      const row = el("div", "row");
      puzzle.coins.forEach((c) => row.append(el("div", "", coinSvg(c, 74))));
      host.append(row);
    }
    let value = api.mode === "example" ? String(puzzle.solution) : "";
    const blank = el("button", "blank dashed", value);
    blank.type = "button";
    const answerRow = el("div", "row");
    answerRow.append(blank);
    host.append(answerRow);
    if (api.mode !== "example") {
      host.append(makePad(puzzle.max || 20, (d) => {
        value = `${value}${d}`.slice(-2);
        blank.textContent = value;
      }, () => {
        value = value.slice(0, -1);
        blank.textContent = value;
      }));
    }
    return { getAnswer: () => Number(value) };
  },
};

function makePad(max, onDigit, onClear) {
  const pad = el("div", "pad");
  for (let d = 0; d <= 9; d++) {
    const b = el("button", "", String(d));
    b.type = "button";
    b.addEventListener("click", () => onDigit(String(d)));
    pad.append(b);
  }
  const back = el("button", "", "⌫");
  back.type = "button";
  back.addEventListener("click", onClear);
  pad.append(back);
  return pad;
}

function pics(name, count) {
  const wrap = el("div", "icons");
  for (let i = 0; i < count; i++) wrap.innerHTML += icon(name, { size: count > 6 ? 28 : 36 });
  return wrap;
}

function tileBox(tile) {
  const fill = HEX[tile.color] || "#1c1915";
  return el("div", "", shapeSvg(tile.shape, { size: 56, color: fill, fill: tile.color === "ink" ? "none" : fill }));
}

function tileBoxHtml(key) {
  const [shape, color] = key.split(":");
  return tileBox({ shape, color }).innerHTML;
}

function cardButton(card, onClick) {
  const b = el("button", "choice");
  b.type = "button";
  b.innerHTML = icon(card.icon, { size: 64 });
  b.append(t(el("span", "caption"), card.et, card.en, "et"));
  if (onClick) b.addEventListener("click", onClick);
  return b;
}

function face(info) {
  const b = el("div", "choice");
  b.innerHTML = icon(info.icon, { size: 56 });
  b.append(t(el("span", "caption"), info.et, info.en, "et"));
  return b;
}

function orderFace(puzzle, id) {
  const item = puzzle.items.find((it) => it.id === id);
  if (puzzle.display === "sticks") return el("div", "stick", stickSvg(item.size, 36));
  const chip = el("div", "wordchip");
  t(chip, item.et, item.en, "et");
  return chip;
}

function bitGrid(grid) {
  const box = el("div", "mini");
  box.style.gridTemplateColumns = `repeat(${grid[0].length}, 16px)`;
  grid.forEach((row) => row.forEach((bit) => {
    const c = el("i", bit ? "bit on" : "bit");
    box.append(c);
  }));
  return box;
}

function matrixCell(cell) {
  const fill = cell.pattern === "plain" ? "none" : cell.pattern === "stripe" ? "#d7ebe3" : "#f3e2a4";
  const node = el("div", "");
  node.innerHTML = shapeSvg(cell.shape, { size: 52, fill, rotation: (cell.turn || 0) * 20 });
  return node;
}

function findEmpty(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let i = 0; i < grid[r].length; i++) if (grid[r][i] == null) return { r, i };
  }
  return null;
}

function can(puzzle, a, b) {
  const dc = Math.abs(a.c - b.c);
  const dr = Math.abs(a.r - b.r);
  if (dc + dr !== 1) return false;
  if (puzzle.kind === "walls") {
    if (b.c === a.c + 1) return !puzzle.vWall[a.r][a.c + 1];
    if (b.c === a.c - 1) return !puzzle.vWall[a.r][a.c];
    if (b.r === a.r + 1) return !puzzle.hWall[a.r + 1][a.c];
    if (b.r === a.r - 1) return !puzzle.hWall[a.r][a.c];
    return false;
  }
  const rule = puzzle.rule;
  const ok = (c, r) => {
    const symbol = puzzle.symbols[`${c},${r}`];
    if (rule === "even") return typeof symbol === "number" && symbol % 2 === 0;
    if (rule === "circle") return symbol === "circle";
    return true;
  };
  return ok(a.c, a.r) && ok(b.c, b.r);
}

void tx;
