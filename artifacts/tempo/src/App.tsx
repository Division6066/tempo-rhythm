import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConvexAuthWrapper } from "@/components/providers/ConvexAuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PushPermissionBanner from "@/components/PushPermissionBanner";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const TodayView = lazy(() => import("@/pages/TodayView"));
const Inbox = lazy(() => import("@/pages/Inbox"));
const TaskDetail = lazy(() => import("@/pages/TaskDetail"));
const Notes = lazy(() => import("@/pages/Notes"));
const NoteEditor = lazy(() => import("@/pages/NoteEditor"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const Chat = lazy(() => import("@/pages/Chat"));
const Settings = lazy(() => import("@/pages/Settings"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const DailyPlan = lazy(() => import("@/pages/DailyPlan"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const PeriodNotes = lazy(() => import("@/pages/PeriodNotes"));
const TaskFilters = lazy(() => import("@/pages/TaskFilters"));
const NoteTemplates = lazy(() => import("@/pages/NoteTemplates"));
const PublishedNote = lazy(() => import("@/pages/PublishedNote"));
const FocusSession = lazy(() => import("@/pages/FocusSession"));
const Folders = lazy(() => import("@/pages/Folders"));
const FolderDetail = lazy(() => import("@/pages/FolderDetail"));
const Tags = lazy(() => import("@/pages/Tags"));
const Memories = lazy(() => import("@/pages/Memories"));
const Search = lazy(() => import("@/pages/Search"));
const Extract = lazy(() => import("@/pages/Extract"));
const Preferences = lazy(() => import("@/pages/Preferences"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 rounded-full animate-breathe bg-primary/20" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/onboarding" component={Onboarding} />
        
        <Route path="/published/:slug">
          <PublishedNote />
        </Route>
        
        <Route path="/">
          <AppLayout><ErrorBoundary><Dashboard /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/today">
          <AppLayout><ErrorBoundary><TodayView /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/inbox">
          <AppLayout><ErrorBoundary><Inbox /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/tasks/:id">
          <AppLayout><ErrorBoundary><TaskDetail /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/notes">
          <AppLayout><ErrorBoundary><Notes /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/notes/:id">
          <AppLayout><ErrorBoundary><NoteEditor /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/projects">
          <AppLayout><ErrorBoundary><Projects /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/projects/:id">
          <AppLayout><ErrorBoundary><ProjectDetail /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/chat">
          <AppLayout><ErrorBoundary><Chat /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/settings">
          <AppLayout><ErrorBoundary><Settings /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/plan">
          <AppLayout><ErrorBoundary><DailyPlan /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/calendar">
          <AppLayout><ErrorBoundary><Calendar /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/period-notes">
          <AppLayout><ErrorBoundary><PeriodNotes /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/filters">
          <AppLayout><ErrorBoundary><TaskFilters /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/templates">
          <AppLayout><ErrorBoundary><NoteTemplates /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/focus">
          <AppLayout><ErrorBoundary><FocusSession /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/folders">
          <AppLayout><ErrorBoundary><Folders /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/folders/:id">
          <AppLayout><ErrorBoundary><FolderDetail /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/tags">
          <AppLayout><ErrorBoundary><Tags /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/memories">
          <AppLayout><ErrorBoundary><Memories /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/search">
          <AppLayout><ErrorBoundary><Search /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/extract">
          <AppLayout><ErrorBoundary><Extract /></ErrorBoundary></AppLayout>
        </Route>
        <Route path="/preferences">
          <AppLayout><ErrorBoundary><Preferences /></ErrorBoundary></AppLayout>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ConvexAuthWrapper>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AuthGuard>
                  <Router />
                </AuthGuard>
              </WouterRouter>
              <Toaster />
              <PWAInstallPrompt />
              <PushPermissionBanner />
            </TooltipProvider>
          </QueryClientProvider>
        </ConvexAuthWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
