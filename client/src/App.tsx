import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OfflineProvider } from "./contexts/OfflineContext";
import { OfflineIndicator } from "./components/OfflineIndicator";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import HealthRecord from "./pages/HealthRecord";
import Diagnosis from "./pages/Diagnosis";
import Missions from "./pages/Missions";
import Chat from "./pages/Chat";
import Programs from "./pages/Programs";
import Goals from "./pages/Goals";
import Rank from "./pages/Rank";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Community from "./pages/Community";
import PostDetail from "./pages/PostDetail";
import SellerDashboard from "./pages/SellerDashboard";
import Membership from "./pages/Membership";
import Settings from "./pages/Settings";
import HealthCheck from "./pages/HealthCheck";
import VIPLounge from "./pages/VIPLounge";
import Live from "./pages/Live";
import MobileLayout from "./components/MobileLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        <MobileLayout><Dashboard /></MobileLayout>
      </Route>
      <Route path="/profile">
        <MobileLayout><Profile /></MobileLayout>
      </Route>
      <Route path="/record">
        <MobileLayout><HealthRecord /></MobileLayout>
      </Route>
      <Route path="/diagnosis">
        <MobileLayout><Diagnosis /></MobileLayout>
      </Route>
      <Route path="/missions">
        <MobileLayout><Missions /></MobileLayout>
      </Route>
      <Route path="/chat">
        <MobileLayout><Chat /></MobileLayout>
      </Route>
      <Route path="/programs">
        <MobileLayout><Programs /></MobileLayout>
      </Route>
      <Route path="/goals">
        <MobileLayout><Goals /></MobileLayout>
      </Route>
      <Route path="/rank">
        <MobileLayout><Rank /></MobileLayout>
      </Route>
      <Route path="/shop">
        <MobileLayout><Shop /></MobileLayout>
      </Route>
      <Route path="/cart">
        <MobileLayout><Cart /></MobileLayout>
      </Route>
      <Route path="/community">
        <MobileLayout><Community /></MobileLayout>
      </Route>
      <Route path="/community/post/:id">
        <MobileLayout><PostDetail /></MobileLayout>
      </Route>
      <Route path="/seller">
        <MobileLayout><SellerDashboard /></MobileLayout>
      </Route>
      <Route path="/membership">
        <MobileLayout><Membership /></MobileLayout>
      </Route>
      <Route path="/settings">
        <MobileLayout><Settings /></MobileLayout>
      </Route>
      <Route path="/health-check">
        <MobileLayout><HealthCheck /></MobileLayout>
      </Route>
      <Route path="/vip-lounge">
        <MobileLayout><VIPLounge /></MobileLayout>
      </Route>
      <Route path="/live">
        <MobileLayout><Live /></MobileLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <OfflineProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <OfflineIndicator />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </OfflineProvider>
    </ErrorBoundary>
  );
}

export default App;
