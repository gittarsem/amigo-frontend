import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Compass, Heart, MapPin, MessageCircle, Plus, Search, Send, Sparkles, Users } from 'lucide-react';
import {
  useGetHomeFeed, useListEvents, useGetEvent, useListPeople, useGetPerson, useGetBuddies,
  useCreateConnection, useListClans, useCreateClan, useGetClan, useJoinClan, useListPlans,
  useCreatePlan, useJoinPlan, useRespondToConnection, useListConversations, useSendMessage, useGetConversation,
  useListNotifications, useUpdateNotification, useGetProfile, useUpdateProfile, useGetSettings,
  useUpdateSettings, useSearchAmigo, useSaveOnboarding, getGetBuddiesQueryKey,
  getGetClanQueryKey, getGetSettingsQueryKey,
  getListClansQueryKey, getListPlansQueryKey, getGetConversationQueryKey,
  getListConversationsQueryKey, getListNotificationsQueryKey, getSearchAmigoQueryKey,
} from '@workspace/api-client-react';
import type { SettingsUpdate } from '@workspace/api-client-react';
import { Avatar, Button, ClanCard, EmptyState, ErrorState, EventCard, LoadingRows, PageTitle, PersonCard, PlanRow, SectionHeading } from '../components/amigo-ui';

const interests = ['Live music', 'Coffee', 'Outdoors', 'Art', 'Food', 'Running', 'Books', 'Film'];
const categories = ['Everything', 'Movies', 'Music', 'Food', 'Sports', 'Art'];

export function LandingPage() {
  return <div className="landing-page">
    <nav className="landing-nav page-shell"><Link href="/" className="wordmark"><span className="brand-dot"/>amigo</Link><div className="landing-links"><Link href="/discover">Discover</Link><Link href="/clans">Communities</Link><Link href="/login">Log in</Link><Link href="/signup" className="button button-dark">Get started</Link></div></nav>
    <section className="landing-hero page-shell">
      <div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> REAL LIFE, WITH GOOD PEOPLE</div><h1 className="display">Your next<br/>good story<br/><em>starts here.</em></h1><p>Find the people who make your city feel a little smaller. Plans, events and new friends — all in one place.</p><div className="hero-actions"><Link href="/signup" className="button button-dark">Find your people <ArrowRight size={17}/></Link><Link href="/discover" className="quiet-link">See what's happening <ArrowUpRight size={16}/></Link></div><div className="hero-social"><div className="stacked-avatars"><span>J</span><span>M</span><span>A</span><span>K</span></div><span>Good plans are better together.</span></div></div>
      <div className="hero-art"><img src="/images/cinema-night.jpg" alt="Friends arriving together at a neighborhood cinema"/><div className="hero-note"><span className="note-icon"><Sparkles size={16}/></span><div><strong>Tonight, but make it a story</strong><small>Find a plan that feels like you</small></div><ArrowUpRight size={16}/></div><div className="hero-roundel">MORE<br/>TOGETHER</div></div>
    </section>
    <section className="landing-intro"><div className="page-shell intro-inner"><span className="eyebrow">A LITTLE LESS SCROLLING</span><h2 className="display">A lot more <span>actually doing.</span></h2><p>Not another feed to watch. A simple way to turn “we should” into “see you there.”</p></div></section>
    <section className="landing-steps page-shell"><div className="step-photo"><img src="/images/cafe-meetup.jpg" alt="Friends sharing coffee in a neighborhood cafe"/><span className="photo-caption">GOOD THINGS HAPPEN OFFLINE</span></div><div className="steps-copy"><span className="eyebrow">HOW AMIGO WORKS</span><h2 className="display">From “maybe”<br/>to <i>meet you there.</i></h2><div className="step-row"><b>01</b><div><strong>Find a thing</strong><span>Local events, low-key plans, new communities.</span></div></div><div className="step-row"><b>02</b><div><strong>Find your people</strong><span>Meet folks who get your kind of fun.</span></div></div><div className="step-row"><b>03</b><div><strong>Go together</strong><span>Make the plan real. The rest is the good part.</span></div></div></div></section>
    <section className="landing-cta"><div className="page-shell cta-inner"><span className="eyebrow">YOUR CITY IS OUT THERE</span><h2 className="display">Go make a<br/><em>good memory.</em></h2><Link href="/signup" className="button button-light">Get out there <ArrowRight size={17}/></Link></div><div className="cta-orbit orbit-one"/><div className="cta-orbit orbit-two"/></section>
    <footer className="landing-footer page-shell"><Link href="/" className="wordmark"><span className="brand-dot"/>amigo</Link><span>Make room for more together.</span><div><Link href="/discover">Discover</Link><Link href="/login">Log in</Link></div></footer>
  </div>;
}

