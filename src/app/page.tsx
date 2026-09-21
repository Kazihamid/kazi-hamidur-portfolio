"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfessionalIcon, type IconName } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

function highlightIcon(title: string): IconName {
  const key = title.toLowerCase();
  if (key.includes("leadership")) return "leadership";
  if (key.includes("enterprise")) return "enterprise";
  if (key.includes("automation")) return "automation";
  return "experience";
}

function projectIcon(category: string, title: string): IconName {
  const text = `${category} ${title}`.toLowerCase();
  if (text.includes("automation")) return "automation";
  if (text.includes("performance")) return "performance";
  if (text.includes("api")) return "api";
  if (text.includes("enterprise") || text.includes("hrms") || text.includes("recruit")) return "enterprise";
  return "project";
}


function ProjectDescription({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  return (
    <div className="project-description" aria-label="Project description">
      {lines.map((line, index) => (
        <span className="project-description-line" key={`${index}-${line.slice(0, 20)}`}>
          {line || "\u00A0"}
        </span>
      ))}
    </div>
  );
}

function projectAddedAt(id: string) {
  const match = /^project-(\d+)$/.exec(id);
  return match ? Number(match[1]) : null;
}

export default function Home() {
  const { data } = usePortfolio();

  // Projects created from Setup use project-<timestamp> IDs. Keep the most
  // recently added projects first, while preserving repository order for
  // legacy projects that do not have a timestamp-based ID.
  const featured = data.projects
    .map((project, index) => ({ project, index, addedAt: projectAddedAt(project.id) }))
    .filter(({ project }) => project.featured)
    .sort((a, b) => {
      if (a.addedAt !== null && b.addedAt !== null) return b.addedAt - a.addedAt;
      if (a.addedAt !== null) return -1;
      if (b.addedAt !== null) return 1;
      return a.index - b.index;
    })
    .slice(0, 3)
    .map(({ project }) => project);

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
                  <ProfessionalIcon name="career" className="button-icon" />
                  View My Journey
                </Link>
                <a className="button secondary" href={assetPath(data.profile.cv)} download>
                  <ProfessionalIcon name="download" className="button-icon" />
                  Download CV
                </a>
              </div>

              <div className="social-row">
                <a href={data.profile.github} target="_blank" rel="noreferrer"><ProfessionalIcon name="github" className="social-icon" />GitHub ↗</a>
                <a href={data.profile.linkedin} target="_blank" rel="noreferrer"><ProfessionalIcon name="linkedin" className="social-icon" />LinkedIn ↗</a>
                <a href={`mailto:${data.profile.email}`}><ProfessionalIcon name="email" className="social-icon" />Email</a>
              </div>
            </div>

            <div className="portrait-wrap">
              <img src={assetPath(data.profile.image)} alt={data.profile.name} />
            </div>
          </div>
        </section>

        <section className="shell highlights">
          {data.highlights.map((h) => (
            <article className="metric-card icon-card" key={h.title}>
              <div className="metric-card-top">
                <strong>{h.label}</strong>
                <ProfessionalIcon name={highlightIcon(h.title)} className="icon-badge" />
              </div>
              <h3>{h.title}</h3>
              <p>{h.detail}</p>
            </article>
          ))}
        </section>

        <section className="shell bento-section home-selected-work">
          <div className="section-heading">
            <div>
              <h3 className="eyebrow">SELECTED WORK</h3>
              <h2>Evidence of quality engineering in practice</h2>
            </div>
            <Link href="/projects">View all projects →</Link>
          </div>

          <div className="project-grid">
            {featured.map((p) => (
              <article className="bento-card project-card icon-card" key={p.id}>
                <div className="card-icon-row">
                  <ProfessionalIcon name={projectIcon(p.category, p.title)} className="icon-badge" />
                  <span className="pill">{p.category}</span>
                </div>
                <h3>{p.title}</h3>
                <ProjectDescription text={p.description} />
                <div className="tags">
                  {p.tools.map((t) => <span key={t}>{t}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="shell split-section">
          <article className="bento-card large icon-card">
            <ProfessionalIcon name="leadership" className="icon-badge" />
            <h3 className="eyebrow">LEADERSHIP</h3>
            <h2>Building quality capability, not only test coverage.</h2>
            <p>{data.leadership.subtitle}</p>
            <Link className="text-link" href="/leadership">Explore leadership philosophy →</Link>
          </article>

          <article className="bento-card large icon-card">
            <ProfessionalIcon name="skills" className="icon-badge icon-violet" />
            <h3 className="eyebrow">EXPERTISE</h3>
            <h2>Strategy, automation, API and performance.</h2>
            <div className="tags roomy">
              {data.skills.flatMap((s) => s.items).slice(0, 12).map((t) => <span key={t}>{t}</span>)}
            </div>
            <Link className="text-link" href="/about">Explore capabilities →</Link>
          </article>
        </section>

        <section className="shell cta">
          <div className="cta-copy">
            <ProfessionalIcon name="email" className="icon-badge icon-teal" />
            <div>
              <h3 className="eyebrow">LET&apos;S CONNECT</h3>
              <h2>Engineering quality for confident delivery.</h2>
              <p>Open to professional conversations about QA leadership, software quality, automation and enterprise delivery.</p>
            </div>
          </div>
          <Link className="button" href="/contact"><ProfessionalIcon name="send" className="button-icon" />Get in Touch</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
