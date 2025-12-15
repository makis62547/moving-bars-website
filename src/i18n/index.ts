import de from "./de.json";
import en from "./en.json";

export type Lang = "de" | "en";

const dict = { de, en } as const;

export function t(lang: Lang, key: string) {
  return key.split(".").reduce((o: any, i) => o?.[i], dict[lang]);
}