export function HomePage() {
  const { data, isLoading, isError, refetch } = useGetHomeFeed();
  return <main className="page-shell content-page">
    <div className="home-intro"><div><span className="eyebrow">YOUR CITY, YOUR PEOPLE</span><h1 className="display">Good things are<br className="desktop-only"/> happening <em>near you.</em></h1><p>Little plans can make a big week.</p></div><Link href="/plans/create" className="button button-dark"><Plus size={17}/> Make a plan</Link></div>
    {isLoading ? <LoadingRows count={4}/> : isError ? <ErrorState retry={() => void refetch()}/> : data ? <>
      {data.featuredEvent && <section className="home-feature"><div className="feature-image"><img src={data.featuredEvent.imageUrl} alt=""/><span>THIS WEEK'S PICK</span></div><div className="feature-copy"><span className="eyebrow">{data.featuredEvent.category} · {new Date(data.featuredEvent.startsAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span><h2 className="display">{data.featuredEvent.title}</h2><p>{data.featuredEvent.description}</p><p className="subtle"><MapPin size={15}/>{data.featuredEvent.location} · {data.featuredEvent.attendeeCount} going</p><Link href={`/events/${data.featuredEvent.id}`} className="button button-dark">Meet your plus-ones <ArrowRight size={16}/></Link></div></section>}
      <section className="section-block"><SectionHeading title="Worth leaving home for" href="/discover"/><div className="event-grid">{data.events?.slice(0, 3).map((event) => <EventCard key={event.id} event={event}/>)}</div>{!data.events?.length && <EmptyState title="Nothing on the calendar yet" text="Try a wider search or check back soon." href="/discover"/>}</section>
      <section className="section-block"><SectionHeading title="People you might click with" href="/buddies/discover"/><div className="people-grid">{data.people?.slice(0, 3).map((person) => <PersonCard key={person.id} person={person}/>)}</div></section>
      <section className="section-block"><SectionHeading title="Find your kind of crowd" href="/clans"/><div className="clan-grid">{data.clans?.slice(0, 3).map((clan) => <ClanCard key={clan.id} clan={clan}/>)}</div></section>
    </> : null}
  </main>;
}

export function DiscoverPage() {
  const [category, setCategory] = useState('Everything');
  const params = useMemo(() => category === 'Everything' ? {} : { category }, [category]);
  const { data, isLoading, isError, refetch } = useListEvents(params);
  const people = useListPeople();
  return <main className="page-shell content-page"><PageTitle eyebrow="OUT IN THE WORLD" title="Find your next thing." description="A little live music. A long walk. Whatever gets you out there." action={<Link href="/search" className="icon-button" aria-label="Search"><Search/></Link>}/>
    <div className="filter-row">{categories.map((c) => <button className={`filter-chip ${category === c ? 'selected' : ''}`} key={c} onClick={() => setCategory(c)} data-testid={`filter-${c.toLowerCase()}`}>{c}</button>)}</div>
    {isLoading ? <LoadingRows/> : isError ? <ErrorState retry={() => void refetch()}/> : data?.length ? <div className="event-grid discovery-grid">{data.map((event) => <EventCard key={event.id} event={event} feature={event.isFeatured}/>)}</div> : <EmptyState title="No plans in this pocket yet" text="Try another category. Your next good story is out there."/>}
    <section className="section-block people-strip"><SectionHeading title="Go with someone new" href="/buddies/discover"/>{people.isLoading ? <LoadingRows/> : people.data?.length ? <div className="people-grid">{people.data.slice(0, 3).map((p) => <PersonCard key={p.id} person={p}/>)}</div> : null}</section>
  </main>;
}

export function EventPage() {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const query = useGetEvent(eventId);
  const connect = useCreateConnection();
  const qc = useQueryClient();
  const [invited, setInvited] = useState<string[]>([]);
  if (query.isLoading) return <main className="page-shell content-page"><LoadingRows/></main>;
  if (query.isError || !query.data) return <main className="page-shell content-page"><ErrorState retry={() => void query.refetch()}/></main>;
  const detail = query.data;
  const event = detail.event;
  const invite = (personId: string) => connect.mutate({ data: { personId, eventId, message: `Want to go to ${event.title || 'this event'} together?` } }, { onSuccess: () => { setInvited((current) => current.includes(personId) ? current : [...current, personId]); void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }); } });
  return <main className="page-shell content-page"><Link className="back-link" href="/discover">← Discover</Link><div className="event-detail-hero"><img src={event.imageUrl} alt=""/><div className="event-detail-copy"><span className="eyebrow">{event.category} · {new Date(event.startsAt).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span><h1 className="display">{event.title}</h1><p className="subtle"><MapPin size={16}/>{event.location}</p><p>{event.description}</p><div className="event-count">{event.attendeeCount} going <span>·</span> {event.lookingForCompany} open to meeting people</div><Link href="/plans/create" className="button button-dark">Make a plan around it <ArrowRight size={16}/></Link></div></div><section className="section-block"><SectionHeading title="People going who'd be fun to meet"/>{detail.interestedPeople?.length ? <div className="people-grid">{detail.interestedPeople.map((p) => <PersonCard key={p.id} person={p} action={<Button onClick={() => invite(p.id)} disabled={connect.isPending || invited.includes(p.id)}>{invited.includes(p.id) ? 'Invite sent' : connect.isPending ? 'Sending…' : 'Invite to go together'}</Button>}/>)}</div> : <EmptyState title="Be the first to find a plus-one" text="Connect with people who share your plans."/ >}</section></main>;
}

