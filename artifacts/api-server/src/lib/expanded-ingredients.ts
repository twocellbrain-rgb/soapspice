import type { InsertIngredient } from "@workspace/db";

type ReferenceIngredient = Pick<
  InsertIngredient,
  "id" | "name" | "alternateNames" | "category" | "description" | "naohSap" | "kohSap"
>;

// SoapCalc's chart distinguishes these varieties. They are reference values,
// not a substitute for checking the particular oil or butter from a supplier.
const referenceIngredients: ReferenceIngredient[] = [
  {
    id: "apricot-kernel-oil", name: "Apricot Kernel Oil", alternateNames: ["Apricot Kernal Oil"],
    category: "oil", description: "A mild liquid oil used in blended bars. Check the supplier's specification before substituting another kernel oil.",
    naohSap: 0.139, kohSap: 0.195,
  },
  {
    id: "argan-oil", name: "Argan Oil", alternateNames: ["Argania spinosa kernel oil"],
    category: "oil", description: "A rich specialty oil usually used in smaller amounts in a soap formula.",
    naohSap: 0.136, kohSap: 0.191,
  },
  {
    id: "babassu-oil", name: "Babassu Oil", alternateNames: ["Orbignya oleifera seed oil"],
    category: "oil", description: "A firm tropical oil that can contribute hardness and bubbly lather. Its SAP is not interchangeable with coconut oil.",
    naohSap: 0.175, kohSap: 0.245,
  },
  {
    id: "borage-oil", name: "Borage Oil", alternateNames: ["Borage Seed Oil"],
    category: "oil", description: "A delicate liquid seed oil; use a fresh supply and account for its shorter shelf life.",
    naohSap: 0.135, kohSap: 0.190,
  },
  {
    id: "canola-oil-high-oleic", name: "Canola Oil (high oleic)", alternateNames: ["Canola Oil, High Oleic"],
    category: "oil", description: "A high-oleic canola variety. Confirm this grade rather than assuming the value applies to ordinary canola oil.",
    naohSap: 0.133, kohSap: 0.186,
  },
  {
    id: "fractionated-coconut-oil", name: "Fractionated Coconut Oil",
    alternateNames: ["Caprylic/Capric Triglycerides", "Caprylic/Capric Triglycerides - Fractionated Coconut Oil"],
    category: "oil", description: "Caprylic/capric triglycerides have a very different SAP from solid coconut oil. Use only for a matching fractionated product.",
    naohSap: 0.232, kohSap: 0.325,
  },
  {
    id: "carrot-seed-oil-cold-pressed", name: "Carrot Seed Oil (cold-pressed)",
    alternateNames: ["Daucus carota seed oil"],
    category: "oil", description: "The cold-pressed fatty seed oil, not carrot seed essential oil or a carrot-infused carrier oil.",
    naohSap: 0.103, kohSap: 0.144,
  },
  {
    id: "cupuacu-butter", name: "Cupuacu Butter", alternateNames: ["Cupuaçu Butter"],
    category: "butter", description: "A firm plant butter used to add richness to a soap blend. Confirm the supplier's butter specification.",
    naohSap: 0.137, kohSap: 0.192,
  },
  {
    id: "evening-primrose-oil", name: "Evening Primrose Oil", alternateNames: ["Oenothera biennis oil"],
    category: "oil", description: "A delicate liquid oil best used fresh and in a considered blend.",
    naohSap: 0.135, kohSap: 0.190,
  },
  {
    id: "grapeseed-oil", name: "Grapeseed Oil", alternateNames: ["Grape Seed Oil"],
    category: "oil", description: "A light liquid oil; its fatty acid profile can make shelf life a consideration in soap.",
    naohSap: 0.129, kohSap: 0.181,
  },
  {
    id: "jojoba-oil-golden", name: "Jojoba Oil (golden)", alternateNames: ["Jojoba Oil, Golden"],
    category: "oil", description: "Technically a liquid wax ester. Use the jojoba-specific reference value, not a seed-oil SAP.",
    naohSap: 0.066, kohSap: 0.092,
  },
  {
    id: "kokum-butter", name: "Kokum Butter", alternateNames: ["Garcinia indica seed butter"],
    category: "butter", description: "A firm butter that can add structure to a finished bar.",
    naohSap: 0.135, kohSap: 0.190,
  },
  {
    id: "kukui-nut-oil", name: "Kukui Nut Oil", alternateNames: ["Kukui Oil"],
    category: "oil", description: "A liquid nut oil; check freshness and the supplier's oil specification.",
    naohSap: 0.135, kohSap: 0.189,
  },
  {
    id: "mango-butter", name: "Mango Butter", alternateNames: ["Mango Seed Butter"],
    category: "butter", description: "A firm seed butter that can contribute to a harder bar.",
    naohSap: 0.136, kohSap: 0.191,
  },
  {
    id: "marula-oil", name: "Marula Oil", alternateNames: ["Sclerocarya birrea seed oil"],
    category: "oil", description: "A liquid specialty oil that can be part of a balanced soap blend.",
    naohSap: 0.137, kohSap: 0.192,
  },
  {
    id: "moringa-seed-oil", name: "Moringa Seed Oil", alternateNames: ["Moringa Oil"],
    category: "oil", description: "A relatively stable seed oil; use the seed-oil specification rather than a botanical extract.",
    naohSap: 0.137, kohSap: 0.192,
  },
  {
    id: "murumuru-butter", name: "Murumuru Butter", alternateNames: ["Astrocaryum murumuru seed butter"],
    category: "butter", description: "A hard butter with a high SAP value. Do not substitute another butter without recalculating lye.",
    naohSap: 0.196, kohSap: 0.275,
  },
  {
    id: "hemp-seed-oil", name: "Hemp Seed Oil", alternateNames: ["Natural Hemp Seed Oil", "Hemp Oil"],
    category: "oil", description: "A delicate seed oil; keep it fresh and distinguish it from compounded hemp butter.",
    naohSap: 0.138, kohSap: 0.193,
  },
  {
    id: "neem-oil", name: "Neem Oil", alternateNames: ["Neem Seed Oil"],
    category: "oil", description: "A strongly scented seed oil often used in small amounts. This entry is for neem seed oil.",
    naohSap: 0.138, kohSap: 0.193,
  },
  {
    id: "oat-oil", name: "Oat Oil", alternateNames: ["Avena sativa kernel oil"],
    category: "oil", description: "An oat-derived liquid oil, not oat extract or colloidal oatmeal.",
    naohSap: 0.135, kohSap: 0.190,
  },
  {
    id: "olive-oil-pomace", name: "Olive Oil (pomace)", alternateNames: ["Olive Oil - Pomace"],
    category: "oil", description: "Pomace-grade olive oil has its own reference SAP; select regular olive oil for other grades.",
    naohSap: 0.134, kohSap: 0.188,
  },
  {
    id: "palm-kernel-flakes-hydrogenated", name: "Palm Kernel Flakes (hydrogenated)",
    alternateNames: ["Palm Kernel Oil Flakes, hydrogenated"],
    category: "oil", description: "Hydrogenated palm-kernel flakes. Confirm the product is this grade rather than ordinary palm kernel or palm oil.",
    naohSap: 0.176, kohSap: 0.247,
  },
  {
    id: "palm-oil", name: "Palm Oil", alternateNames: ["Elaeis guineensis fruit oil"],
    category: "oil", description: "Palm fruit oil, distinct from palm kernel oil. Mix a separated container thoroughly before weighing.",
    naohSap: 0.142, kohSap: 0.199,
  },
  {
    id: "plum-kernel-oil", name: "Plum Kernel Oil", alternateNames: ["Plum Oil"],
    category: "oil", description: "Oil pressed from plum kernels; check that the supplier's product is kernel oil.",
    naohSap: 0.138, kohSap: 0.194,
  },
  {
    id: "raspberry-seed-oil", name: "Raspberry Seed Oil", alternateNames: ["Rubus idaeus seed oil"],
    category: "oil", description: "A delicate seed oil used in a blended formula. Confirm freshness before making a batch.",
    naohSap: 0.133, kohSap: 0.187,
  },
  {
    id: "rosehip-seed-oil", name: "Rosehip Seed Oil", alternateNames: ["Rosehip Oil"],
    category: "oil", description: "A delicate rosehip seed oil; distinguish it from infused rosehip preparations.",
    naohSap: 0.133, kohSap: 0.187,
  },
  {
    id: "safflower-oil", name: "Safflower Oil", alternateNames: ["Carthamus tinctorius seed oil"],
    category: "oil", description: "A liquid seed oil. Check whether your supplier's grade is ordinary or high oleic before substituting.",
    naohSap: 0.137, kohSap: 0.192,
  },
  {
    id: "shea-oil-fractionated", name: "Shea Oil (fractionated)", alternateNames: ["Fractionated Shea Oil"],
    category: "oil", description: "A fractionated liquid shea oil, not whole shea butter. Check the supplier's processing and SAP.",
    naohSap: 0.132, kohSap: 0.185,
  },
  {
    id: "sweet-almond-oil", name: "Sweet Almond Oil", alternateNames: ["Almond Oil, sweet"],
    category: "oil", description: "A liquid sweet-almond oil for blended formulas; not bitter almond essential oil.",
    naohSap: 0.139, kohSap: 0.195,
  },
  {
    id: "tamanu-oil", name: "Tamanu Oil", alternateNames: ["Kamani Oil"],
    category: "oil", description: "A strongly scented tamanu/kamani oil with a higher SAP than many liquid seed oils.",
    naohSap: 0.148, kohSap: 0.208,
  },
  {
    id: "palm-kernel-oil", name: "Palm Kernel Oil", alternateNames: ["Unrefined Palm Kernel Oil"],
    category: "oil", description: "Oil from the palm kernel, distinct from palm fruit oil and hydrogenated palm-kernel flakes.",
    naohSap: 0.176, kohSap: 0.247,
  },
  {
    id: "watermelon-seed-oil", name: "Watermelon Seed Oil", alternateNames: ["Watermelon Oil"],
    category: "oil", description: "A light seed oil; this reference is for watermelon seeds rather than a fruit extract.",
    naohSap: 0.135, kohSap: 0.190,
  },
  {
    id: "wheat-germ-oil", name: "Wheat Germ Oil", alternateNames: ["Triticum vulgare germ oil"],
    category: "oil", description: "A rich germ oil that can oxidize; check freshness and use the supplier's specification.",
    naohSap: 0.130, kohSap: 0.183,
  },
];

export const expandedIngredients: InsertIngredient[] = referenceIngredients.map((ingredient): InsertIngredient => ({
  ...ingredient,
  sapSourceTitle: "SoapCalc Oil List — SAP Value (KOH - NaOH)",
  sapSourceUrl: "https://soapcalc.net/oil-list",
  verificationStatus: "source-linked-needs-review",
})).concat({
  id: "apple-seed-oil",
  name: "Apple Seed Oil",
  alternateNames: ["Pyrus malus seed oil"],
  category: "oil",
  description: "A reference for neat apple seed oil, not an apple extract or infused carrier. The source's decimal lye ratios are derived from an average SAP range; verify your supplier's value.",
  naohSap: 0.138,
  kohSap: 0.193,
  sapSourceTitle: "From Nature With Love — Saponification Chart",
  sapSourceUrl: "https://www.fromnaturewithlove.com/resources/sapon.asp",
  verificationStatus: "source-linked-needs-review",
});