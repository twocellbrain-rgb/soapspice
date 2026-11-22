const starterSteps = [
  {
    title: 'Prepare your space and protect yourself',
    body: 'Read all steps before starting. Clear a stable worktop, arrange the mold and dedicated utensils, and keep children and pets away. Work with good ventilation. Put on chemical splash goggles, sodium-hydroxide-compatible gloves, long sleeves, an apron, and closed shoes. Keep protection on while handling the solution and fresh soap.',
  },
  {
    title: 'Weigh each ingredient separately',
    body: 'Use the ingredient table above in your selected unit. Tare each container on a reliable digital scale; 0.1 g resolution is useful for the NaOH amount. Measure olive oil, coconut oil (76°), shea butter, distilled water, and sodium hydroxide separately. Check oil grades and NaOH purity first. This starter batch is unscented: leave out fragrance, essential oils, colorants, and other extras.',
  },
  {
    title: 'Make the sodium hydroxide solution',
    body: 'Put the measured room-temperature or cooler distilled water in a heat-resistant, NaOH-compatible pitcher with room to stir. Slowly add the measured sodium hydroxide to the water while stirring gently until dissolved. Always add NaOH to water—never water to NaOH. The mixture gets very hot and releases irritating mist; keep your face away, avoid breathing it, and do not use aluminum or ordinary glass. Set the labeled pitcher in a secure, ventilated place to cool.',
  },
  {
    title: 'Melt the solid oils, then add olive oil',
    body: 'Gently melt the measured coconut oil and shea butter in a stainless-steel pot over low heat. Remove from the heat as soon as they are melted. Add the measured olive oil, scrape the container well, and stir to combine. Avoid overheating.',
  },
  {
    title: 'Check the temperatures',
    body: 'For this simple starter method, aim for both the oils and NaOH solution to be around 100°F (38°C) before combining. Check with a thermometer rather than by touch. The oils should remain fully liquid, with no solid butter or oil pieces. Allow more cooling time if needed; do not rush this step.',
  },
  {
    title: 'Combine and blend to light trace',
    body: 'Slowly pour the cooled NaOH solution into the oils. Keep the immersion-blender head fully submerged and release trapped air before switching it on. Alternate short pulses with gentle stirring until the mixture is evenly creamy, has no visible oil separation, and a drizzle leaves a faint trail on the surface. This is light trace. Keep the blender submerged to avoid splashes, and do not use a whisk-style electric mixer.',
  },
  {
    title: 'Pour into the mold',
    body: 'With goggles and gloves still on, carefully pour the batter into the prepared soap mold. Scrape in the remaining batter and gently settle the mold on the worktop. This unscented example needs no fragrance or additives. Set it in a secure place at room temperature; no oven processing or forced heating is needed for this beginner method.',
  },
  {
    title: 'Let it firm up, then unmold',
    body: 'Leave the soap undisturbed for about 48 hours. If it is still soft or sticky, give it more time rather than forcing it out. Wear gloves when unmolding and cutting a loaf into bars; fresh soap may still be caustic. Small cavity molds can be unmolded into individual bars. Keep the curing area away from children and pets.',
  },
  {
    title: 'Cure the bars for 4–6 weeks',
    body: 'Space the bars on a lined tray or suitable curing rack in a dry, airy place out of direct sunlight. Turn them occasionally for even drying and label them with the batch date. Give them at least four weeks, usually 4–6 weeks, before use; a firm bar is not necessarily fully cured. Curing improves hardness and longevity but does not correct a weighing mistake or excess NaOH. If a batch separates, has liquid pockets, or its measurements are uncertain, set it aside and get experienced guidance before using it.',
  },
  {
    title: 'Clean up safely and record your batch',
    body: 'Keep protection on when handling utensils or spills containing fresh soap or NaOH. Follow the NaOH product label for first aid, cleanup, and disposal; keep equipment dedicated to soapmaking. Record the ingredient grades, weights, temperatures, and date so you can compare future batches.',
  },
];

export default function FirstBatchMethod({ isExample }: { isExample: boolean }) {
  return (
    <section className="fb-method" aria-labelledby="fb-method-title" data-testid="first-batch-method">
      <header className="fb-method-head">
        <p className="fb-kicker">From measuring to curing</p>
        <h2 id="fb-method-title">{isExample ? 'Prepare your first unscented batch' : 'Prepare your custom batch with care'}</h2>
        <p>
          {isExample
            ? 'A practical cold-process walkthrough for the olive oil, coconut oil, shea butter, and distilled-water starter example above. Review your ingredients and the calculator’s liquid starting estimate against your chosen method before beginning.'
            : 'Your shopping table uses your saved formula. A custom oil blend, fragrance, milk, or other liquid can require different temperatures and handling. Use a reliable method suited to those exact ingredients rather than applying the starter steps unchanged.'}
        </p>
      </header>
      {isExample ? (
        <ol className="fb-method-steps">
          {starterSteps.map((step, index) => (
            <li key={step.title} data-testid={`first-batch-step-${index + 1}`}>
              <span className="fb-method-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{step.title}</h3><p>{step.body}</p></div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="fb-method-custom">
          <li>Confirm each ingredient grade, supplier SAP value, NaOH purity, and liquid method before weighing.</li>
          <li>Prepare ventilation, splash goggles, compatible gloves, and dedicated NaOH-safe equipment.</li>
          <li>Follow the mixing, temperature, molding, and curing directions in the method you selected for your formula.</li>
          <li>If fragrance is listed, check the exact supplier’s current IFRA limit for bar soap. A zero dose means leave it out until reviewed and recalculated.</li>
          <li>Record the batch and keep it out of use until the appropriate cure and checks are complete.</li>
        </ol>
      )}
      <p className="fb-method-source">
        Learn the technique: <a href="https://lovelygreens.com/natural-soapmaking-for-beginners-make/" target="_blank" rel="noopener noreferrer">Beginner cold-process soapmaking guide (opens in a new tab)</a>.
        {' '}This is a general method reference, not the source of the calculator’s formula.
      </p>
    </section>
  );
}
