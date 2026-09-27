// The browser must submit the revision it actually displayed, not the revision
// freshly loaded by the approval handler.
export function approvalRevisionMatches(displayed: number, current: number): boolean {
  return Number.isInteger(displayed) && displayed >= 0 && displayed === current;
}