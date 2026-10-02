export const icons = {
  paw: '<path d="M8 14c-4 0-5 6-1 7 2 1 3-1 5-1s3 2 5 1c4-1 3-7-1-7-2-4-6-4-8 0Z"/><ellipse cx="5" cy="10" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="5" rx="2" ry="3"/><ellipse cx="21" cy="10" rx="2" ry="3"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4Zm13-1q5 4 0 8m3-11q8 7 0 14"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4Zm13 0 5 6m0-6-5 6"/>',
  pause: '<path d="M9 5v14m6-14v14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  fish: '<path d="m7 12-5-5v10Zm0 0c4-11 14-8 15 0-1 8-11 11-15 0Z"/><path d="M15 7q-4 5 0 10m3-7v.1"/>',
};
export function icon(name: keyof typeof icons) {
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="${name === "paw" ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}
