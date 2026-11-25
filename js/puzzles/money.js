import { makeRng, mixSeed } from "../rng.js";
import { COINS } from "../content.js";
import { basePuzzle, same } from "./util.js";

export const meta = {
  id: "money",
  tier: 3,
  name: { et: "Raha", en: "Money" },
  blurb: { et: "Eurod ja sendid.", en: "Euros and cents." },
};

function coin(id) {
  return COINS.find((c) => c.id === id);
}

export function generate(level, seed) {
  const rng = makeRng(mixSeed(seed, `money-${level}`));

  if (level === 1) {
    const coins = [
      { ...coin("1e"), uid: "a" },
      { ...coin("2e"), uid: "b" },
    ];
    const ask = rng.pick(coins);
    return basePuzzle(meta, level, seed, {
      view: "money",
      mode: "circle",
      prompt: { et: `Tõmba ring ümber mündile: ${ask.et}.`, en: `Circle the coin: ${ask.en}.` },
      hint: { et: "1 euro ja 2 eurot on erineva suurusega.", en: "The 1 euro and the 2 euro coins are different sizes." },
      nudge: { et: `Otsi kirja „${ask.label}“.`, en: `Look for “${ask.label}”.` },
      praise: { et: "Õige münt.", en: "The right coin." },
      explain: { et: `See on ${ask.et}.`, en: `That is ${ask.en}.` },
      coins: rng.shuffle(coins),
      solution: ask.uid,
      alt: coins.find((c) => c.uid !== ask.uid).uid,
    });
  }

  if (level === 2 || (level === 3 && rng.chance(0.5))) {
    const kinds = level === 2 ? ["1e", "2e"] : ["1e", "2e"];
    const coins = [];
    let total = 0;
    const limit = level === 2 ? 5 : 10;
    while (coins.length < rng.int(2, 4)) {
      const id = rng.pick(kinds);
      const c = coin(id);
      if (total + c.cents / 100 > limit) break;
      total += c.cents / 100;
      coins.push({ ...c, uid: `c${coins.length}` });
    }
    if (coins.length < 2 || total < 1 || total > limit) return generate(level, seed + 3);
    return basePuzzle(meta, level, seed, {
      view: "money",
      mode: "count",
      prompt: { et: "Mitu eurot on siin kokku?", en: "How many euros are there in all?" },
      hint: { et: "Liida mündid ükshaaval.", en: "Add the coins one by one." },
      nudge: { et: `Esimene münt on ${coins[0].et}.`, en: `The first coin is ${coins[0].en}.` },
      praise: { et: "Summa on õige.", en: "The total is right." },
      explain: { et: `Kokku on ${total} eurot.`, en: `That is ${total} euros altogether.` },
      coins,
      solution: total,
      alt: total === limit ? total - 1 : total + 1,
      max: limit,
    });
  }

  if (level === 3) {
    const coins = [];
    let total = 0;
    while (coins.length < 3) {
      const c = coin(rng.pick(["1e", "2e"]));
      if (total + c.cents / 100 > 10) break;
      total += c.cents / 100;
      coins.push({ ...c, uid: `c${coins.length}` });
    }
    if (!coins.length) return generate(level, seed + 4);
    const price = rng.int(1, 10);
    const enough = total >= price;
    return basePuzzle(meta, level, seed, {
      view: "money",
      mode: "enough",
      prompt: { et: `Kas ${price} euroga saab selle osta? Sul on need mündid.`, en: `Can you buy it for ${price} euros? You have these coins.` },
      hint: { et: "Loe mündid kokku ja võrdle hinnaga.", en: "Add the coins and compare with the price." },
      nudge: { et: `Mündid teevad kokku ${total}.`, en: `The coins make ${total} altogether.` },
      praise: { et: "Said aru, kas raha jätkub.", en: "You worked out whether there is enough." },
      explain: { et: enough ? `Jah, ${total} eurot jätkub.` : `Ei, ${total} eurot ei jätku.`, en: enough ? `Yes, ${total} euros is enough.` : `No, ${total} euros is not enough.` },
      coins,
      price,
      solution: enough ? "yes" : "no",
      alt: enough ? "no" : "yes",
    });
  }

  if (level === 4) {
    const coins = [];
    let cents = 0;
    const bag = ["1e", "10c", "20c", "50c"];
    while (coins.length < rng.int(2, 4)) {
      const c = coin(rng.pick(bag));
      if (cents + c.cents > 300) break;
      cents += c.cents;
      coins.push({ ...c, uid: `c${coins.length}` });
    }
    if (cents <= 0) return generate(level, seed + 5);
    const euros = Math.floor(cents / 100);
    const sent = cents % 100;
    const right = { id: "ok", et: sent ? `${euros} eurot ja ${sent} senti` : `${euros} eurot`, en: sent ? `${euros} euros and ${sent} cents` : `${euros} euros` };
    const wrongs = [
      { id: "w1", et: `${euros + 1} eurot`, en: `${euros + 1} euros` },
      { id: "w2", et: `${sent} eurot`, en: `${sent} euros` },
    ];
    const options = rng.shuffle([right, ...wrongs]);
    return basePuzzle(meta, level, seed, {
      view: "money",
      mode: "choice",
      prompt: { et: "Kui palju raha siin on?", en: "How much money is here?" },
      hint: { et: "Eurod ja sendid hoia eraldi, siis pane kokku.", en: "Keep euros and cents apart, then put them together." },
      nudge: { et: `Sente on ${sent}.`, en: `There are ${sent} cents.` },
      praise: { et: "Eurod ja sendid on õiged.", en: "The euros and cents are right." },
      explain: { et: right.et + ".", en: right.en + "." },
      coins,
      options,
      solution: "ok",
      alt: "w1",
    });
  }

  const price = rng.int(1, 8);
  const paid = 10;
  const change = paid - price;
  return basePuzzle(meta, level, seed, {
    view: "money",
    mode: "change",
    prompt: { et: `Asi maksab ${price} eurot. Sul on ${paid} eurot. Mitu eurot saad tagasi?`, en: `The thing costs ${price} euros. You have ${paid} euros. How many euros do you get back?` },
    hint: { et: "Lahuta hind kümnest.", en: "Take the price away from ten." },
    nudge: { et: `${paid} − ${price}.`, en: `${paid} − ${price}.` },
    praise: { et: "Tagasi antud raha on õige.", en: "The change is right." },
    explain: { et: `${paid} − ${price} = ${change}.`, en: `${paid} − ${price} = ${change}.` },
    price,
    paid,
    solution: change,
    alt: change === 1 ? 2 : change - 1,
    max: 10,
  });
}

