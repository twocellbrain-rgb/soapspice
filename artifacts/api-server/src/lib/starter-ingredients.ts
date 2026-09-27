import { sql } from "drizzle-orm";
import { db, ingredientsTable, type InsertIngredient } from "@workspace/db";
import { expandedIngredients } from "./expanded-ingredients";

const sapSourceTitle = "SoapCalc Oil List — SAP Value (KOH - NaOH)";
const sapSourceUrl = "https://soapcalc.net/oil-list";

// These are source-linked reference values, not administrator-verified supplier
// specifications. The active catalog includes this distinction in every record.
const starterIngredients: InsertIngredient[] = [
  {
    id: "olive-oil",
    name: "Olive Oil",
    alternateNames: ["Olea europaea", "Olive Oil - Pure"],
    category: "oil",
    description:
      "A classic base oil for cold-process soap. It contributes a mild-feeling bar and can be used as the main oil in a formulation.",
    naohSap: 0.135,
    kohSap: 0.19,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
  {
    id: "coconut-oil-76",
    name: "Coconut Oil (76°)",
    alternateNames: ["Coconut Oil, 76 deg", "Cocos nucifera", "Virgin Coconut Oil"],
    category: "oil",
    description:
      "Often used to add firmness and generous bubbles. The 76° variety is distinct from fractionated coconut oil, which has different SAP values.",
    naohSap: 0.183,
    kohSap: 0.257,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
  {
    id: "castor-oil",
    name: "Castor Oil",
    alternateNames: ["Ricinus communis"],
    category: "oil",
    description:
      "A small amount of castor oil can help create a stable, creamy lather. Its distinctive ricinoleic acid content makes it useful in blends.",
    naohSap: 0.128,
    kohSap: 0.18,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
  {
    id: "shea-butter",
    name: "Shea Butter",
    alternateNames: ["Butyrospermum parkii", "Raw Shea Butter"],
    category: "butter",
    description:
      "A plant butter that contributes a creamy feel to soap. Weigh and melt solid butters fully before combining them with other oils.",
    naohSap: 0.128,
    kohSap: 0.179,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
  {
    id: "cocoa-butter",
    name: "Cocoa Butter",
    alternateNames: ["Theobroma cacao seed butter", "Cocoa Butter Pastilles", "Deodorized Cocoa Butter Wafers", "Organic Cocoa Butter Wafers"],
    category: "butter",
    description:
      "A firm butter that can contribute to a harder finished bar and a creamy lather. Its natural scent may not remain in finished soap.",
    naohSap: 0.138,
    kohSap: 0.194,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
  {
    id: "sunflower-oil",
    name: "Sunflower Oil",
    alternateNames: ["Helianthus annuus seed oil"],
    category: "oil",
    description:
      "A fluid oil used in blended cold-process recipes. Check the specific variety from your supplier before substituting oils.",
    naohSap: 0.135,
    kohSap: 0.189,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
  {
    id: "rice-bran-oil",
    name: "Rice Bran Oil (refined)",
    alternateNames: ["Oryza sativa bran oil", "Rice Bran Oil"],
    category: "oil",
    description:
      "A versatile liquid oil used in soapmaking blends. This reference entry applies to refined rice bran oil.",
    naohSap: 0.133,
    kohSap: 0.187,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
  {
    id: "avocado-oil",
    name: "Avocado Oil",
    alternateNames: ["Persea gratissima oil"],
    category: "oil",
    description:
      "A rich liquid oil often included in blended formulas. Confirm the supplier's oil specification when making substitutions.",
    naohSap: 0.133,
    kohSap: 0.186,
    sapSourceTitle,
    sapSourceUrl,
    verificationStatus: "source-linked-needs-review",
  },
];

export async function seedStarterIngredients(): Promise<void> {
  await db
    .insert(ingredientsTable)
    .values([...starterIngredients, ...expandedIngredients])
    .onConflictDoUpdate({
      target: ingredientsTable.id,
      // Only add search aliases; never overwrite reviewed SAP values, status,
      // descriptions, or the decision to deactivate an ingredient.
      set: {
        alternateNames: sql<string[]>`CASE WHEN ${ingredientsTable.verificationStatus} = 'administrator-verified' THEN ${ingredientsTable.alternateNames} ELSE ARRAY(SELECT DISTINCT alias FROM unnest(${ingredientsTable.alternateNames} || excluded.alternate_names) AS names(alias) ORDER BY alias) END`,
      },
    });
}