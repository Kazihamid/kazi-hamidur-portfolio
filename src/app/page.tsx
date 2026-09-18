"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

export default function Home() {
  const { data } = usePortfolio();
  const featured = data.projects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div>
              <h3 className="eyebrow">{data.profile.eyebrow}</h3>
              <h1>{data.profile.heroTitle}</h1>
              <p className="hero-copy">{data.profile.heroDescription}</p>

              <div className="actions">
                <Link className="button" href="/experience">
                  View My Journey
                </Link>
                <a
                  className="button secondary"
                  href={assetPath(data.profile.cv)}
                  download
                >
                  Download CV
                </a>
              </div>

              <div className="social-row">
                <a href={data.profile.github} target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a href={data.profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
                <a href={`mailto:${data.profile.email}`}>Email</a>
              </div>
            </div>

            <div className="portrait-wrap">
              <img
                src={assetPath(data.profile.image)}
                alt={data.profile.name}
              />
            </div>
          </div>
        </section>

        <section className="shell highlights">
          {data.highlights.map((h) => (
            <article className="metric-card" key={h.title}>
              <strong>{h.label}</strong>
              <h3>{h.title}</h3>
              <p>{h.detail}</p>
            </article>
          ))}
        </section>

        <section className="shell bento-section">
          <div className="section-heading">
            <div>
              <h3 className="eyebrow">SELECTED WORK</h3>
              <h2>Evidence of quality engineering in practice</h2>
            </div>
            <Link href="/projects">View all projects →</Link>
          </div>

          <div className="project-grid">
            {featured.map((p) => (
              <article className="bento-card" key={p.id}>
                <span className="pill">{p.category}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="tags">
                  {p.tools.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="shell split-section">
          <article className="bento-card large">
            <h3 className="eyebrow">LEADERSHIP</h3>
            <h2>Building quality capability, not only test coverage.</h2>
            <p>{data.leadership.subtitle}</p>
            <Link className="text-link" href="/leadership">
              Explore leadership philosophy →
            </Link>
          </article>

          <article className="bento-card large">
            <h3 className="eyebrow">EXPERTISE</h3>
            <h2>Strategy, automation, API and performance.</h2>
            <div className="tags roomy">
              {data.skills
                .flatMap((s) => s.items)
                .slice(0, 12)
                .map((t) => (
                  <span key={t}>{t}</span>
                ))}
            </div>
            <Link className="text-link" href="/about">
              Explore capabilities →
            </Link>
          </article>
        </section>

        <section className="shell cta">
          <div>
            <h3 className="eyebrow">LET&apos;S CONNECT</h3>
            <h2>Engineering quality for confident delivery.</h2>
            <p>
              Open to professional conversations about QA leadership, software
              quality, automation and enterprise delivery.
            </p>
          </div>
          <Link className="button" href="/contact">
            Get in Touch
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
