export const cats = [
  {
    id: "tuxedo-blaze",
    label: "Blaze tuxedo",
    description: "Black and white, with a white nose blaze",
    fur: "#34423d",
    stripes: false,
    white: true,
    blaze: true,
  },
  {
    id: "tuxedo-mask",
    label: "Masked tuxedo",
    description: "A dark face, white muzzle, chest and paws",
    fur: "#34423d",
    stripes: false,
    white: true,
    blaze: false,
  },
  {
    id: "tabby-socks",
    label: "Tabby & socks",
    description: "Striped tabby, with a white chest and paws",
    fur: "#a49477",
    stripes: true,
    white: true,
    blaze: false,
  },
  {
    id: "tabby",
    label: "Classic tabby",
    description: "A striped tabby from nose to toes",
    fur: "#a49477",
    stripes: true,
    white: false,
    blaze: false,
  },
] as const;

export type CatCoat = (typeof cats)[number]["id"];
export const DEFAULT_CAT: CatCoat = "tuxedo-blaze";

export function isCatCoat(value: unknown): value is CatCoat {
  return cats.some((cat) => cat.id === value);
}
