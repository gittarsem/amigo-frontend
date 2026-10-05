import { Link } from 'wouter';
import { ArrowUpRight, MapPin, Users } from 'lucide-react';
import type { Event, Person, Clan, Plan } from '@workspace/api-client-react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

export function Avatar({ person, size = 'md' }: { person: Partial<Person> & { name?: string }; size?: 'sm' | 'md' | 'lg' }) {
  return person.avatarUrl ? <img className={`avatar avatar-${size}`} src={person.avatarUrl} alt={person.name || 'Member'} /> : <span className={`avatar avatar-${size} avatar-fallback`} aria-label={person.name || 'Member'}>{(person.name || 'A').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>;
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="page-title fade-up"><div><div className="eyebrow">{eyebrow}</div><h1 className="display">{title}</h1>{description && <p>{description}</p>}</div>{action}</header>;
}

export function SectionHeading({ title, href, link = 'See all' }: { title: string; href?: string; link?: string }) {
  return <div className="section-heading"><h2 className="display">{title}</h2>{href && <Link href={href} className="text-link" data-testid={`link-${title.toLowerCase().replaceAll(' ', '-')}`}>{link}<ArrowUpRight size={15}/></Link>}</div>;
}

export function EventCard({ event, feature = false }: { event: Event; feature?: boolean }) {
  return <Link href={`/events/${event.id}`} className={`event-card ${feature ? 'event-feature' : ''}`} data-testid={`card-event-${event.id}`}>
    <div className="event-image-wrap"><img src={event.imageUrl} alt="" className="event-image"/>{event.lookingForCompany > 0 && <span className="image-badge">{event.lookingForCompany} looking for company</span>}</div>
    <div className="event-meta"><span>{event.category}</span><span>{new Date(event.startsAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
    <h3>{event.title}</h3><p className="subtle"><MapPin size={14}/>{event.location}</p>
    <span className="subtle">{event.attendeeCount} going</span>
  </Link>;
}

export function PersonCard({ person, action }: { person: Person; action?: React.ReactNode }) {
  return <article className="person-card" data-testid={`card-person-${person.id}`}>
    <Link href={`/users/${person.id}`} className="person-link"><Avatar person={person}/><div className="person-copy"><strong>{person.name}</strong><span>{person.location} · {person.distance}</span></div><span className="match-pill">{person.match}% match</span></Link>
    <p className="person-bio">{person.bio}</p><div className="tag-row">{person.interests?.slice(0, 3).map((interest) => <span className="tag" key={interest}>{interest}</span>)}</div>
    {action && <div className="person-actions">{action}</div>}
  </article>;
}

export function ClanCard({ clan }: { clan: Clan }) {
  return <Link href={`/clans/${clan.id}`} className="clan-card" data-testid={`card-clan-${clan.id}`}><img src={clan.coverUrl} alt="" /><div className="clan-copy"><span className="eyebrow">{clan.category}</span><h3>{clan.name}</h3><p>{clan.description}</p><span className="subtle"><Users size={14}/>{clan.membersCount} members</span></div></Link>;
}

export function PlanRow({ plan, action }: { plan: Plan; action?: React.ReactNode }) {
  return <div className="plan-row"><div className="plan-date"><strong>{new Date(plan.startsAt).toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>{new Date(plan.startsAt).toLocaleDateString(undefined, { month: 'short' })}</span></div><div className="plan-info"><strong>{plan.title}</strong><span>{plan.location} · {plan.peopleCount}/{plan.maxPeople} going</span></div>{action}</div>;
}

export function LoadingRows({ count = 3 }: { count?: number }) {
  return <div className="skeleton-list" aria-label="Loading"><span/><span/><span/></div>;
}

export function EmptyState({ title, text, href, cta }: { title: string; text: string; href?: string; cta?: string }) {
  return <div className="empty-state"><div className="empty-mark">a.</div><h3>{title}</h3><p>{text}</p>{href && <Link className="button button-dark" href={href}>{cta || 'Explore'}</Link>}</div>;
}

export function ErrorState({ retry }: { retry: () => void }) {
  return <div className="error-state"><strong>That didn't load.</strong><span>Give it another try in a moment.</span><button className="button button-light" onClick={retry} data-testid="button-retry">Try again</button></div>;
}

export function Button({ children, variant = 'dark', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'dark' | 'light' | 'coral' }) {
  return <button className={`button button-${variant}`} {...props}>{children}</button>;
}
