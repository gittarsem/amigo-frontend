import { useEffect, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Route, Switch, useLocation, Router as WouterRouter, Redirect, Link } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  LandingPage, HomePage, DiscoverPage, EventPage, BuddiesPage, PeopleDiscoverPage, ProfilePage,
  PersonProfilePage, ClansPage, ClanPage, CreateClanPage, PlansPage, CreatePlanPage, MessagesPage,
  NotificationsPage, SearchPage, SettingsPage, OnboardingPage, LoginEntry, SignupEntry, NotFoundPage,
} from './pages/pages';
import { Home, Compass, Users, UsersRound, MessageCircle, Search, Bell } from 'lucide-react';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
function stripBase(path: string) { return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path; }
if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: { logoPlacement: 'inside' as const, logoLinkUrl: basePath || '/', logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: {
    colorPrimary: '#FF5C35', colorForeground: '#171717', colorMutedForeground: '#6B6B6B',
    colorDanger: '#C83D32', colorBackground: '#F7F5F0', colorInput: '#FBFAF7',
    colorInputForeground: '#171717', colorNeutral: '#DEDAD1', fontFamily: 'DM Sans, sans-serif', borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#FBFAF7] rounded-3xl w-[440px] max-w-full overflow-hidden shadow-sm border border-[#e8e4dc]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#171717] font-semibold tracking-tight',
    headerSubtitle: 'text-[#6B6B6B]',
    socialButtonsBlockButtonText: 'text-[#171717] font-medium',
    formFieldLabel: 'text-[#292929] font-medium',
    footerActionLink: 'text-[#D84729] font-semibold',
    footerActionText: 'text-[#6B6B6B]',
    dividerText: 'text-[#77736D]',
    identityPreviewEditButton: 'text-[#D84729]',
    formFieldSuccessText: 'text-[#39745F]',
    alertText: 'text-[#7D2924]',
    logoBox: 'rounded-2xl',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'rounded-xl border-[#DEDAD1] bg-[#F7F5F0] hover:bg-[#F0EDE6]',
    formButtonPrimary: 'rounded-xl bg-[#FF5C35] hover:bg-[#E9512D] text-white',
    formFieldInput: 'rounded-xl border-[#DEDAD1] bg-[#FBFAF7] text-[#171717]',
    footerAction: 'text-[#6B6B6B]',
    dividerLine: 'bg-[#DEDAD1]',
    alert: 'rounded-xl',
    otpCodeFieldInput: 'rounded-lg border-[#DEDAD1] bg-[#FBFAF7] text-[#171717]',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }: { user?: { id?: string } | null }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) client.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}

function SignInPage() {
  return <div className="clerk-screen"><LinkHome/><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}/></div>;
}
function SignUpPage() {
  return <div className="clerk-screen"><LinkHome/><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`}/></div>;
}
function LinkHome() { return <Link className="wordmark clerk-mark" href="/"><span className="brand-dot"/>amigo</Link>; }
function HomeRedirect() { return <><Show when="signed-in"><Redirect to="/home"/></Show><Show when="signed-out"><LandingPage/></Show></>; }
function PrivateHome() { return <><Show when="signed-in"><AppShell><HomePage/></AppShell></Show><Show when="signed-out"><Redirect to="/"/></Show></>; }

const nav = [
  { path: '/home', label: 'Home', icon: Home }, { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/buddies', label: 'Buddies', icon: Users }, { path: '/clans', label: 'Communities', icon: UsersRound },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
];
function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  return <div className="app-frame"><header className="app-topbar"><LinkHome/><nav className="desktop-nav">{nav.map((n) => <Link href={n.path} key={n.path} className={location === n.path ? 'active' : ''}>{n.label}</Link>)}</nav><div className="top-actions"><Link href="/search" className="icon-button" aria-label="Search"><Search size={18}/></Link><Link href="/notifications" className="icon-button" aria-label="Notifications"><Bell size={18}/></Link><Link className="top-avatar" href="/profile">A</Link><button className="logout-button" onClick={() => signOut({ redirectUrl: basePath || '/' })}>Log out</button></div></header><div className="app-content">{children}</div><nav className="mobile-nav">{nav.map((n) => { const Icon = n.icon; return <Link href={n.path} key={n.path} className={location === n.path ? 'active' : ''}><Icon size={20}/><small>{n.label}</small></Link>; })}</nav></div>;
}

function RouteShell({ children }: { children: ReactNode }) { const [location] = useLocation(); return <><Show when="signed-in"><ErrorBoundary resetKey={location}><AppShell>{children}</AppShell></ErrorBoundary></Show><Show when="signed-out"><Redirect to="/login"/></Show></>; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }

function RouterContents() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}
    localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Your people and plans are right where you left them.' } }, signUp: { start: { title: 'Find your people', subtitle: 'Good plans start with a hello.' } } }}
    routerPush={(to: string) => setLocation(stripBase(to))}
    routerReplace={(to: string) => setLocation(stripBase(to), { replace: true })}>
    <QueryClientProvider client={queryClient}><ClerkQueryClientCacheInvalidator/>
      <RoutedErrorBoundary><Switch>
        <Route path="/" component={HomeRedirect}/>
        <Route path="/sign-in/*?" component={SignInPage}/>
        <Route path="/sign-up/*?" component={SignUpPage}/>
        <Route path="/home" component={PrivateHome}/>
        <Route path="/discover">{() => <RouteShell><DiscoverPage/></RouteShell>}</Route>
        <Route path="/events/:eventId">{() => <RouteShell><EventPage/></RouteShell>}</Route>
        <Route path="/buddies">{() => <RouteShell><BuddiesPage/></RouteShell>}</Route>
        <Route path="/buddies/discover">{() => <RouteShell><PeopleDiscoverPage/></RouteShell>}</Route>
        <Route path="/profile">{() => <RouteShell><ProfilePage/></RouteShell>}</Route>
        <Route path="/users/:userId">{() => <RouteShell><PersonProfilePage/></RouteShell>}</Route>
        <Route path="/clans">{() => <RouteShell><ClansPage/></RouteShell>}</Route>
        <Route path="/clans/create">{() => <RouteShell><CreateClanPage/></RouteShell>}</Route>
        <Route path="/clans/:clanId">{() => <RouteShell><ClanPage/></RouteShell>}</Route>
        <Route path="/plans">{() => <RouteShell><PlansPage/></RouteShell>}</Route>
        <Route path="/plans/create">{() => <RouteShell><CreatePlanPage/></RouteShell>}</Route>
        <Route path="/messages">{() => <RouteShell><MessagesPage/></RouteShell>}</Route>
        <Route path="/notifications">{() => <RouteShell><NotificationsPage/></RouteShell>}</Route>
        <Route path="/search">{() => <RouteShell><SearchPage/></RouteShell>}</Route>
        <Route path="/settings">{() => <RouteShell><SettingsPage/></RouteShell>}</Route>
        <Route path="/onboarding">{() => <RouteShell><OnboardingPage/></RouteShell>}</Route>
        <Route path="/login" component={LoginEntry}/>
        <Route path="/signup" component={SignupEntry}/>
        <Route component={NotFoundPage}/>
      </Switch></RoutedErrorBoundary>
    </QueryClientProvider>
  </ClerkProvider>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={basePath}><RouterContents/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;
