/** Curated words, names and pairs. Estonian is the practice language. */

export const NAMES = [
  { id: "mari", et: "Mari", en: "Mari", ad: "Maril", ela: "Marist" },
  { id: "juri", et: "Jüri", en: "Jüri", ad: "Jüril", ela: "Jürist" },
  { id: "sass", et: "Sass", en: "Sass", ad: "Sassil", ela: "Sassist" },
  { id: "liis", et: "Liis", en: "Liis", ad: "Liisil", ela: "Liisist" },
  { id: "kati", et: "Kati", en: "Kati", ad: "Katil", ela: "Katist" },
  { id: "karl", et: "Karl", en: "Karl", ad: "Karlil", ela: "Karlist" },
  { id: "anna", et: "Anna", en: "Anna", ad: "Annal", ela: "Annast" },
  { id: "tom", et: "Tom", en: "Tom", ad: "Tomil", ela: "Tomist" },
];

export const HATS = [
  { id: "red", et: "punane müts", etNeg: "punast mütsi", en: "a red hat", enShort: "red hat", color: "#c44536" },
  { id: "blue", et: "sinine müts", etNeg: "sinist mütsi", en: "a blue hat", enShort: "blue hat", color: "#2f6fad" },
  { id: "green", et: "roheline müts", etNeg: "rohelist mütsi", en: "a green hat", enShort: "green hat", color: "#2f7d4a" },
  { id: "yellow", et: "kollane müts", etNeg: "kollast mütsi", en: "a yellow hat", enShort: "yellow hat", color: "#e0b000" },
];

export const PETS = [
  { id: "dog", et: "koer", etNeg: "koera", en: "a dog", enShort: "dog", icon: "dog" },
  { id: "cat", et: "kass", etNeg: "kassi", en: "a cat", enShort: "cat", icon: "cat" },
  { id: "rabbit", et: "jänes", etNeg: "jänest", en: "a rabbit", enShort: "rabbit", icon: "rabbit" },
  { id: "bird", et: "lind", etNeg: "lindu", en: "a bird", enShort: "bird", icon: "bird" },
];

export const COLORS = [
  { id: "red", et: "punane", etIll: "punaseks", en: "red", hex: "#c44536" },
  { id: "blue", et: "sinine", etIll: "siniseks", en: "blue", hex: "#2f6fad" },
  { id: "yellow", et: "kollane", etIll: "kollaseks", en: "yellow", hex: "#e0b000" },
  { id: "green", et: "roheline", etIll: "roheliseks", en: "green", hex: "#2f7d4a" },
];

export const WEEKDAYS = [
  { id: "mon", et: "esmaspäev", en: "Monday" },
  { id: "tue", et: "teisipäev", en: "Tuesday" },
  { id: "wed", et: "kolmapäev", en: "Wednesday" },
  { id: "thu", et: "neljapäev", en: "Thursday" },
  { id: "fri", et: "reede", en: "Friday" },
  { id: "sat", et: "laupäev", en: "Saturday" },
  { id: "sun", et: "pühapäev", en: "Sunday" },
];

export const SEASONS = [
  { id: "spring", et: "kevad", en: "spring" },
  { id: "summer", et: "suvi", en: "summer" },
  { id: "autumn", et: "sügis", en: "autumn" },
  { id: "winter", et: "talv", en: "winter" },
];

export const MONTHS = [
  { id: "jan", et: "jaanuar", en: "January" },
  { id: "feb", et: "veebruar", en: "February" },
  { id: "mar", et: "märts", en: "March" },
  { id: "apr", et: "aprill", en: "April" },
  { id: "may", et: "mai", en: "May" },
  { id: "jun", et: "juuni", en: "June" },
  { id: "jul", et: "juuli", en: "July" },
  { id: "aug", et: "august", en: "August" },
  { id: "sep", et: "september", en: "September" },
  { id: "oct", et: "oktoober", en: "October" },
  { id: "nov", et: "november", en: "November" },
  { id: "dec", et: "detsember", en: "December" },
];

export const DAY_PARTS = [
  { id: "morning", et: "hommik", en: "morning" },
  { id: "noon", et: "lõuna", en: "midday" },
  { id: "evening", et: "õhtu", en: "evening" },
];

export const TIME_WORDS = [
  { id: "yesterday", et: "eile", en: "yesterday" },
  { id: "today", et: "täna", en: "today" },
  { id: "tomorrow", et: "homme", en: "tomorrow" },
];

