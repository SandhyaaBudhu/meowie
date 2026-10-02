export const WORLD = {
  width: 2400,
  height: 1800,
  speed: 165,
  spawn: { x: 1130, y: 1190 },
};
export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Decoration {
  kind: string;
  x: number;
  y: number;
  scale?: number;
  obstacle?: { w: number; h: number; dy?: number };
}
export const decorations: Decoration[] = [
  {
    kind: "house",
    x: 450,
    y: 310,
    scale: 1.35,
    obstacle: { w: 285, h: 185, dy: -100 },
  },
  {
    kind: "house",
    x: 1160,
    y: 275,
    scale: 1.1,
    obstacle: { w: 285, h: 185, dy: -100 },
  },
  {
    kind: "house",
    x: 2040,
    y: 370,
    scale: 1.45,
    obstacle: { w: 285, h: 185, dy: -100 },
  },
  ...[
    [180, 420],
    [160, 780],
    [260, 1280],
    [440, 1570],
    [930, 1610],
    [1510, 1590],
    [1990, 1530],
    [2250, 1180],
    [2230, 750],
    [1620, 280],
    [770, 390],
    [1640, 1240],
    [700, 1180],
    [1770, 760],
  ].map(([x, y]) => ({
    kind: "tree",
    x,
    y,
    scale: 0.9 + (x % 3) * 0.1,
    obstacle: { w: 78, h: 70, dy: -30 },
  })),
  ...[
    [350, 650],
    [650, 660],
    [340, 920],
    [650, 930],
    [1860, 1250],
    [2070, 1250],
    [1830, 1460],
    [2070, 1460],
    [830, 260],
    [1470, 330],
    [225, 1530],
    [1240, 1590],
  ].map(([x, y]) => ({
    kind: "bush",
    x,
    y,
    obstacle: { w: 115, h: 44, dy: -20 },
  })),
  { kind: "bench", x: 1010, y: 760, obstacle: { w: 142, h: 62, dy: -32 } },
  { kind: "bench", x: 1680, y: 1470, obstacle: { w: 142, h: 62, dy: -32 } },
  { kind: "table", x: 1960, y: 770, obstacle: { w: 115, h: 100, dy: -30 } },
  {
    kind: "table",
    x: 2140,
    y: 970,
    scale: 0.85,
    obstacle: { w: 115, h: 100, dy: -30 },
  },
  { kind: "bike", x: 1810, y: 480, obstacle: { w: 118, h: 36, dy: -15 } },
  { kind: "box", x: 800, y: 1390, obstacle: { w: 78, h: 54, dy: -22 } },
  { kind: "mailbox", x: 650, y: 450, obstacle: { w: 38, h: 28, dy: -15 } },
  { kind: "chime", x: 910, y: 640, obstacle: { w: 24, h: 24, dy: -12 } },
  { kind: "yarn", x: 930, y: 1260 },
  { kind: "pot", x: 320, y: 340 },
  { kind: "pot", x: 590, y: 340 },
  { kind: "pot", x: 1920, y: 415 },
  { kind: "pot", x: 2170, y: 415 },
  ...[
    [400, 700],
    [580, 790],
    [460, 940],
    [1910, 1330],
    [2030, 1390],
    [1480, 550],
    [920, 1370],
    [1430, 1520],
  ].map(([x, y]) => ({ kind: "flowers", x, y })),
];
export const fences: Obstacle[] = [
  { x: 280, y: 540, w: 230, h: 18 },
  { x: 655, y: 540, w: 160, h: 18 },
  { x: 260, y: 820, w: 18, h: 370 },
  { x: 745, y: 850, w: 18, h: 310 },
  { x: 1920, y: 1170, w: 310, h: 18 },
  { x: 2180, y: 1390, w: 18, h: 420 },
  { x: 520, y: 1640, w: 500, h: 18 },
  { x: 1930, y: 1600, w: 380, h: 18 },
];
export const pond = { x: 1300, y: 820, w: 370, h: 260 };
export const sardineSpots = [
  { x: 1150, y: 1100, label: "The welcome path" },
  { x: 450, y: 780, label: "The flower garden" },
  { x: 520, y: 425, label: "The little cottage" },
  { x: 1060, y: 580, label: "The reading path" },
  { x: 1550, y: 860, label: "The pond’s eastern bank" },
  { x: 2040, y: 545, label: "The café terrace" },
  { x: 2030, y: 1050, label: "Past the café" },
  { x: 1790, y: 1295, label: "The kitchen garden" },
  { x: 1260, y: 1435, label: "The stepping stones" },
  { x: 620, y: 1410, label: "The cardboard hideaway" },
];
export const interactions = [
  {
    id: "box",
    x: 800,
    y: 1390,
    radius: 115,
    prompt: "Investigate the cardboard box",
    message: "If I fits, I sits. A perfect little hideaway.",
  },
  {
    id: "bench",
    x: 1010,
    y: 760,
    radius: 120,
    prompt: "Take a little breather",
    message: "A warm seat, a quiet garden. Life is pretty good.",
  },
  {
    id: "pond",
    x: 1300,
    y: 1000,
    radius: 170,
    prompt: "Watch the pond",
    message: "Just a little ripple. The fish say hello.",
  },
  {
    id: "cafe",
    x: 1960,
    y: 770,
    radius: 155,
    prompt: "Sniff the café table",
    message: "Chamomile tea. Sadly, no tuna sandwiches.",
  },
  {
    id: "bike",
    x: 1810,
    y: 480,
    radius: 115,
    prompt: "Give the bicycle bell a little tap",
    message: "Brrring! Meowie announces the arrival of one very important cat.",
  },
  {
    id: "mailbox",
    x: 650,
    y: 450,
    radius: 105,
    prompt: "Peek inside the little mailbox",
    message: "A postcard from a friend: ‘Wish you were here. Bring sardines.’",
  },
  {
    id: "chime",
    x: 910,
    y: 640,
    radius: 105,
    prompt: "Nudge the garden wind chimes",
    message: "Ting, ting. A tiny concert, just for Meowie.",
  },
  {
    id: "yarn",
    x: 930,
    y: 1260,
    radius: 100,
    prompt: "Bat the little ball of yarn",
    message: "One little paw. One excellent wobble. Again?",
  },
];
