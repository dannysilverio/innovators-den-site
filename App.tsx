import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Topics from "@/pages/Topics";
import TopicDetail from "@/pages/TopicDetail";
import ArticleDetail from "@/pages/ArticleDetail";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Screenshots from "@/pages/Screenshots";
import NotFound from "@/pages/not-found";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Opportunities from "@/pages/Opportunities";
import OpportunityDetail from "@/pages/OpportunityDetail";
import Discover from "@/pages/Discover";
import Membership from "@/pages/Membership";
import Innovators from "@/pages/Innovators";
import InnovatorDetail from "@/pages/InnovatorDetail";
import CookieBanner from "@/components/CookieBanner";
import WebNav from "@/components/WebNav";
import Moderation from "@/pages/Moderation";
import InnerCircle from "@/pages/InnerCircle";
import AdManager from "@/pages/AdManager";
import Admin from "@/pages/Admin";
import Marketplace from "@/pages/Marketplace";
import Governance from "@/pages/Governance";
import Concierge from "@/pages/Concierge";
import Briefing from "@/pages/Briefing";
import Intelligence from "@/pages/Intelligence";
import Submit from "@/pages/Submit";
import Collaborate from "@/pages/Collaborate";
import Circles from "@/pages/Circles";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Profile from "@/pages/Profile";
import ForAudience from "@/pages/ForAudience";
import Search from "@/pages/Search";
import Saved from "@/pages/Saved";
import Cities from "@/pages/Cities";
import Partners from "@/pages/Partners";
import SwordStormPrayer from "@/pages/SwordStormPrayer";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/topics" component={Topics} />
      <Route path="/topics/:topic" component={TopicDetail} />
      <Route path="/articles/:id" component={ArticleDetail} />
      <Route path="/stories/the-sword-the-storm-and-the-prayer" component={SwordStormPrayer} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/opportunities/:id" component={OpportunityDetail} />
      <Route path="/discover" component={Discover} />
      <Route path="/membership" component={Membership} />
      <Route path="/innovators" component={Innovators} />
      <Route path="/innovators/:id" component={InnovatorDetail} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/screenshots" component={Screenshots} />
      <Route path="/moderation" component={Moderation} />
      <Route path="/inner-circle" component={InnerCircle} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/governance" component={Governance} />
      <Route path="/concierge" component={Concierge} />
      <Route path="/briefing" component={Briefing} />
      <Route path="/intelligence" component={Intelligence} />
      <Route path="/submit" component={Submit} />
      <Route path="/collaborate" component={Collaborate} />
      <Route path="/circles" component={Circles} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/profile" component={Profile} />
      <Route path="/for/:topic" component={ForAudience} />
      <Route path="/search" component={Search} />
      <Route path="/saved" component={Saved} />
      <Route path="/cities" component={Cities} />
      <Route path="/partners" component={Partners} />
      <Route path="/admin/ads" component={AdManager} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <WebNav />
            <Router />
            <CookieBanner />
          </AuthProvider>
        </WouterRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
