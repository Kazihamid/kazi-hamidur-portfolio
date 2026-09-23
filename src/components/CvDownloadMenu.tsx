"use client";

import { ProfessionalIcon } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

export function CvDownloadMenu({
  compact = false,
  secondary = false,
  className = "",
}: {
  compact?: boolean;
  secondary?: boolean;
  className?: string;
}) {
  const { data } = usePortfolio();
  const wordPath = data.profile.cv;
  const pdfPath = /\.docx$/i.test(wordPath)
    ? wordPath.replace(/\.docx$/i, ".pdf")
    : "/documents/Kazi-Hamidur-Rahman-CV.pdf";

  const summaryClasses = [
    "button",
    compact ? "compact" : "",
    secondary ? "secondary" : "",
  ].filter(Boolean).join(" ");

  return (
    <details className={`cv-download-menu ${className}`.trim()}>
      <summary className={summaryClasses}>
        <ProfessionalIcon name="download" className="button-icon" />
        Download CV
        <span className="cv-chevron" aria-hidden="true">▾</span>
      </summary>
      <div className="cv-download-options" role="menu" aria-label="CV download formats">
        <a href={assetPath(pdfPath)} download role="menuitem">
          <span className="cv-format-badge">PDF</span>
          <span><strong>Download as PDF</strong><small>Best for sharing and printing</small></span>
        </a>
        <a href={assetPath(wordPath)} download role="menuitem">
          <span className="cv-format-badge word">DOCX</span>
          <span><strong>Download as MS Word</strong><small>Editable Microsoft Word file</small></span>
        </a>
      </div>
    </details>
  );
}
