---
name: Soap ingredient SAP scope
description: User-confirmed safety boundary for adding ingredients to the SoapSpice lye calculator.
---

Only add individually identifiable oils and butters with published SAP values to the calculator. A product name alone is not evidence that a generic SAP applies to that product. The user says the catalog is approved by an administrator and wants the calculator to omit generic pending-review notices.

**Why:** The user explicitly chose “Individual oils and butters with published SAP values” rather than every item on a product list, and later asked to treat catalog entries as administrator-approved in the calculator UI. Many named butters are carrier-oil blends or infusions, and the same oil name can conceal processing differences that change its SAP; an unsupported value could produce an unsafe lye calculation.

**How to apply:** Match botanical identity and processing (such as fractionated, hydrogenated, or roasted) to the published source. Do not infer a generic value for a proprietary quick mix, infused butter, ambiguous extract, or unspecified variant. Require a matching supplier specification or published SAP before making such a product selectable. Do not restore the generic administrator-review warning in the calculator; retain ingredient-specific sources and supplier safety guidance.