export function grade(puzzle, answer) {
  if (puzzle.mode === "count" || puzzle.mode === "change") return Number(answer) === puzzle.solution;
  return answer === puzzle.solution;
}

export function invariants(p) {
  const errs = [];
  if (!grade(p, p.solution) || grade(p, p.alt)) errs.push("grade");
  if (p.coins && p.coins.length > 6) errs.push("too many");
  if (p.mode === "count") {
    const total = p.coins.reduce((s, c) => s + c.cents, 0) / 100;
    if (total !== p.solution) errs.push("sum");
    if (p.level === 2 && total > 5) errs.push("cap");
  }
  if (p.mode === "enough") {
    const total = p.coins.reduce((s, c) => s + c.cents, 0) / 100;
    const expect = total >= p.price ? "yes" : "no";
    if (p.solution !== expect || total > 10) errs.push("enough");
  }
  if (p.mode === "choice") {
    const cents = p.coins.reduce((s, c) => s + c.cents, 0);
    const opt = p.options.find((o) => o.id === p.solution);
    const euros = Math.floor(cents / 100);
    const sent = cents % 100;
    if (sent === 0 && !opt.et.startsWith(String(euros))) errs.push("choice");
    if (sent && !opt.et.includes(String(sent))) errs.push("cents");
  }
  if (p.mode === "change" && p.paid - p.price !== p.solution) errs.push("change");
  if (p.level === 1 && p.mode !== "circle") errs.push("l1");
  return errs;
}
