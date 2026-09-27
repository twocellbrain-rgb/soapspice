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
fragrance weight = entered grams, entered ounces × 28.349523125, or total oil mass × entered percent / 100
mixing liquid to weigh = (total oil mass + NaOH to weigh + fragrance weight) × 0.22 / 0.78
total mixture before saponification = total oil mass + NaOH to weigh + mixing liquid + fragrance weight
```

This model targets **22% mixing liquid by weight of the complete pre-saponification batch** (oils + NaOH + fragrances + liquid itself), not 22% of the oils. The equation is solved explicitly: if liquid = 0.22 × (other ingredients + liquid), then liquid = other ingredients × 0.22 / 0.78. This is SoapSpice's approximation inspired by [Bramble Berry's typical ~22% liquid statement](https://www.brambleberry.com/soap/water-discounting-cold-process-soap.html), **not a verified reproduction of its calculator algorithm** or an ingredient-specific optimum. Unlike Bramble Berry's 97% NaOH purity assumption, SoapSpice continues to assume **100% pure NaOH**; check the label on your actual product before use. There is no water-discount or editable concentration control.

Oil amounts can be entered in grams, ounces, or percent of total oils; fragrance amounts can use the same units, with percent meaning percent of total oil weight. Fragrance increases batch mass and therefore the estimated liquid amount slightly, but does not change NaOH. The calculator validates oil percentages and weights, source-backed SAP values, positive fragrance amounts and names, and superfat of 0–15%. It does **not** check fragrance skin-safety limits. Higher superfat values should be treated with extra care.

Example using source-linked reference values: 500 g olive oil × 0.135, 300 g coconut oil (76°) × 0.183, and 200 g shea butter × 0.128 gives 148.0 g theoretical NaOH. With 5% superfat, NaOH is 140.6 g. With 20 g fragrance, estimated liquid is (1,000 + 140.6 + 20) × 0.22 / 0.78 ≈ 327.35 g, and the pre-saponification total is approximately 1,487.95 g. The fragrance does not change the 140.6 g NaOH.

The catalog SAP records cite published sources such as [SoapCalc's oil list](https://soapcalc.net/oil-list). They have **not yet been administrator-reviewed** and can vary with a supplier's material. Check the oil variety, source values, measurements, and lye purity independently. If using milk or another liquid, this calculator counts its full weight as mixing liquid but does not account for its sugars, fats, or handling differences; use a tested recipe and method. Check the specific fragrance's supplier guidance and applicable IFRA maximum for cold-process soap. Wear appropriate protective equipment, slowly add lye to the measured liquid (never the reverse), and follow established ventilation and handling procedures.

The pure calculation and validation functions live in `artifacts/soapspice/src/lib/formulation.ts`. Run `pnpm --filter @workspace/soapspice run test:calculator` for the included deterministic checks. Re-test against independently reviewed reference cases before relying on this for real soapmaking.