export function BuddiesPage() {
  const { data, isLoading, isError, refetch } = useGetBuddies();
  const plans = useListPlans();
  const joinPlan = useJoinPlan();
  const connection = useCreateConnection();
  const respondToConnection = useRespondToConnection();
  const qc = useQueryClient();
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [joinedPlanIds, setJoinedPlanIds] = useState<string[]>([]);
  const actionFor = (id: string, message = 'Want to connect and make a plan?') => <Button variant="light" onClick={() => connection.mutate({ data: { personId: id, message } }, { onSuccess: () => { setSentIds((current) => current.includes(id) ? current : [...current, id]); void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }); } })} disabled={connection.isPending || sentIds.includes(id)}>{sentIds.includes(id) ? 'Request sent' : connection.isPending ? 'Sending…' : 'Say hi'}</Button>;
  return <main className="page-shell content-page"><PageTitle eyebrow="YOUR PEOPLE" title="Better, together." description="Your people, plans, and the ones you have yet to meet." action={<Link href="/buddies/discover" className="button button-dark">Find people <ArrowRight size={16}/></Link>}/>{isLoading ? <LoadingRows/> : isError ? <ErrorState retry={() => void refetch()}/> : data && <>
    <section className="section-block"><SectionHeading title="Upcoming together" href="/plans" link="Make a plan"/>{data.upcomingPlans?.length ? data.upcomingPlans.map((plan) => <PlanRow key={plan.id} plan={plan}/>) : plans.data?.length ? plans.data.slice(0, 2).map((plan) => { const joined = plan.isJoined || joinedPlanIds.includes(plan.id); return <PlanRow key={plan.id} plan={plan} action={<Button variant="light" disabled={joinPlan.isPending || joined} onClick={() => joinPlan.mutate({ planId: plan.id }, { onSuccess: () => { setJoinedPlanIds((current) => current.includes(plan.id) ? current : [...current, plan.id]); void qc.invalidateQueries({ queryKey: getListPlansQueryKey() }); void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }); } })}>{joined ? 'Joined' : joinPlan.isPending ? 'Joining…' : 'Join'}</Button>}/>; }) : <EmptyState title="A plan is waiting to happen" text="Get something on the calendar with your people." href="/plans" cta="Create a plan"/>}</section>
    <section className="section-block"><SectionHeading title="Connection requests"/>{respondToConnection.isError && <p className="form-error" role="alert">Couldn't update that request. Please try again.</p>}{data.requests?.length ? <div className="people-grid">{data.requests.map((p) => <PersonCard key={p.id} person={p} action={<div className="request-actions"><Button onClick={() => respondToConnection.mutate({ personId: p.id, data: { action: 'accept' } }, { onSuccess: () => void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }) })} disabled={respondToConnection.isPending}>{respondToConnection.isPending ? 'Updating…' : 'Accept'}</Button><Button variant="light" onClick={() => respondToConnection.mutate({ personId: p.id, data: { action: 'ignore' } }, { onSuccess: () => void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }) })} disabled={respondToConnection.isPending}>Ignore</Button></div>}/>)}</div> : <div className="inline-empty">No new requests just yet.</div>}</section>
    <section className="section-block"><SectionHeading title="Your connections"/>{data.connections?.length ? <div className="people-grid">{data.connections.map((p) => <PersonCard key={p.id} person={p} action={<Link href="/messages" className="button button-light">Message</Link>}/>)}</div> : <EmptyState title="Room for a few more good people" text="Find folks who like what you like." href="/buddies/discover" cta="Discover people"/>}</section>
    <section className="section-block"><SectionHeading title="People to meet" href="/buddies/discover"/><div className="people-grid">{data.suggestions?.slice(0, 3).map((p) => <PersonCard key={p.id} person={p} action={actionFor(p.id)}/>)}</div></section>
  </>}</main>;
}

