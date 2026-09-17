"use client";
import { usePortfolio } from "@/context/PortfolioContext";
import { assetPath } from "@/lib/paths";

export default function ProfileEditor() {
  const { data, update } = usePortfolio();
  const p = data.profile;
  const set = (k: keyof typeof p, v: string) => update((d) => { (d.profile as Record<string, string>)[k as string] = v; });

  return <>
    <div className="setup-header"><div><span className="eyebrow">CONTENT</span><h1>Edit Profile</h1><p>Changes save automatically to your local draft.</p></div></div>
    <section className="editor-grid">
      <div className="admin-card form">
        <label>Full Name<input value={p.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label>Professional Title<input value={p.title} onChange={(e) => set("title", e.target.value)} /></label>
        <label>Location<input value={p.location} onChange={(e) => set("location", e.target.value)} /></label>
        <label>Email<input value={p.email} onChange={(e) => set("email", e.target.value)} /></label>
        <label>Profile Image URL<input value={p.image} onChange={(e) => set("image", e.target.value)} /></label>
        <label>Professional Summary<textarea rows={6} value={p.summary} onChange={(e) => set("summary", e.target.value)} /></label>
      </div>
      <div className="admin-card live-card"><span className="eyebrow">LIVE PREVIEW</span><img className="admin-avatar" src={assetPath(p.image)} alt={p.name} /><h2>{p.name}</h2><p>{p.title}</p><p>{p.summary}</p></div>
    </section>
  </>;
}
