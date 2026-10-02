import { cats, DEFAULT_CAT, type CatCoat } from "../config/cats";
const ink = "#526052";
const wrap = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
export const textures: Record<string, string> = {
  tree: wrap(
    220,
    260,
    `<ellipse cx="110" cy="235" rx="78" ry="19" fill="#354d38" opacity=".12"/><path d="M104 150L99 235Q110 247 122 235L116 146" fill="#a08e6f"/><path d="M107 191l-25-25m28 15 26-27" stroke="#89775f" stroke-width="8"/><path d="M45 165C-12 121 29 65 55 65C48 3 132-4 146 42C204 22 230 91 199 112C236 169 159 213 122 187C87 208 49 193 45 165" fill="#73946f" stroke="#658764" stroke-width="3"/><path d="M50 102C43 53 101 33 127 63C161 40 200 88 174 114C137 96 105 130 69 117" fill="#91ac80"/><path d="M58 154q22 20 47 7m42-14q19 12 35-5" stroke="#a9bd92" stroke-width="4" fill="none"/><path d="M79 70l7-9m52 24 9-2m-58 65 6 4" stroke="#c0cc9f" stroke-width="5"/>`,
  ),
  bush: wrap(
    150,
    90,
    `<ellipse cx="75" cy="74" rx="67" ry="12" fill="#405d42" opacity=".1"/><path d="M10 68C-1 36 25 23 43 31C45-1 90-1 99 30C133 14 156 50 139 68Q75 98 10 68" fill="#829c73"/><path d="M31 42l9-4m29-17 9 1m31 22 8-3m-58 20 9 1" stroke="#b4c59b" stroke-width="5"/><circle cx="44" cy="61" r="4" fill="#e3b79b"/><circle cx="115" cy="58" r="4" fill="#e3b79b"/>`,
  ),
  house: wrap(
    350,
    330,
    `<ellipse cx="177" cy="307" rx="163" ry="17" fill="#475641" opacity=".1"/><path d="M39 143h269v161H39Z" fill="#efdcc1" stroke="#d6c6aa" stroke-width="3"/><path d="M29 154L80 39h192l55 115Z" fill="#ba7760" stroke="#a16c58" stroke-width="4"/><path d="M61 132h234M69 108h215M80 83h192M92 59h170" stroke="#ce9477" stroke-width="4"/><path d="M245 49V19h28v53" fill="#d4b09a"/><rect x="147" y="206" width="58" height="97" rx="27" fill="#779083"/><rect x="60" y="189" width="59" height="60" rx="5" fill="#91b6b4" stroke="#fcf0db" stroke-width="8"/><rect x="235" y="189" width="49" height="60" rx="5" fill="#91b6b4" stroke="#fcf0db" stroke-width="8"/><path d="M89 165v86m-31-30h61m140-39v68m-25-30h50" stroke="#f8e8cb" stroke-width="4"/><circle cx="192" cy="257" r="3" fill="#eed5a0"/><rect x="135" y="300" width="84" height="8" rx="3" fill="#b8b4a0"/><path d="M52 260h77l-7 17H57Z" fill="#c48b71"/><path d="M60 258q8-31 18-4q12-39 22-2q16-30 22 6" fill="#839b71"/><circle cx="77" cy="246" r="6" fill="#e9b39b"/><circle cx="105" cy="245" r="6" fill="#e9b39b"/>`,
  ),
  bench: wrap(
    180,
    120,
    `<ellipse cx="90" cy="104" rx="80" ry="12" fill="#475641" opacity=".12"/><path d="M29 56v46m119-46v46" stroke="${ink}" stroke-width="9"/><rect x="16" y="25" width="148" height="18" rx="5" fill="#be9870"/><rect x="16" y="47" width="148" height="16" rx="4" fill="#cca981"/><path d="M15 70h150l-8 18H24Z" fill="#d5b38d"/><path d="M18 64v20m145-20v20" stroke="${ink}" stroke-width="7"/>`,
  ),
  table: wrap(
    170,
    170,
    `<ellipse cx="85" cy="146" rx="69" ry="14" fill="#475641" opacity=".1"/><path d="M63 82l-18 59m52-59 26 59" stroke="#788579" stroke-width="6"/><rect x="11" y="62" width="29" height="55" rx="9" fill="#bd9272"/><rect x="131" y="62" width="29" height="55" rx="9" fill="#bd9272"/><ellipse cx="85" cy="70" rx="53" ry="43" fill="#f5e9d0" stroke="#d9cbb0" stroke-width="4"/><ellipse cx="87" cy="68" rx="21" ry="16" fill="#e0d4bb"/><circle cx="78" cy="60" r="10" fill="#faf8ed"/><circle cx="78" cy="60" r="6" fill="#b29977"/><path d="M99 79V56" stroke="#6f916c" stroke-width="3"/><path d="M99 64q-17-17-17-4m17 3q17-17 17-5" fill="#91a77b"/><path d="M94 72h11l-2 13h-7Z" fill="#ca9b7c"/>`,
  ),
  bike: wrap(
    170,
    130,
    `<ellipse cx="85" cy="112" rx="76" ry="9" fill="#475641" opacity=".1"/><g fill="none" stroke="#526359" stroke-width="5"><circle cx="36" cy="84" r="27"/><circle cx="134" cy="84" r="27"/></g><path d="M36 84l32-45 25 45H36l58-34 40 34-18-63h-14" fill="none" stroke="#bd7d60" stroke-width="5"/><path d="M63 38h22m30-17 16-5" stroke="#4e5d50" stroke-width="6"/><path d="M111 33h30l-4 19h-22Z" fill="#ceae7e"/><path d="M123 34l-4-15m9 14 6-18" stroke="#7d9c70" stroke-width="4"/>`,
  ),
  box: wrap(
    120,
    110,
    `<ellipse cx="60" cy="95" rx="51" ry="10" fill="#475641" opacity=".1"/><path d="M20 41h79v49l-39 10-40-14Z" fill="#c9a478"/><path d="M20 41l40 14 39-14-41-14Z" fill="#8e765c"/><path d="M60 55v45" stroke="#b48f63" stroke-width="2"/><path d="M20 41L7 20l41 13 12 22m0 0 12-22 41-13-14 21" fill="#e0bf90" stroke="#b99569" stroke-width="2"/><path d="M29 66l17 6m-17 3 13 5" stroke="#a78a68" stroke-width="3"/>`,
  ),
  mailbox: wrap(
    90,
    140,
    `<ellipse cx="45" cy="128" rx="32" ry="9" fill="#475641" opacity=".12"/><path d="M42 61v65h11V61" fill="#aa9273"/><path d="M12 59V35C12 7 65 7 65 35v28H12Z" fill="#8ea697" stroke="#6c887b" stroke-width="3"/><path d="M49 16q25-5 28 20v28H52V35q0-14-9-19" fill="#b5c4a9" stroke="#6c887b" stroke-width="3"/><path d="M56 48h15" stroke="#5e7c6b" stroke-width="3"/><path d="M24 46V22h17v11H26" fill="#d2a17d" stroke="#ae7e61" stroke-width="2"/><path d="M53 92l9-3" stroke="#c7b18d" stroke-width="3"/>`,
  ),
  chime: wrap(
    130,
    190,
    `<ellipse cx="65" cy="177" rx="36" ry="9" fill="#475641" opacity=".1"/><path d="M91 173V27Q90 5 65 8H26" fill="none" stroke="#7d8d76" stroke-width="6"/><path d="M28 10v26" stroke="#a89472" stroke-width="2"/><path d="M6 39q23-27 47 0Z" fill="#c5a77b" stroke="#a88b64" stroke-width="2"/><g stroke="#93896d" stroke-width="2"><path d="M14 39v16m14-16v23m14-23v15m-14-15v73"/></g><g fill="#d9bd8c" stroke="#b29c76" stroke-width="2"><rect x="10" y="54" width="8" height="39" rx="3"/><rect x="24" y="62" width="8" height="42" rx="3"/><rect x="38" y="53" width="8" height="36" rx="3"/></g><path d="M28 109l9 12-9 13-9-13Z" fill="#8fa996"/><path d="M92 55h12m-12 15h8" stroke="#a9b598" stroke-width="3"/>`,
  ),
  yarn: wrap(
    92,
    65,
    `<ellipse cx="45" cy="55" rx="35" ry="7" fill="#475641" opacity=".12"/><path d="M47 47q27 4 30-8t13-9" stroke="#b77d71" stroke-width="3" fill="none"/><circle cx="34" cy="32" r="24" fill="#d6a499" stroke="#b8867c" stroke-width="2"/><g stroke="#b8867c" stroke-width="2" fill="none"><path d="M19 13q5 22 35 30M13 23q14 17 38 24M13 34q13 10 30 15M24 10q9 16 31 23M40 10Q19 27 25 53M49 15Q29 29 35 55"/></g><path d="M18 23q5-8 12-9" stroke="#e9c1b4" stroke-width="3" fill="none"/>`,
  ),
  pot: wrap(
    65,
    85,
    `<ellipse cx="33" cy="76" rx="26" ry="7" fill="#475641" opacity=".1"/><path d="M12 43h41l-7 33H19Z" fill="#c18a70"/><rect x="9" y="40" width="47" height="9" rx="3" fill="#dba085"/><path d="M31 41V13m0 15q-24-30-23-5m24 12q24-28 25-12" stroke="#7c9469" stroke-width="3" fill="#94a77b"/><circle cx="30" cy="12" r="10" fill="#e7bd98"/><circle cx="30" cy="12" r="4" fill="#b48b64"/>`,
  ),
  flowers: wrap(
    110,
    90,
    `<ellipse cx="55" cy="80" rx="44" ry="6" fill="#6f925f" opacity=".1"/>${[25, 52, 79].map((x, i) => `<path d="M${x} 79v-${35 + i * 9}m0 24q-18-20-17-6m17-4q18-19 17-6" stroke="#78976a" stroke-width="3" fill="#a1b084"/><g fill="${i === 1 ? "#edd6ad" : "#dba085"}"><circle cx="${x}" cy="${43 - i * 9}" r="12"/><circle cx="${x}" cy="${43 - i * 9}" r="4" fill="#a98558"/></g>`).join("")}`,
  ),
  fish: wrap(
    64,
    40,
    `<path d="M17 20L4 8v24Z" fill="#7caca7" stroke="#507c79" stroke-width="2"/><ellipse cx="36" cy="20" rx="24" ry="13" fill="#b4d8ce" stroke="#507c79" stroke-width="2"/><path d="M31 8l6-6 9 8m-15 20 7 7 7-7" fill="#7caca7"/><path d="M33 11q-7 9 0 18" stroke="#81aca4" stroke-width="2" fill="none"/><circle cx="48" cy="17" r="2.5" fill="#3d605c"/><path d="M37 14h4m-6 5h4m-3 5h4" stroke="#edf9df" stroke-width="2"/>`,
  ),
  butterfly: wrap(
    36,
    30,
    `<path d="M18 16C-4-8-3 25 14 22C4 35 23 33 18 16M18 16C40-8 39 25 22 22C32 35 13 33 18 16" fill="#e2ae82"/><path d="M18 11v14" stroke="#88765a" stroke-width="2"/>`,
  ),
  bird: wrap(
    32,
    32,
    `<ellipse cx="15" cy="19" rx="10" ry="8" fill="#8b9b86"/><circle cx="23" cy="12" r="7" fill="#8b9b86"/><path d="M28 12l4 3-5 2M6 20l-6-6 2 12" fill="#c9ad7b"/><path d="M10 16q9-3 11 7" fill="#b6c4a1"/><circle cx="25" cy="11" r="1.5" fill="#4d584b"/>`,
  ),
};
export function catTexture(direction: string, frame: number, coat: CatCoat = DEFAULT_CAT) {
  const cat = cats.find((cat) => cat.id === coat)!;
  const fur = cat.fur;
  const white = "#faf4e5";
  const stripe = "#615a4b";
  const muzzle = cat.white ? white : "#d7c5a3";
  const paws = cat.white ? "#f5f0e1" : fur;
  const side = direction === "left" || direction === "right";
  const step = frame % 2 === 0 ? 0 : 3;
  const bodyStripes = cat.stripes
    ? `<g clip-path="url(#coat-body)" fill="none" stroke="${stripe}" stroke-width="3.5"><path d="M23 42l10 4m-10 6 10 3m-7 6 8 2m23-21-10 4m10 6-10 3m7 6-8 2"/></g>`
    : "";
  const headStripes = cat.stripes
    ? `<g clip-path="url(#coat-head)" fill="none" stroke="${stripe}" stroke-width="2.6"><path d="M32 17l3 8 5-5 5 5 3-8M18 31l5 3m-5 4 5 2m39-9-5 3m5 4-5 2"/></g>`
    : "";
  const body = `<defs><clipPath id="coat-body"><ellipse cx="40" cy="49" rx="17" ry="22"/></clipPath><clipPath id="coat-head"><ellipse cx="40" cy="33" rx="23" ry="19"/></clipPath></defs><path d="M37 51C9 50 10 30 17 30" stroke="${fur}" stroke-width="8" fill="none"/>${cat.stripes ? `<path d="M12 34q-2-6 5-4" stroke="${stripe}" stroke-width="7" fill="none"/>` : ""}<ellipse cx="40" cy="49" rx="17" ry="22" fill="${fur}"/>${bodyStripes}${cat.white ? `<ellipse cx="40" cy="54" rx="10" ry="15" fill="${white}"/>` : ""}<ellipse cx="29" cy="${67 - step}" rx="7" ry="5" fill="${paws}"/><ellipse cx="51" cy="${67 + step}" rx="7" ry="5" fill="${paws}"/><path d="M20 29l1-22 16 13h8L59 7l2 22" fill="${fur}"/><path d="M24 13l1 14 8-5m22-9-1 14-8-5" fill="#cc9792"/><ellipse cx="40" cy="33" rx="23" ry="19" fill="${fur}"/>${headStripes}`;
  const faceMark = cat.blaze
    ? `<path d="M40 20l-7 17-9 6q16 19 32 0l-9-6Z" fill="${white}"/>`
    : `<ellipse cx="40" cy="44" rx="12" ry="8" fill="${muzzle}"/>`;
  const face =
    direction === "up"
      ? `<path d="M28 41q12 8 24 0" stroke="${cat.stripes ? stripe : "#47544b"}" stroke-width="3" fill="none"/>`
      : `${faceMark}<ellipse cx="28" cy="32" rx="4" ry="5" fill="#c4cf9a"/><ellipse cx="52" cy="32" rx="4" ry="5" fill="#c4cf9a"/><path d="M28 30v4m24-4v4" stroke="#33423c" stroke-width="2"/><path d="M36 40h8l-4 5Z" fill="#cc9792"/><path d="M40 45q-4 5-7 1m7-1q4 5 7 1M16 39l11 2m-12 4 11-1m27-3 11-2m-11 5 12 1" fill="none" stroke="#9fa99a" stroke-width="1.3"/>`;
  const sideMark = cat.blaze
    ? `<path d="M47 29q20 6 12 17l-16 5-9-15Z" fill="${white}"/>`
    : `<path d="M51 37q15-2 13 8l-12 6-8-7Z" fill="${muzzle}"/>`;
  const sideFace = `${sideMark}<ellipse cx="51" cy="30" rx="4" ry="5" fill="#c4cf9a"/><path d="M51 28v4" stroke="#33423c" stroke-width="2"/><path d="M58 38l7 2-5 4" fill="#cc9792"/><path d="M51 44h15m-14 3 12 3" stroke="#9fa99a" stroke-width="1.3"/>`;
  return wrap(
    80,
    80,
    `<g ${direction === "left" ? 'transform="translate(80 0) scale(-1 1)"' : ""}>${body}${side ? sideFace : face}</g>`,
  );
}