export function PeopleDiscoverPage() {
  const { data, isLoading, isError, refetch } = useListPeople();
  const mutation = useCreateConnection();
  const qc = useQueryClient();
  const [sentIds, setSentIds] = useState<string[]>([]);
  return <main className="page-shell content-page"><PageTitle eyebrow="PEOPLE NEAR YOU" title="Your kind of people." description="Meet someone new around the things you already love."/><div className="filter-row"><span className="filter-chip selected"><Compass size={14}/> Near you</span><Link href="/search" className="filter-chip"><Search size={14}/> Search interests</Link></div>{isLoading ? <LoadingRows/> : isError ? <ErrorState retry={() => void refetch()}/> : data?.length ? <div className="people-grid">{data.map((p) => <PersonCard key={p.id} person={p} action={<Button onClick={() => mutation.mutate({ data: { personId: p.id, message: 'Hey, we have a few things in common. Want to connect?' } }, { onSuccess: () => { setSentIds((current) => current.includes(p.id) ? current : [...current, p.id]); void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }); } })} disabled={mutation.isPending || sentIds.includes(p.id)}>{sentIds.includes(p.id) ? 'Request sent' : mutation.isPending ? 'Sending…' : 'Connect'}</Button>}/>)}</div> : <EmptyState title="Nobody new in your orbit" text="Try again later or explore a community." href="/clans" cta="Find a community"/>}</main>;
}

export function ProfilePage() {
  const query = useGetProfile();
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const save = () => update.mutate({ data: { name, location, bio, interests: selected } }, { onSuccess: () => { setEditing(false); void query.refetch(); } });
  if (query.isLoading) return <main className="page-shell content-page"><LoadingRows/></main>;
  if (query.isError || !query.data) return <main className="page-shell content-page"><ErrorState retry={() => void query.refetch()}/></main>;
  const profile = query.data;
  return <main className="page-shell content-page"><div className="profile-head"><Avatar person={profile} size="lg"/><div><span className="eyebrow">YOUR SOCIAL PROFILE</span><h1 className="display">{profile.name}</h1><p className="subtle"><MapPin size={15}/>{profile.location}</p></div><Button variant="light" onClick={() => { setName(profile.name); setLocation(profile.location); setBio(profile.bio); setSelected(profile.interests || []); setEditing(!editing); }}>{editing ? 'Cancel' : 'Edit profile'}</Button></div>{editing && <form className="form-panel" onSubmit={(e) => { e.preventDefault(); save(); }}><label>Name<input value={name} onChange={(e) => setName(e.target.value)} required/></label><label>Location<input value={location} onChange={(e) => setLocation(e.target.value)}/></label><label>A little about you<textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={240}/></label><div className="choice-wrap">{interests.map((i) => <button type="button" className={`filter-chip ${selected.includes(i) ? 'selected' : ''}`} key={i} onClick={() => setSelected(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i])}>{i}</button>)}</div><Button disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save profile'}</Button></form>}<p className="profile-bio">{profile.bio}</p><div className="tag-row">{profile.interests?.map((i) => <span className="tag" key={i}>{i}</span>)}</div><section className="section-block"><SectionHeading title="Your upcoming plans"/>{profile.upcomingPlans?.length ? profile.upcomingPlans.map((p) => <PlanRow plan={p} key={p.id}/>) : <EmptyState title="Make your first plan" text="Start something good this week." href="/plans/create"/>}</section><section className="section-block"><SectionHeading title="Communities you're part of" href="/clans"/>{profile.clans?.length ? <div className="clan-grid">{profile.clans.map((c) => <ClanCard clan={c} key={c.id}/>)}</div> : <EmptyState title="Find your crowd" text="Join a community built around your interests." href="/clans"/>}</section></main>;
}

export function PersonProfilePage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const query = useGetPerson(userId);
  const connect = useCreateConnection();
  const qc = useQueryClient();
  const [sent, setSent] = useState(false);
  if (query.isLoading) return <main className="page-shell content-page"><LoadingRows/></main>;
  if (query.isError || !query.data) return <main className="page-shell content-page"><ErrorState retry={() => void query.refetch()}/></main>;
  const { person, sharedInterests, sharedEvent, upcomingPlans, clans } = query.data;
  return <main className="page-shell content-page"><Link href="/buddies/discover" className="back-link">← People</Link><div className="profile-head profile-other"><Avatar person={person} size="lg"/><div><span className="eyebrow">{person.match}% YOU-GET-EACH-OTHER</span><h1 className="display">{person.name}</h1><p className="subtle"><MapPin size={15}/>{person.location} · {person.distance} away</p></div><div className="profile-cta"><Button onClick={() => connect.mutate({ data: { personId: person.id, message: 'Hey, looks like we have things in common. Want to connect?' } }, { onSuccess: () => { setSent(true); void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }); } })} disabled={connect.isPending || sent}>{sent ? 'Request sent' : connect.isPending ? 'Sending…' : 'Connect'}</Button><Link href="/messages" className="button button-light"><MessageCircle size={15}/> Message</Link></div></div><p className="profile-bio">{person.bio}</p>{sharedInterests?.length > 0 && <div className="shared-note"><Heart size={16}/> You both love {sharedInterests.join(', ')}{sharedEvent && ` · both interested in ${sharedEvent}`}</div>}<div className="tag-row">{person.interests?.map((i) => <span className="tag" key={i}>{i}</span>)}</div><section className="section-block"><SectionHeading title="Plans on their calendar"/>{upcomingPlans?.length ? upcomingPlans.map((p) => <PlanRow plan={p} key={p.id}/>) : <div className="inline-empty">No plans shared yet. Start one together.</div>}</section><section className="section-block"><SectionHeading title="Communities"/>{clans?.length ? <div className="clan-grid">{clans.map((c) => <ClanCard clan={c} key={c.id}/>)}</div> : <div className="inline-empty">No communities listed yet.</div>}</section></main>;
}

