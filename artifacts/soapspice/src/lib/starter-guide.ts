export const starterGuideTools = [
  {
    slug: "safety-gear",
    title: "Protective gear",
    label: "Start here",
    description:
      "Use chemical splash goggles, alkali-resistant gloves, long sleeves, and closed shoes whenever sodium hydroxide is handled. Ordinary glasses do not protect against splashes.",
  },
  {
    slug: "digital-scale",
    title: "A reliable digital scale",
    label: "Essential",
    description:
      "Weigh every oil, liquid, and sodium hydroxide (NaOH) amount by mass. Choose a stable scale that reads in grams and has enough capacity for your bowl plus the full batch.",
  },
  {
    slug: "lye-safe-containers",
    title: "Sodium-hydroxide-safe containers and utensils",
    label: "Essential",
    description:
      "Use dedicated, clearly marked HDPE (#2) or polypropylene (#5) containers for NaOH solution and stainless-steel tools where appropriate. Never use aluminum with sodium hydroxide.",
  },
  {
    slug: "stick-blender",
    title: "An immersion blender",
    label: "Helpful",
    description:
      "A dedicated stick blender makes small-batch mixing more predictable. Keep the head fully submerged before switching it on and use short pulses to avoid splashes.",
  },
  {
    slug: "mold-and-cutter",
    title: "A mold and cutting tools",
    label: "Essential",
    description:
      "A supported silicone loaf mold is a practical first setup. A straight-edged cutter or scraper can portion the loaf after it is firm enough to cut.",
  },
  {
    slug: "finishing-tools",
    title: "Temperature and finishing tools",
    label: "Useful extras",
    description:
      "A digital thermometer helps you compare batch temperatures, while a silicone spatula and ventilated curing rack make pouring, cleanup, and curing easier.",
  },
] as const;

export type StarterGuideToolSlug = (typeof starterGuideTools)[number]["slug"];