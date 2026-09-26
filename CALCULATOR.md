# Cold-process NaOH calculation

The first SoapSpice calculator is for bar-soap formulations using sodium hydroxide (NaOH). It is educational and does not certify a safe finished soap. It assumes **pure NaOH (100% purity)** and does not calculate KOH or adjust for impure lye. All mass calculations use grams internally.

For each oil:

```text
oil mass in g × that oil's NaOH SAP (g NaOH / g oil)
```

Sum those values for the theoretical NaOH at 0% superfat:

```text
theoretical NaOH = Σ(oil mass × NaOH SAP)
NaOH to weigh = theoretical NaOH × (1 − superfat / 100)
mixing liquid to weigh = NaOH to weigh × 2
fragrance weight = entered grams, entered ounces × 28.349523125, or total oil mass × entered percent / 100
total mixture before saponification = total oil mass + NaOH to weigh + mixing liquid + fragrance weight
```

The calculator uses a fixed **2:1 liquid-to-NaOH ratio by weight** as a starting point (for distilled water, about 33.3% NaOH by combined solution mass). It is not an ingredient-specific optimum: oil SAP values and fragrance quantities do not determine how much liquid a particular making method needs. Oil amounts can be entered in grams, ounces, or percent of total oils; fragrance amounts can use the same units, with percent meaning percent of total oil weight. Fragrance contributes to final batch mass but not to the NaOH or liquid calculation. The calculator validates oil percentages and weights, source-backed SAP values, positive fragrance amounts and names, and superfat of 0–15%. It does **not** check fragrance skin-safety limits. Higher superfat values should be treated with extra care.

Example using source-linked reference values: 500 g olive oil × 0.135, 300 g coconut oil (76°) × 0.183, and 200 g shea butter × 0.128 gives 148.0 g theoretical NaOH. With 5% superfat, NaOH is 140.6 g, and the recommended mixing liquid is 281.2 g (2 × 140.6). If 20 g fragrance is added, the pre-saponification total is 1,441.8 g. The fragrance does not change the 140.6 g NaOH.

The catalog SAP records cite published sources such as [SoapCalc's oil list](https://soapcalc.net/oil-list). They have **not yet been administrator-reviewed** and can vary with a supplier's material. Check the oil variety, source values, measurements, and lye purity independently. If using milk or another liquid, this calculator counts its full weight as mixing liquid but does not account for its sugars, fats, or handling differences; use a tested recipe and method. Check the specific fragrance's supplier guidance and applicable IFRA maximum for cold-process soap. Wear appropriate protective equipment, slowly add lye to the measured liquid (never the reverse), and follow established ventilation and handling procedures.

The pure calculation and validation functions live in `artifacts/soapspice/src/lib/formulation.ts`. Run `pnpm --filter @workspace/soapspice run test:calculator` for the included deterministic checks. Re-test against independently reviewed reference cases before relying on this for real soapmaking.