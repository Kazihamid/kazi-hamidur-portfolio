export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="page-hero shell">
      <h3 className="eyebrow">{eyebrow}</h3>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
