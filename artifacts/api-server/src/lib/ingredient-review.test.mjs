import { test } from "node:test";
import assert from "node:assert/strict";
import { approvalRevisionMatches } from "./ingredient-review.ts";

test("approval accepts only the revision the reviewer inspected", () => {
  assert.equal(approvalRevisionMatches(4, 4), true);
  // An editor saved a new SAP after the reviewer opened revision 4.
  assert.equal(approvalRevisionMatches(4, 5), false);
  assert.equal(approvalRevisionMatches(5, 4), false);
  assert.equal(approvalRevisionMatches(-1, 0), false);
});