/** Things a child can count or sort. `part` is the Estonian partitive singular after a number. */
export const THINGS = [
  { id: "apple", et: "õun", part: "õuna", en: "apple", ens: "apples", icon: "apple", tags: ["fruit", "food"] },
  { id: "pear", et: "pirn", part: "pirni", en: "pear", ens: "pears", icon: "pear", tags: ["fruit", "food"] },
  { id: "banana", et: "banaan", part: "banaani", en: "banana", ens: "bananas", icon: "banana", tags: ["fruit", "food"] },
  { id: "carrot", et: "porgand", part: "porgandit", en: "carrot", ens: "carrots", icon: "carrot", tags: ["vegetable", "food"] },
  { id: "berry", et: "mari", part: "marja", en: "berry", ens: "berries", icon: "berry", tags: ["fruit", "food"] },
  { id: "flower", et: "lill", part: "lille", en: "flower", ens: "flowers", icon: "flower", tags: ["plant"] },
  { id: "mushroom", et: "seen", part: "seent", en: "mushroom", ens: "mushrooms", icon: "mushroom", tags: ["plant"] },
  { id: "tree", et: "puu", part: "puud", en: "tree", ens: "trees", icon: "tree", tags: ["plant"] },
  { id: "dog", et: "koer", part: "koera", en: "dog", ens: "dogs", icon: "dog", tags: ["animal", "pet"] },
  { id: "cat", et: "kass", part: "kassi", en: "cat", ens: "cats", icon: "cat", tags: ["animal", "pet"] },
  { id: "rabbit", et: "jänes", part: "jänest", en: "rabbit", ens: "rabbits", icon: "rabbit", tags: ["animal", "pet"] },
  { id: "bird", et: "lind", part: "lindu", en: "bird", ens: "birds", icon: "bird", tags: ["animal"] },
  { id: "fish", et: "kala", part: "kala", en: "fish", ens: "fish", icon: "fish", tags: ["animal"], striped: true },
  { id: "cow", et: "lehm", part: "lehma", en: "cow", ens: "cows", icon: "cow", tags: ["animal", "farm"] },
  { id: "bee", et: "mesilane", part: "mesilast", en: "bee", ens: "bees", icon: "bee", tags: ["animal"], striped: true },
  { id: "zebra", et: "sebra", part: "sebrat", en: "zebra", ens: "zebras", icon: "zebra", tags: ["animal"], striped: true },
  { id: "butterfly", et: "liblikas", part: "liblikat", en: "butterfly", ens: "butterflies", icon: "butterfly", tags: ["animal"], striped: true },
  { id: "bus", et: "buss", part: "bussi", en: "bus", ens: "buses", icon: "bus", tags: ["vehicle"] },
  { id: "car", et: "auto", part: "autot", en: "car", ens: "cars", icon: "car", tags: ["vehicle"] },
  { id: "boat", et: "paat", part: "paati", en: "boat", ens: "boats", icon: "boat", tags: ["vehicle"] },
  { id: "sock", et: "sokk", part: "sokki", en: "sock", ens: "socks", icon: "sock", tags: ["clothes"] },
  { id: "shoe", et: "king", part: "kinga", en: "shoe", ens: "shoes", icon: "shoe", tags: ["clothes"] },
  { id: "hat", et: "müts", part: "mütsi", en: "hat", ens: "hats", icon: "hat", tags: ["clothes"] },
  { id: "glove", et: "kinnas", part: "kinnast", en: "glove", ens: "gloves", icon: "glove", tags: ["clothes"] },
  { id: "ball", et: "pall", part: "palli", en: "ball", ens: "balls", icon: "ball", tags: ["toy"] },
  { id: "star", et: "täht", part: "tähte", en: "star", ens: "stars", icon: "star", tags: ["sky"] },
  { id: "sun", et: "päike", part: "päikest", en: "sun", ens: "suns", icon: "sun", tags: ["sky"] },
  { id: "moon", et: "kuu", part: "kuud", en: "moon", ens: "moons", icon: "moon", tags: ["sky"] },
  { id: "house", et: "maja", part: "maja", en: "house", ens: "houses", icon: "house", tags: ["place"] },
  { id: "cup", et: "tass", part: "tassi", en: "cup", ens: "cups", icon: "cup", tags: ["home"] },
];

export const TAG_NAMES = {
  animal: { et: "loom", en: "an animal" },
  pet: { et: "lemmikloom", en: "a pet" },
  fruit: { et: "puuvili", en: "a fruit" },
  vegetable: { et: "köögivili", en: "a vegetable" },
  food: { et: "söök", en: "food" },
  vehicle: { et: "sõiduk", en: "a vehicle" },
  clothes: { et: "riideese", en: "a piece of clothing" },
  plant: { et: "taim", en: "a plant" },
  toy: { et: "mänguasi", en: "a toy" },
  sky: { et: "taevakeha", en: "something in the sky" },
  farm: { et: "taluloom", en: "a farm animal" },
  place: { et: "koht", en: "a place" },
  home: { et: "koduasi", en: "a household thing" },
};