export function ClansPage() {
  const [category, setCategory] = useState('Everything');
  const params = useMemo(() => category === 'Everything' ? {} : { category }, [category]);
  const query = useListClans(params);
  return <main className="page-shell content-page"><PageTitle eyebrow="FIND YOUR CROWD" title="Good people, same wavelength." description="Communities for the things you love doing." action={<Link href="/clans/create" className="button button-dark"><Plus size={16}/> Start a community</Link>}/><div className="filter-row">{['Everything', 'Movies', 'Sports', 'Food', 'Art', 'Creative', 'Music', 'Outdoors'].map((c) => <button key={c} className={`filter-chip ${category === c ? 'selected' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}</div>{query.isLoading ? <LoadingRows/> : query.isError ? <ErrorState retry={() => void query.refetch()}/> : query.data?.length ? <div className="clan-grid">{query.data.map((c) => <ClanCard key={c.id} clan={c}/>)}</div> : <EmptyState title="Your community is still out there" text="Try another category, or start one of your own." href="/clans/create" cta="Create a community"/>}</main>;
}

export function ClanPage() {
  const { clanId = '' } = useParams<{ clanId: string }>();
  const query = useGetClan(clanId);
  const join = useJoinClan();
  const qc = useQueryClient();
  if (query.isLoading) return <main className="page-shell content-page"><LoadingRows/></main>;
  if (query.isError || !query.data) return <main className="page-shell content-page"><ErrorState retry={() => void query.refetch()}/></main>;
  const { clan, events, members } = query.data;
  return <main className="page-shell content-page"><div className="clan-detail-cover"><img src={clan.coverUrl} alt=""/><span className="eyebrow">{clan.category}</span></div><div className="clan-detail-heading"><div><h1 className="display">{clan.name}</h1><p>{clan.description}</p><span className="subtle"><Users size={15}/>{clan.membersCount} members · {clan.isPrivate ? 'Private' : 'Open community'}</span></div><Button onClick={() => join.mutate({ clanId }, { onSuccess: () => { void qc.invalidateQueries({ queryKey: getGetClanQueryKey(clanId) }); void qc.invalidateQueries({ queryKey: getListClansQueryKey() }); } })} disabled={join.isPending || clan.isJoined}>{clan.isJoined ? 'You’re in' : join.isPending ? 'Joining…' : 'Join community'}</Button></div><section className="section-block"><SectionHeading title="Things we're doing"/>{events?.length ? <div className="event-grid">{events.map((e) => <EventCard key={e.id} event={e}/>)}</div> : <EmptyState title="No plans on the board yet" text="Keep an eye out for the next community meetup."/>}</section><section className="section-block"><SectionHeading title="The people"/>{members?.length ? <div className="people-grid">{members.slice(0, 6).map((p) => <PersonCard key={p.id} person={p}/>)}</div> : <div className="inline-empty">Be one of the first to join.</div>}</section></main>;
}

export function CreateClanPage() {
  const create = useCreateClan();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [category, setCategory] = useState('Creative'); const [isPrivate, setPrivate] = useState(false);
   return <main className="page-shell content-page narrow-page"><Link href="/clans" className="back-link">← Communities</Link><PageTitle eyebrow="MAKE A PLACE FOR YOUR PEOPLE" title="Start a community." description="Bring people together around something you love."/><form className="form-panel" onSubmit={(e) => { e.preventDefault(); create.mutate({ data: { name, description, category, coverUrl: '/images/cafe-meetup.jpg', isPrivate } }, { onSuccess: (clan) => { void qc.invalidateQueries({ queryKey: getListClansQueryKey() }); setLocation(`/clans/${clan.id}`); } }); }}><label>Community name<input value={name} onChange={(e) => setName(e.target.value)} minLength={2} required placeholder="Sunday sketch club"/></label><label>What brings you together?<textarea value={description} onChange={(e) => setDescription(e.target.value)} minLength={8} required placeholder="A little about the vibe, the people, and what you do."/></label><label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{['Creative', 'Music', 'Outdoors', 'Food', 'Wellness', 'Books', 'Other'].map((c) => <option key={c}>{c}</option>)}</select></label><label className="check-label"><input type="checkbox" checked={isPrivate} onChange={(e) => setPrivate(e.target.checked)}/> Invite-only community</label>{create.isError && <p className="form-error">Couldn't create this community. Please try again.</p>}<Button disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create community'}</Button></form></main>;
}

export function PlansPage() {
  const plans = useListPlans();
  const join = useJoinPlan();
  const qc = useQueryClient();
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  return <main className="page-shell content-page narrow-page">
    <PageTitle eyebrow="MAKE IT HAPPEN" title="Plans start here." description="Put something on the calendar. Your people can join." action={<Link href="/plans/create" className="button button-dark"><Plus size={16}/> Create a plan</Link>}/>
    {plans.isLoading ? <LoadingRows/> : plans.isError ? <ErrorState retry={() => void plans.refetch()}/> : plans.data?.length ? plans.data.map((plan) => {
      const joined = plan.isJoined || joinedIds.includes(plan.id);
      return <PlanRow key={plan.id} plan={plan} action={<Button variant="light" disabled={join.isPending || joined} onClick={() => join.mutate({ planId: plan.id }, { onSuccess: () => {
        setJoinedIds((current) => current.includes(plan.id) ? current : [...current, plan.id]);
        void qc.invalidateQueries({ queryKey: getListPlansQueryKey() });
        void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() });
      } })}>{joined ? 'Joined' : join.isPending ? 'Joining…' : 'Join plan'}</Button>}/>;
    }) : <EmptyState title="No plans yet" text="Start with a walk, a gallery, or a spontaneous Tuesday." href="/plans/create" cta="Make the first plan"/>}
  </main>;
}

export function CreatePlanPage() {
  const create = useCreatePlan(); const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [startsAt, setStartsAt] = useState(''); const [location, setPlanLocation] = useState(''); const [maxPeople, setMaxPeople] = useState(6); const [selected, setSelected] = useState<string[]>([]);
  return <main className="page-shell content-page narrow-page"><Link href="/plans" className="back-link">← Plans</Link><PageTitle eyebrow="GET THE GROUP CHAT MOVING" title="Put it out there." description="A plan is better when there's room for one more."/><form className="form-panel" onSubmit={(e) => { e.preventDefault(); create.mutate({ data: { title, description, startsAt: new Date(startsAt).toISOString(), location, maxPeople: Number(maxPeople), interests: selected } }, { onSuccess: () => { void qc.invalidateQueries({ queryKey: getListPlansQueryKey() }); void qc.invalidateQueries({ queryKey: getGetBuddiesQueryKey() }); setLocation('/plans'); } }); }}><label>What's the plan?<input required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunset walk by the water"/></label><label>Details<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="The lowdown, the vibe, what to bring."/></label><div className="form-two"><label>When<input type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)}/></label><label>Where<input required minLength={2} value={location} onChange={(e) => setPlanLocation(e.target.value)} placeholder="Meet at…"/></label></div><label>How many people?<input type="number" min={2} max={50} value={maxPeople} onChange={(e) => setMaxPeople(Number(e.target.value))}/></label><div><span className="field-label">The interests behind it</span><div className="choice-wrap">{interests.map((i) => <button type="button" className={`filter-chip ${selected.includes(i) ? 'selected' : ''}`} key={i} onClick={() => setSelected(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i])}>{i}</button>)}</div></div>{create.isError && <p className="form-error">We couldn't save that plan. Try again.</p>}<Button disabled={create.isPending}>{create.isPending ? 'Posting…' : 'Post the plan'}</Button></form></main>;
}

export function MessagesPage() {
  const list = useListConversations(); const [active, setActive] = useState('');
  const selected = active || list.data?.[0]?.person.id || '';
  const conversation = useGetConversation(selected, { query: { enabled: !!selected, queryKey: getGetConversationQueryKey(selected) } });
  const send = useSendMessage(); const [body, setBody] = useState(''); const qc = useQueryClient();
  return <main className="page-shell content-page"><PageTitle eyebrow="A LITTLE BACK AND FORTH" title="Messages." description="Make the plan. Keep the good conversation going."/>{list.isLoading ? <LoadingRows/> : list.isError ? <ErrorState retry={() => void list.refetch()}/> : list.data?.length ? <div className="message-layout"><aside className="conversation-list">{list.data.map((item) => <button className={`conversation-item ${selected === item.person.id ? 'active' : ''}`} key={item.person.id} onClick={() => setActive(item.person.id)}><Avatar person={item.person}/><span><strong>{item.person.name}</strong><small>{item.lastMessage}</small></span>{item.unreadCount > 0 && <i>{item.unreadCount}</i>}</button>)}</aside><section className="chat-panel">{conversation.isLoading ? <LoadingRows/> : conversation.data && <><header><Avatar person={conversation.data.person}/><strong>{conversation.data.person.name}</strong><Link href={`/users/${conversation.data.person.id}`} className="text-link">View profile</Link></header><div className="chat-messages">{conversation.data.messages.map((m) => <div key={m.id} className={`chat-bubble ${m.isMine ? 'mine' : ''}`}><p>{m.body}</p><time>{new Date(m.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div>)}</div><form className="chat-compose" onSubmit={(e) => { e.preventDefault(); if (!body.trim()) return; send.mutate({ data: { personId: selected, body: body.trim() } }, { onSuccess: () => { setBody(''); void qc.invalidateQueries({ queryKey: getGetConversationQueryKey(selected) }); void qc.invalidateQueries({ queryKey: getListConversationsQueryKey() }); } }); }}><input aria-label="Message" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write something…"/><button aria-label="Send message" className="send-button" disabled={send.isPending || !body.trim()}><Send size={17}/></button></form></>}</section></div> : <EmptyState title="Your inbox is wide open" text="Meet someone new and make a plan together." href="/buddies/discover" cta="Find your people"/>}</main>;
}

export function NotificationsPage() {
  const query = useListNotifications(); const update = useUpdateNotification(); const qc = useQueryClient();
  return <main className="page-shell content-page narrow-page"><PageTitle eyebrow="WHAT'S NEW" title="Your updates." description="The little things that keep a plan moving."/>{query.isLoading ? <LoadingRows/> : query.isError ? <ErrorState retry={() => void query.refetch()}/> : query.data?.length ? <div className="notification-list">{query.data.map((n) => <article key={n.id} className={`notification-item ${n.isRead ? '' : 'unread'}`}><span className="notification-dot"/><div><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small><div className="notification-actions">{n.personId && <Link href={`/users/${n.personId}`} className="text-link">View person</Link>}{n.eventId && <Link href={`/events/${n.eventId}`} className="text-link">View event</Link>}{!n.isRead && <button className="text-link" onClick={() => update.mutate({ notificationId: n.id, data: { isRead: true } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) })}>Mark read</button>}</div></div></article>)}</div> : <EmptyState title="You're all caught up" text="When something happens, you'll find it here."/>}</main>;
}

export function SearchPage() {
  const [q, setQ] = useState('');
  const params = useMemo(() => ({ q: q.trim() }), [q]);
  const query = useSearchAmigo(params, { query: { enabled: q.trim().length > 0, queryKey: getSearchAmigoQueryKey(params) } });
  return <main className="page-shell content-page"><PageTitle eyebrow="SEARCH AMIGO" title="Follow a little curiosity." description="Find people, events, or communities."/><label className="search-box"><Search size={20}/><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “live music”, “hiking”, or a name" aria-label="Search Amigo"/></label>{!q.trim() ? <div className="search-hint"><span>Try something you love.</span><div className="tag-row">{['Live music', 'Hiking', 'Coffee', 'Drawing'].map((term) => <button className="tag" key={term} onClick={() => setQ(term)}>{term}</button>)}</div></div> : query.isLoading ? <LoadingRows/> : query.isError ? <ErrorState retry={() => void query.refetch()}/> : query.data && <>{query.data.events?.length > 0 && <section className="section-block"><SectionHeading title="Events"/><div className="event-grid">{query.data.events.map((e) => <EventCard key={e.id} event={e}/>)}</div></section>}{query.data.people?.length > 0 && <section className="section-block"><SectionHeading title="People"/><div className="people-grid">{query.data.people.map((p) => <PersonCard key={p.id} person={p}/>)}</div></section>}{query.data.clans?.length > 0 && <section className="section-block"><SectionHeading title="Communities"/><div className="clan-grid">{query.data.clans.map((c) => <ClanCard key={c.id} clan={c}/>)}</div></section>}{!query.data.events?.length && !query.data.people?.length && !query.data.clans?.length && <EmptyState title="No matches this time" text="Try a broader search or a different word."/>}</>}</main>;
}

export function SettingsPage() {
  const query = useGetSettings(); const update = useUpdateSettings(); const qc = useQueryClient();
  if (query.isLoading) return <main className="page-shell content-page"><LoadingRows/></main>;
  if (query.isError || !query.data) return <main className="page-shell content-page"><ErrorState retry={() => void query.refetch()}/></main>;
  const settings = query.data;
  const set = (value: SettingsUpdate) => update.mutate({ data: value }, { onSuccess: () => qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }) });
  return <main className="page-shell content-page narrow-page"><PageTitle eyebrow="MAKE AMIGO YOURS" title="Settings." description="You're in control of how you show up."/><div className="settings-list"><label className="setting-row"><span><strong>Discovery radius</strong><small>How far away should we look?</small></span><select value={settings.discoveryRadius} onChange={(e) => set({ discoveryRadius: Number(e.target.value) })}>{[5, 10, 20, 30, 50, 100].map((n) => <option key={n} value={n}>{n} km</option>)}</select></label><label className="setting-row"><span><strong>Profile visibility</strong><small>Who can find your profile?</small></span><select value={settings.profileVisibility} onChange={(e) => set({ profileVisibility: e.target.value as SettingsUpdate['profileVisibility'] })}><option value="everyone">Everyone</option><option value="buddies">Connections</option><option value="hidden">Hidden</option></select></label><Toggle title="Show my distance" description="Let people nearby know how far away you are." checked={settings.showDistance} onChange={(v) => set({ showDistance: v })}/><Toggle title="Event updates" description="Hear when something's happening around you." checked={settings.eventNotifications} onChange={(v) => set({ eventNotifications: v })}/><Toggle title="Message notifications" description="Know when someone gets back to you." checked={settings.messageNotifications} onChange={(v) => set({ messageNotifications: v })}/></div>{update.isPending && <span className="save-note">Saving your preferences…</span>}</main>;
}

function Toggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="setting-row"><span><strong>{title}</strong><small>{description}</small></span><input className="toggle-input" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}/></label>;
}

export function OnboardingPage() {
  const save = useSaveOnboarding(); const [, setLocation] = useLocation();
  const [goals, setGoals] = useState<string[]>([]); const [chosen, setChosen] = useState<string[]>([]); const [planTypes, setPlanTypes] = useState<string[]>([]);
  const flip = (items: string[], setter: (v: string[]) => void, item: string) => setter(items.includes(item) ? items.filter((x) => x !== item) : [...items, item]);
  const choices = (title: string, items: string[], selected: string[], setter: (v: string[]) => void) => <section className="onboard-step"><h2 className="display">{title}</h2><div className="choice-wrap">{items.map((item) => <button type="button" key={item} className={`filter-chip ${selected.includes(item) ? 'selected' : ''}`} onClick={() => flip(selected, setter, item)}>{item}</button>)}</div></section>;
  return <main className="page-shell content-page narrow-page onboarding"><span className="eyebrow">A GOOD PLACE TO START</span><h1 className="display">Let's find your<br/><em>kind of fun.</em></h1><p>Pick what feels right. You can always change it later.</p>{choices('What brings you here?', ['Meet new friends', 'Find things to do', 'Get out more', 'Find my community'], goals, setGoals)}{choices('Things you’re into', interests, chosen, setChosen)}{choices('Your ideal plans', ['Coffee & a chat', 'Live events', 'Move outdoors', 'Creative sessions', 'Food adventures', 'Something spontaneous'], planTypes, setPlanTypes)}<Button disabled={save.isPending} onClick={() => save.mutate({ data: { goals, interests: chosen, planTypes } }, { onSuccess: () => setLocation('/home') })}>{save.isPending ? 'Saving…' : 'Let’s go'} <ArrowRight size={16}/></Button>{save.isError && <p className="form-error">We couldn't save your choices. Try once more.</p>}</main>;
}

export function LoginEntry() { return <AuthEntry title="Good to see you." text="Sign in to pick up where the good stuff starts." to="/sign-in" linkText="Continue to sign in" alternative="New to Amigo?" altTo="/signup" altText="Create an account"/>; }
export function SignupEntry() { return <AuthEntry title="Make room for more." text="A few details, then out into the world." to="/sign-up" linkText="Create your account" alternative="Already have an account?" altTo="/login" altText="Sign in"/>; }
function AuthEntry({ title, text, to, linkText, alternative, altTo, altText }: { title: string; text: string; to: string; linkText: string; alternative: string; altTo: string; altText: string }) { return <main className="auth-entry"><Link href="/" className="wordmark"><span className="brand-dot"/>amigo</Link><div><span className="eyebrow">YOUR PEOPLE ARE OUT THERE</span><h1 className="display">{title}</h1><p>{text}</p><Link href={to} className="button button-dark">{linkText}<ArrowRight size={16}/></Link><span className="auth-alt">{alternative} <Link href={altTo}>{altText}</Link></span></div><small>Friendship, not swipes. Always.</small></main>; }

export function NotFoundPage() { return <main className="page-shell content-page"><PageTitle eyebrow="NO PLANS HERE" title="This page wandered off." description="Let's get you back to the good stuff." action={<Link className="button button-dark" href="/home">Back home</Link>}/></main>; }
