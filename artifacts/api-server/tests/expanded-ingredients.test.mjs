import assert from "node:assert/strict";
import test from "node:test";
import { expandedIngredients } from "../src/lib/expanded-ingredients.ts";

const byId = new Map(expandedIngredients.map((ingredient) => [ingredient.id, ingredient]));

test("new reference ingredients have unique IDs and traceable, pending-review SAP values", () => {
  assert.equal(byId.size, expandedIngredients.length);
  for (const ingredient of expandedIngredients) {
    assert.ok(ingredient.naohSap > 0 && ingredient.naohSap < 1, ingredient.id);
    assert.ok(ingredient.kohSap > ingredient.naohSap, ingredient.id);
    assert.ok(ingredient.sapSourceUrl.startsWith("https://"), ingredient.id);
    assert.equal(ingredient.verificationStatus, "source-linked-needs-review");
  }
});

test("distinct coconut and palm varieties retain their published values", () => {
  assert.deepEqual(
    [byId.get("fractionated-coconut-oil")?.naohSap, byId.get("fractionated-coconut-oil")?.kohSap],
    [0.232, 0.325],
  );
  assert.deepEqual(
    [byId.get("palm-oil")?.naohSap, byId.get("palm-kernel-oil")?.naohSap],
    [0.142, 0.176],
  );
  assert.equal(byId.get("olive-oil-pomace")?.naohSap, 0.134);
});

test("apple seed oil cites its own source and unsupported composites stay out", () => {
  const apple = byId.get("apple-seed-oil");
  assert.deepEqual([apple?.naohSap, apple?.kohSap], [0.138, 0.193]);
  assert.equal(apple?.sapSourceUrl, "https://www.fromnaturewithlove.com/resources/sapon.asp");
  for (const id of ["aloe-butter", "avocado-butter", "amla-oil", "coffee-seed-oil", "squalane-oil"]) {
    assert.equal(byId.has(id), false, id);
  }
});