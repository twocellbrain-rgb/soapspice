import { hasAmazonAffiliateLinks } from '@/lib/amazon-links';

export default function AmazonDisclosure() {
  return (
    <p className="print-hide mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]" data-testid="amazon-disclosure">
      {hasAmazonAffiliateLinks
        ? <><strong>As an Amazon Associate I earn from qualifying purchases.</strong> Affiliate links are marked “paid link.” Other Amazon search links are untracked.</>
        : <>Amazon links currently open untracked search results. These links do not earn SoapSpice a commission.</>}
      {' '}SoapSpice is independent and is not endorsed by Amazon. Check product suitability and current prices on Amazon before buying.
    </p>
  );
}
