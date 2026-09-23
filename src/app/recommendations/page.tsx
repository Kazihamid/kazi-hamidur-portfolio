"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { ProfessionalIcon } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

function displayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function RecommendationsPage() {
  const { data } = usePortfolio();
  const recommendations = [...data.recommendations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return <>
    <SiteHeader />
    <main>
      <PageHero
        eyebrow="PROFESSIONAL RECOMMENDATIONS"
        title="Recommendations from colleagues"
        description="Professional feedback received from colleagues and managers across my career."
      />
      <section className="shell recommendations-page-section">
        <div className="recommendations-toolbar">
          <span>{recommendations.length} received recommendation{recommendations.length === 1 ? "" : "s"}</span>
          <a className="text-link" href={data.profile.linkedin} target="_blank" rel="noreferrer">View LinkedIn profile ↗</a>
        </div>
        <div className="recommendations-list">
          {recommendations.map((item) => {
            const initials = item.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
            return <article className="recommendation-card recommendation-card-full" key={item.id}>
              <div className="recommendation-person">
                <div className="recommendation-avatar" aria-hidden="true">{item.image ? <img src={assetPath(item.image)} alt="" /> : initials}</div>
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.headline}</p>
                  <small>{displayDate(item.date)} · {item.relationship}</small>
                </div>
                <ProfessionalIcon name="quote" className="recommendation-quote-icon" />
              </div>
              <p className="recommendation-text">{item.text}</p>
              {item.source && <span className="recommendation-source">Source: {item.source}</span>}
            </article>;
          })}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
