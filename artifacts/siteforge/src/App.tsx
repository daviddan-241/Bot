import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Discovery from "@/pages/discovery";
import AutoScan from "@/pages/autoscan";
import Scanner from "@/pages/scanner";
import Generator from "@/pages/generator";
import Proposals from "@/pages/proposals";
import ProposalDetail from "@/pages/proposal-detail";
import Crm from "@/pages/crm";
import CrmDetail from "@/pages/crm-detail";
import Settings from "@/pages/settings";
import PublicProposal from "@/pages/public-proposal";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  return (
    <Route {...rest}>
      {(params) => (
        <AuthGuard>
          <AppLayout>
            <Component params={params} />
          </AppLayout>
        </AuthGuard>
      )}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/proposals/public/:token" component={PublicProposal} />

      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/discovery" component={Discovery} />
      <ProtectedRoute path="/autoscan" component={AutoScan} />
      <ProtectedRoute path="/scanner" component={Scanner} />
      <ProtectedRoute path="/generator" component={Generator} />
      <ProtectedRoute path="/proposals" component={Proposals} />
      <ProtectedRoute path="/proposals/:id" component={ProposalDetail} />
      <ProtectedRoute path="/crm" component={Crm} />
      <ProtectedRoute path="/crm/:id" component={CrmDetail} />
      <ProtectedRoute path="/settings" component={Settings} />

      <Route>
        <AppLayout>
          <NotFound />
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="siteforge-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