export function thingById(id) {
  return THINGS.find((t) => t.id === id);
}

/** Belong-together pairs. */
export const PAIRS = [
  { a: "sock", b: "shoe", et: "sokk ja king", en: "sock and shoe" },
  { a: "glove", b: "hat", et: "kinnas ja müts", en: "glove and hat" },
  { a: "bird", b: "nest", et: "lind ja pesa", en: "bird and nest" },
  { a: "bee", b: "flower", et: "mesilane ja lill", en: "bee and flower" },
  { a: "fish", b: "boat", et: "kala ja paat", en: "fish and boat" },
  { a: "car", b: "wheel", et: "auto ja ratas", en: "car and wheel" },
  { a: "cup", b: "saucer", et: "tass ja alustass", en: "cup and saucer" },
  { a: "key", b: "lock", et: "võti ja lukk", en: "key and lock" },
  { a: "rain", b: "umbrella", et: "vihm ja vihmavari", en: "rain and umbrella" },
  { a: "dog", b: "bone", et: "koer ja kont", en: "dog and bone" },
  { a: "cat", b: "kitten", et: "kass ja kassipoeg", en: "cat and kitten" },
  { a: "dog", b: "puppy", et: "koer ja kutsikas", en: "dog and puppy" },
  { a: "cow", b: "calf", et: "lehm ja vasikas", en: "cow and calf" },
  { a: "bird", b: "wing", et: "lind ja tiib", en: "bird and wing" },
  { a: "tree", b: "leaf", et: "puu ja leht", en: "tree and leaf" },
  { a: "apple", b: "tree", et: "õun ja puu", en: "apple and tree" },
  { a: "flower", b: "stem", et: "lill ja vars", en: "flower and stem" },
  { a: "sun", b: "moon", et: "päike ja kuu", en: "sun and moon" },
];

/** Extra icons that are not in THINGS but appear in pairs and analogies. */
export const EXTRA_ICONS = [
  { id: "nest", et: "pesa", en: "nest", icon: "nest" },
  { id: "wheel", et: "ratas", en: "wheel", icon: "wheel" },
  { id: "saucer", et: "alustass", en: "saucer", icon: "saucer" },
  { id: "key", et: "võti", en: "key", icon: "key" },
  { id: "lock", et: "lukk", en: "lock", icon: "lock" },
  { id: "rain", et: "vihm", en: "rain", icon: "rain" },
  { id: "umbrella", et: "vihmavari", en: "umbrella", icon: "umbrella" },
  { id: "bone", et: "kont", en: "bone", icon: "bone" },
  { id: "kitten", et: "kassipoeg", en: "kitten", icon: "kitten" },
  { id: "puppy", et: "kutsikas", en: "puppy", icon: "puppy" },
  { id: "calf", et: "vasikas", en: "calf", icon: "calf" },
  { id: "wing", et: "tiib", en: "wing", icon: "wing" },
  { id: "leaf", et: "leht", en: "leaf", icon: "leaf" },
  { id: "stem", et: "vars", en: "stem", icon: "stem" },
  { id: "fin", et: "uim", en: "fin", icon: "fin" },
  { id: "kennel", et: "kuut", en: "kennel", icon: "kennel" },
  { id: "hand", et: "käsi", en: "hand", icon: "hand" },
  { id: "foot", et: "jalg", en: "foot", icon: "foot" },
  { id: "bowl", et: "kauss", en: "bowl", icon: "bowl" },
];

export function labelOf(id) {
  const t = thingById(id) || EXTRA_ICONS.find((e) => e.id === id);
  if (!t) return { et: id, en: id, icon: id };
  return { et: t.et, en: t.en, icon: t.icon || id };
}

