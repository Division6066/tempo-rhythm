import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConvexAuthWrapper } from "@/components/providers/ConvexAuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import TodayView from "@/pages/TodayView";
import Inbox from "@/pages/Inbox";
import TaskDetail from "@/pages/TaskDetail";
import Notes from "@/pages/Notes";
import NoteEditor from "@/pages/NoteEditor";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";
import DailyPlan from "@/pages/DailyPlan";
import Calendar from "@/pages/Calendar";
import PeriodNotes from "@/pages/PeriodNotes";
import TaskFilters from "@/pages/TaskFilters";
import NoteTemplates from "@/pages/NoteTemplates";
import PublishedNote from "@/pages/PublishedNote";
import FocusSession from "@/pages/FocusSession";
import Folders from "@/pages/Folders";
import FolderDetail from "@/pages/FolderDetail";
import Tags from "@/pages/Tags";
import Memories from "@/pages/Memories";
import Search from "@/pages/Search";
import Extract from "@/pages/Extract";
import Preferences from "@/pages/Preferences";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const queryClient = new QueryClient();

function Router() {
  return (
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
            </TooltipProvider>
          </QueryClientProvider>
        </ConvexAuthWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
