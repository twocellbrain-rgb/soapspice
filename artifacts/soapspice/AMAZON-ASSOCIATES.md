# Amazon link readiness

SoapSpice is intended for Amazon affiliate marketing. It currently has no supplied
approved Associates links. The empty `src/data/amazon-affiliate-links.json` therefore
produces untracked searches, not commission-generating links or a claim of membership.

## Before activating affiliate links

1. Enroll in Amazon Associates, satisfy its account requirements, and list every
   public site/domain used for promotion in the Associates account.
2. Supply genuine Amazon-issued Special Links (for example from SiteStripe).
   Add only exact, suitable product matches to the map, keyed by ingredient ID,
   tool slug prefixed with `tool-`, or stable material ID such as `sodium-hydroxide`.
   Never invent a tag, infer fragrance identity from a similar name, or use someone
   else's tag. Amazon URLs/tags are public; API secrets are not.
3. Once links are configured, verify the exact Associate statement appears
   prominently and “paid link” is beside every affiliate button. Untracked searches
   must remain distinguished from paid links.
4. Review `/privacy` against the actual hosting, cookies, analytics, and data
   processing in use. Keep disclosures accurate as integrations change.
5. Verify print/PDF views exclude promotional links. JSON exports must not embed
   Special Links. The current shopping components use `print-hide`.

## Technical safeguards

- Amazon opens only after an explicit visitor click; validating a formula navigates
  to a SoapSpice results page, not Amazon. No automatic Amazon redirects or ad popups.
- No scraped product photos, reviews, star ratings, live prices, availability claims,
  Amazon logo, or assertion that Amazon endorses SoapSpice.
- Generic ingredient searches are not verified product recommendations. Customers
  must check the seller's specifications and suitability for soapmaking.
- Do not add API credentials to the frontend or Git. Future catalog API integration
  requires a server and compliance with Amazon's then-current licensing/cache rules.
- Do not offer incentives for clicks, purchases, or using these links.

## Sources reviewed November 2, 2026

- [Operating Agreement, especially section 5](https://affiliate-program.amazon.com/help/operating/agreement)
- [Program Policies, participation requirements and license](https://affiliate-program.amazon.com/help/operating/policies)
- [Amazon disclosure guidance](https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98)

These safeguards are not Amazon approval or a legal compliance certification.
Amazon's current agreement, account eligibility, approved sites, marketing practices,
and applicable laws remain the owner's responsibility.
