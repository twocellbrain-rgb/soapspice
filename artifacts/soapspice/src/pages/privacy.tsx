export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-4xl">Privacy and shopping links</h1>
      <div className="mt-8 space-y-6 text-base leading-7 text-[hsl(var(--muted-foreground))]">
        <p>The public SoapSpice calculator runs in your browser. Saved formulas use this browser’s local storage; working drafts and results may use session storage. These formulas are not account-based and do not sync between devices. Clearing your browser’s site data removes these browser copies. Export important formulas before clearing storage.</p>
        <p>Formula names and ingredient amounts are not sent to Amazon through our shopping links. Shopping searches include only the material or tool name. Do not enter personal or sensitive information as a custom material name: the search text is sent to Amazon if you click its shopping link.</p>
        <p>Amazon links take you to a third-party website only when you click. Where an approved affiliate link is configured, it is marked “paid link,” and Amazon may attribute qualifying purchases to SoapSpice. Amazon and other third parties may collect information directly, place or recognize cookies on your browser, and process activity under their own policies. Untracked search links are identified separately and do not earn us commissions.</p>
        <p>Your hosting provider may process technical request information, such as IP addresses and access logs, to deliver and protect the website. Browser extensions and services you choose may also handle your activity under their own policies.</p>
        <p>Review <a className="underline" href="https://www.amazon.com/privacy" target="_blank" rel="noopener">Amazon’s Privacy Notice</a> before using its website. SoapSpice does not handle Amazon orders, payments, shipping, or returns; contact Amazon or the seller for those matters.</p>
      </div>
    </section>
  );
}
