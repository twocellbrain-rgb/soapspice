import type { FragranceRow } from './formulation';

export type SupplierFragrance = {
  sku: string;
  name: string;
  ifraMaxPercent: number;
  assessedOn: string;
  productUrl: string;
  ifraUrl: string;
};

// Each rate is Category 9 ("Soap, Rinse-off Bath Products, Shampoo") in
// Bramble Berry's product-linked IFRA 51 statement. Documents and SKUs were
// checked against the corresponding product pages in September 2026.
// This is a limited, dated selection, not a live or exhaustive supplier feed.
export const BRAMBLE_BERRY_FRAGRANCES: readonly SupplierFragrance[] = [
  {
    sku: 'V000229',
    name: 'Black Amber And Lavender Fragrance Oil',
    ifraMaxPercent: 4.2,
    assessedOn: '2024-01-31',
    productUrl: 'https://www.brambleberry.com/shop-by-product/scents/fragrance-oils/black-amber-and-lavender-fragrance-oil/V000229.html',
    ifraUrl: 'https://www.brambleberry.com/on/demandware.static/-/Sites-brambleberry-master-catalog/default/dw73233cdb/specs/ifra_eu_prop65/ifra51_eu_prop65_V000229_BLACK_AMBER_AND_LAVENDER_FRAGRANCE_OIL.pdf',
  },
  {
    sku: 'V000324',
    name: 'Black Raspberry Vanilla Fragrance Oil',
    ifraMaxPercent: 22,
    assessedOn: '2024-01-31',
    productUrl: 'https://www.brambleberry.com/shop-by-product/scents/fragrance-oils/black-raspberry-vanilla-fragrance-oil/V000324.html',
    ifraUrl: 'https://www.brambleberry.com/on/demandware.static/-/Sites-brambleberry-master-catalog/default/dw8c419f9d/specs/ifra_eu_prop65/ifra51_eu_prop65_V000324_BLACK_RASPBERRY_VANILLA_FRAGRANCE_OIL.pdf',
  },
  {
    sku: 'V000238',
    name: 'Lavender Fragrance Oil',
    ifraMaxPercent: 5.4,
    assessedOn: '2024-01-31',
    productUrl: 'https://www.brambleberry.com/shop-by-product/scents/fragrance-oils/lavender-fragrance-oil/V000238.html',
    ifraUrl: 'https://www.brambleberry.com/on/demandware.static/-/Sites-brambleberry-master-catalog/default/dw503b9679/specs/ifra_eu_prop65/ifra51_eu_prop65_V000238_LAVENDER_FRAGRANCE_OIL.pdf',
  },
  {
    sku: 'V000266',
    name: 'Lavender and Cedar Fragrance Oil',
    ifraMaxPercent: 6.08,
    assessedOn: '2024-02-01',
    productUrl: 'https://www.brambleberry.com/shop-by-product/scents/fragrance-oils/lavender-and-cedar-fragrance-oil/V000266.html',
    ifraUrl: 'https://www.brambleberry.com/on/demandware.static/-/Sites-brambleberry-master-catalog/default/dwb1ac91a5/specs/ifra_eu_prop65/ifra51_eu_prop65_V000266_LAVENDER_AND_CEDAR_FRAGRANCE_OIL.pdf',
  },
  {
    sku: 'V000315',
    name: 'Lavender Bloom Fragrance Oil',
    ifraMaxPercent: 5.4,
    assessedOn: '2024-06-24',
    productUrl: 'https://www.brambleberry.com/shop-by-product/scents/fragrance-oils/lavender-bloom-fragrance-oil/V000315.html',
    ifraUrl: 'https://www.brambleberry.com/on/demandware.static/-/Sites-brambleberry-master-catalog/default/dw745814ef/specs/ifra_eu_prop65/ifra51_eu_prop65_V000315_LAVENDER_BLOOM_FRAGRANCE_OIL.pdf',
  },
  {
    sku: 'V000371',
    name: 'Oatmeal Milk and Honey Fragrance Oil',
    ifraMaxPercent: 5.78,
    assessedOn: '2024-06-24',
    productUrl: 'https://www.brambleberry.com/shop-by-product/scents/fragrance-oils/oatmeal-milk-and-honey-fragrance-oil/V000371.html',
    ifraUrl: 'https://www.brambleberry.com/on/demandware.static/-/Sites-brambleberry-master-catalog/default/dwd2660c92/specs/ifra_eu_prop65/ifra51_eu_prop65_V000371_OATMEAL_MILK_AND_HONEY_FRAGRANCE_OIL.pdf',
  },
];

export function selectedSupplierFragrance(row: FragranceRow): SupplierFragrance | undefined {
  return BRAMBLE_BERRY_FRAGRANCES.find((product) =>
    row.name === product.name &&
    row.ifraMaxPercent === product.ifraMaxPercent &&
    row.ifraSourceUrl === product.ifraUrl);
}

export function chooseSupplierFragrance(row: FragranceRow, sku: string): FragranceRow {
  if (sku === '') return { ...row, ifraMaxPercent: undefined, ifraSourceUrl: undefined };
  const product = BRAMBLE_BERRY_FRAGRANCES.find((item) => item.sku === sku);
  if (!product) throw new Error(`Unknown supplier fragrance SKU: ${sku}`);
  return {
    ...row,
    name: product.name,
    ifraMaxPercent: product.ifraMaxPercent,
    ifraSourceUrl: product.ifraUrl,
  };
}

export function renameFragrance(row: FragranceRow, name: string): FragranceRow {
  if (name !== row.name && selectedSupplierFragrance(row)) {
    return { ...row, name, ifraMaxPercent: undefined, ifraSourceUrl: undefined };
  }
  return { ...row, name };
}