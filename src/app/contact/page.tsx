"use client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { ProfessionalIcon } from "@/components/ProfessionalIcon";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Contact(){
  const {data}=usePortfolio();
  return <><SiteHeader/><main>
    <PageHero eyebrow="GET IN TOUCH" title="Let’s Connect" description="Open to professional conversations about quality engineering, enterprise delivery, automation, mentoring and leadership."/>
    <section className="shell contact-grid">
      <article className="bento-card large">
        <h2>Professional Contact</h2>
        <div className="contact-line"><ProfessionalIcon name="email" className="contact-icon"/><div><strong>Email</strong><br/><a href={`mailto:${data.profile.email}`}>{data.profile.email}</a></div></div>
        <div className="contact-line"><ProfessionalIcon name="location" className="contact-icon"/><div><strong>Location</strong><br/>{data.profile.location}</div></div>
        <div className="actions"><a className="button" href={data.profile.linkedin} target="_blank" rel="noreferrer"><ProfessionalIcon name="linkedin" className="button-icon"/>LinkedIn ↗</a><a className="button secondary" href={data.profile.github} target="_blank" rel="noreferrer"><ProfessionalIcon name="github" className="button-icon"/>GitHub ↗</a></div>
      </article>
      <article className="bento-card large"><h2>Send a message</h2><p className="muted">GitHub Pages has no server-side mail service in this first release. This form opens your email client with the message prepared.</p><ContactForm email={data.profile.email}/></article>
    </section>
  </main><SiteFooter/></>;
}

function ContactForm({email}:{email:string}){
  function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault(); const f=new FormData(e.currentTarget); const subject=encodeURIComponent(String(f.get('subject')||'Portfolio enquiry')); const body=encodeURIComponent(`Name: ${f.get('name')}\n\n${f.get('message')}`); window.location.href=`mailto:${email}?subject=${subject}&body=${body}`;}
  return <form className="form" onSubmit={submit}><input name="name" placeholder="Your name" required/><input name="subject" placeholder="Subject" required/><textarea name="message" placeholder="Your message" rows={7} required/><button className="button" type="submit">Prepare Email</button></form>
}