export const ANALOGIES = [
  {
    a: "bird",
    b: "nest",
    c: "dog",
    answer: "kennel",
    distractors: ["bone", "car", "hat"],
    et: "Lind on pesale nagu koer on …?",
    en: "A bird is to a nest as a dog is to …?",
  },
  {
    a: "glove",
    b: "hand",
    c: "sock",
    answer: "foot",
    distractors: ["shoe", "hat", "ball"],
    et: "Kinnas on käele nagu sokk on …?",
    en: "A glove is to a hand as a sock is to …?",
  },
  {
    a: "kitten",
    b: "cat",
    c: "puppy",
    answer: "dog",
    distractors: ["bone", "cow", "bird"],
    et: "Kassipoeg on kassile nagu kutsikas on …?",
    en: "A kitten is to a cat as a puppy is to …?",
  },
  {
    a: "bee",
    b: "flower",
    c: "bird",
    answer: "nest",
    distractors: ["fish", "hat", "car"],
    et: "Mesilane on lillele nagu lind on …?",
    en: "A bee is to a flower as a bird is to …?",
  },
  {
    a: "fish",
    b: "boat",
    c: "bird",
    answer: "nest",
    distractors: ["car", "shoe", "cup"],
    et: "Kala on paadile nagu lind on …?",
    en: "A fish is to a boat as a bird is to …?",
  },
  {
    a: "wheel",
    b: "car",
    c: "leaf",
    answer: "tree",
    distractors: ["flower", "shoe", "ball"],
    et: "Ratas on autole nagu leht on …?",
    en: "A wheel is to a car as a leaf is to …?",
  },
  {
    a: "rain",
    b: "umbrella",
    c: "sun",
    answer: "hat",
    distractors: ["moon", "cup", "fish"],
    et: "Vihm on vihmavarjule nagu päike on …?",
    en: "Rain is to an umbrella as the sun is to …?",
  },
  {
    a: "key",
    b: "lock",
    c: "sock",
    answer: "shoe",
    distractors: ["glove", "ball", "cup"],
    et: "Võti on lukule nagu sokk on …?",
    en: "A key is to a lock as a sock is to …?",
  },
  {
    a: "bird",
    b: "wing",
    c: "fish",
    answer: "fin",
    distractors: ["boat", "hat", "leaf"],
    et: "Lind on tiivale nagu kala on …?",
    en: "A bird is to a wing as a fish is to …?",
    answerIcon: "fin",
  },
  {
    a: "apple",
    b: "tree",
    c: "flower",
    answer: "stem",
    distractors: ["car", "sock", "moon"],
    et: "Õun on puule nagu lill on …?",
    en: "An apple is to a tree as a flower is to …?",
  },
];

export const SHAPES = [
  { id: "circle", et: "ring", en: "circle" },
  { id: "triangle", et: "kolmnurk", en: "triangle" },
  { id: "square", et: "ruut", en: "square" },
  { id: "rectangle", et: "ristkülik", en: "rectangle" },
  { id: "quad", et: "nelinurk", en: "quadrilateral" },
  { id: "sphere", et: "kera", en: "sphere" },
  { id: "cube", et: "kuup", en: "cube" },
];

export const COINS = [
  { id: "1e", cents: 100, et: "1 euro", en: "1 euro", kind: "euro", label: "1 €" },
  { id: "2e", cents: 200, et: "2 eurot", en: "2 euros", kind: "euro", label: "2 €" },
  { id: "50c", cents: 50, et: "50 senti", en: "50 cents", kind: "cent", label: "50 c" },
  { id: "20c", cents: 20, et: "20 senti", en: "20 cents", kind: "cent", label: "20 c" },
  { id: "10c", cents: 10, et: "10 senti", en: "10 cents", kind: "cent", label: "10 c" },
];

export const CLOCK_HOURS = [
  "kaksteist",
  "üks",
  "kaks",
  "kolm",
  "neli",
  "viis",
  "kuus",
  "seitse",
  "kaheksa",
  "üheksa",
  "kümme",
  "üksteist",
];

export const CLOCK_HOURS_EN = [
  "twelve",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
];

/** Natural Estonian clock phrase. Half hours: pool kaks = 1:30. */
export function etClock(h, m) {
  const hour12 = ((h % 12) + 12) % 12;
  if (m === 0) return `kell on ${CLOCK_HOURS[hour12]}`;
  if (m === 30) {
    const next = CLOCK_HOURS[(hour12 + 1) % 12];
    return `pool ${next}`;
  }
  return "";
}

export function enClock(h, m) {
  const hour12 = ((h % 12) + 12) % 12;
  if (m === 0) return `${CLOCK_HOURS_EN[hour12]} o'clock`;
  if (m === 30) return `half past ${CLOCK_HOURS_EN[hour12]}`;
  return "";
}

export const DAILY_EVENTS = [
  { id: "breakfast", h: 8, m: 0, et: "Hommikusöök on kell kaheksa. Vali õige kell.", en: "Breakfast is at eight o'clock. Choose the right clock." },
  { id: "lunch", h: 12, m: 0, et: "Lõuna on kell kaksteist. Vali õige kell.", en: "Lunch is at twelve o'clock. Choose the right clock." },
  { id: "snack", h: 3, m: 30, et: "Õhtuoode on pool neli. Vali õige kell.", en: "The afternoon snack is at half past three. Choose the right clock." },
  { id: "dinner", h: 6, m: 0, et: "Õhtusöök on kell kuus. Vali õige kell.", en: "Dinner is at six o'clock. Choose the right clock." },
  { id: "bed", h: 8, m: 30, et: "Magama minnakse pool üheksa. Vali õige kell.", en: "Bedtime is at half past eight. Choose the right clock." },
];
