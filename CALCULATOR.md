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
distilled water = NaOH to weigh × (100 / lye concentration − 1)
total mixture before saponification = total oil mass + NaOH to weigh + water
```

The lye concentration is the NaOH mass divided by the combined NaOH-plus-water solution mass. This is not a water-as-percent-of-oils formula. The calculator validates that percentages total 100%, weights total the specified oil batch mass, every oil has a valid NaOH SAP value, every amount is positive, superfat is 0–15%, and lye concentration is 25–50%. Higher superfat values should be treated with extra care.

Example using source-linked reference values: 500 g olive oil × 0.135, 300 g coconut oil (76°) × 0.183, and 200 g shea butter × 0.128 gives 148.0 g theoretical NaOH. With 5% superfat, NaOH is 140.6 g. At 33% lye concentration, water is approximately 285.46 g.

The starter SAP records cite [SoapCalc's oil list](https://soapcalc.net/oil-list). They have **not yet been administrator-reviewed** and can vary with a supplier's material. Check the oil variety, the source values, measurements, and lye purity against independent trusted information before making a batch. Wear appropriate protective equipment, add lye to water (never the reverse), and follow established ventilation and handling procedures.

The pure calculation and validation functions live in `artifacts/soapspice/src/lib/formulation.ts`. Run `pnpm --filter @workspace/soapspice run test:calculator` for the included deterministic checks. Re-test against independently reviewed reference cases before relying on this for real soapmaking.