export type PackageRow = {
  id: string;
  title: string;
  recommendedFor: string;
  drinksIncluded: string;
  bartenders: string;
  barSetup: string;
  priceNoBackbarCents: number | null;
  priceWithBackbarCents: number | null;
};

export const pricing = {
  currency: "EUR",
  vatNote: "Alle Preise netto, zzgl. MwSt.",
  notes: {
    extraDrinkNetCents: 540,
    glassLossNetCents: 280,
    freeKm: 50,
  },
  packages: <PackageRow[]>[
    {
      id: "cc-small-100",
      title: "Cocktail Catering SMALL 100",
      recommendedFor: "30–50",
      drinksIncluded: "100",
      bartenders: "1",
      barSetup: "1× Bar 1,50 m (LED-RGB)",
      priceNoBackbarCents: 79000,
      priceWithBackbarCents: 89900,
    },
    {
      id: "cc-small-200",
      title: "Cocktail Catering SMALL 200",
      recommendedFor: "50–100",
      drinksIncluded: "200",
      bartenders: "1",
      barSetup: "1× Bar 1,50 m (LED-RGB)",
      priceNoBackbarCents: 119000,
      priceWithBackbarCents: 129900,
    },
    {
      id: "cc-medium-200",
      title: "Cocktail Catering MEDIUM 200",
      recommendedFor: "100–200",
      drinksIncluded: "200",
      bartenders: "2",
      barSetup: "1× Bar 3,00 m (LED-RGB)",
      priceNoBackbarCents: 159000,
      priceWithBackbarCents: 179900,
    },
    {
      id: "cc-medium-400",
      title: "Cocktail Catering MEDIUM 400",
      recommendedFor: "100–300",
      drinksIncluded: "400",
      bartenders: "2",
      barSetup: "1× Bar 3,00 m (LED-RGB)",
      priceNoBackbarCents: 239000,
      priceWithBackbarCents: 259900,
    },
    {
      id: "cc-maxi",
      title: "Cocktail Catering MAXI – auf Anfrage",
      recommendedFor: "ab 300",
      drinksIncluded: "individuell",
      bartenders: "individuell",
      barSetup: "nach Bedarf",
      priceNoBackbarCents: null,
      priceWithBackbarCents: null,
    },
  ],
};
