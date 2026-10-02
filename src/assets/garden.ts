import { fences, WORLD } from "../config/world";
// A single vector floor keeps the illustration crisp without thousands of draw calls.
export function gardenSVG() {
  let seed = 23;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let grass = "";
  for (let i = 0; i < 850; i++) {
    const x = 80 + rand() * 2240,
      y = 110 + rand() * 1610;
    grass += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}l-3-6m3 6 4-4" stroke="${i % 2 ? "#a7b88a" : "#bac59a"}" stroke-width="2" opacity=".45"/>`;
  }
  const path = `M1100 1830C1200 1580 965 1360 1080 1130S980 620 1120 450S1430 230 1380-40M1080 1130C900 1140 600 1110 510 950S510 540 490 270M1090 1120C1400 1160 1760 1090 1910 950S1930 600 2060 380M1130 1420C1520 1450 1700 1350 1990 1400`;
  const beds = [
    [335, 635, 310, 350],
    [1820, 1230, 290, 285],
  ]
    .map(
      ([x, y, w, h]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="60" fill="#b7ba91"/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="55" fill="#bfc6a0"/>`,
    )
    .join("");
  const fenceArt = fences
    .map((f) => {
      const horizontal = f.w > f.h;
      let s = `<path d="M${f.x - f.w / 2} ${f.y}h${f.w}" stroke="#c1b39a" stroke-width="8"/>`;
      if (!horizontal)
        s = `<path d="M${f.x} ${f.y - f.h / 2}v${f.h}" stroke="#c1b39a" stroke-width="8"/>`;
      for (let i = 0; i < (horizontal ? f.w : f.h); i += 25) {
        const x = horizontal ? f.x - f.w / 2 + i : f.x,
          y = horizontal ? f.y : f.y - f.h / 2 + i;
        s += `<rect x="${x - 5}" y="${y - 19}" width="10" height="35" rx="3" fill="#ecdfc5" stroke="#c8b99b" stroke-width="1.5"/>`;
      }
      return s;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WORLD.width}" height="${WORLD.height}" viewBox="0 0 2400 1800"><rect width="2400" height="1800" fill="#b8c59b"/><rect x="65" y="75" width="2270" height="1650" rx="170" fill="#cbd3ad"/>${grass}${beds}<path d="${path}" fill="none" stroke="#bfc39e" stroke-width="138" stroke-linecap="round"/><path d="${path}" fill="none" stroke="#eee1c6" stroke-width="118" stroke-linecap="round"/><path d="${path}" fill="none" stroke="#f4e8d1" stroke-width="102" stroke-linecap="round"/><ellipse cx="1990" cy="815" rx="245" ry="260" fill="#e9ddc4"/><g stroke="#d9ceb7" stroke-width="2" opacity=".7">${Array.from({ length: 9 }, (_, i) => `<path d="M1780 ${630 + i * 47}h420"/>`).join("")}</g><ellipse cx="1300" cy="820" rx="203" ry="149" fill="#b1bc9c"/><ellipse cx="1300" cy="813" rx="191" ry="138" fill="#dfd8bc"/><ellipse cx="1300" cy="808" rx="177" ry="122" fill="#8ebbb2"/><ellipse cx="1300" cy="794" rx="160" ry="108" fill="#a2c9bd"/><path d="M1200 774q36-12 70 0m40 45q55-12 103-1m-163 35q30-6 53-2" stroke="#d9e8cc" stroke-width="5" fill="none" stroke-linecap="round"/><g fill="#82a878"><ellipse cx="1190" cy="840" rx="21" ry="13"/><ellipse cx="1401" cy="766" rx="23" ry="14"/></g><g fill="#edc7bc"><circle cx="1190" cy="837" r="7"/><circle cx="1402" cy="762" r="7"/></g>${fenceArt}<g fill="#e4dcc2" stroke="#c1bea2" stroke-width="2">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${1260 + i * 33}" cy="${1370 + Math.sin(i) * 18}" rx="22" ry="15"/>`).join("")}</g><g font-family="Georgia,serif" font-style="italic" font-size="24" fill="#718260" opacity=".8"><text x="380" y="1040">the flower patch</text><text x="1850" y="1120">Café Chamomile</text><text x="1210" y="650">the lily pond</text><text x="1820" y="1530">the kitchen garden</text></g><g fill="#e9dfbe">${[
    [800, 720],
    [1570, 990],
    [320, 1120],
    [2200, 520],
    [680, 1520],
  ]
    .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="25" ry="15"/>`)
    .join("")}</g></svg>`;
}
