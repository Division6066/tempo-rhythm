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
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/today">
        <AppLayout><TodayView /></AppLayout>
      </Route>
      <Route path="/inbox">
        <AppLayout><Inbox /></AppLayout>
      </Route>
      <Route path="/tasks/:id">
        <AppLayout><TaskDetail /></AppLayout>
      </Route>
      <Route path="/notes">
        <AppLayout><Notes /></AppLayout>
      </Route>
      <Route path="/notes/:id">
        <AppLayout><NoteEditor /></AppLayout>
      </Route>
      <Route path="/projects">
        <AppLayout><Projects /></AppLayout>
      </Route>
      <Route path="/projects/:id">
        <AppLayout><ProjectDetail /></AppLayout>
      </Route>
      <Route path="/chat">
        <AppLayout><Chat /></AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout><Settings /></AppLayout>
      </Route>
      <Route path="/plan">
        <AppLayout><DailyPlan /></AppLayout>
      </Route>
      <Route path="/calendar">
        <AppLayout><Calendar /></AppLayout>
      </Route>
      <Route path="/period-notes">
        <AppLayout><PeriodNotes /></AppLayout>
      </Route>
      <Route path="/filters">
        <AppLayout><TaskFilters /></AppLayout>
      </Route>
      <Route path="/templates">
        <AppLayout><NoteTemplates /></AppLayout>
      </Route>
      <Route path="/focus">
        <AppLayout><FocusSession /></AppLayout>
      </Route>
      <Route path="/folders">
        <AppLayout><Folders /></AppLayout>
      </Route>
      <Route path="/folders/:id">
        <AppLayout><FolderDetail /></AppLayout>
      </Route>
      <Route path="/tags">
        <AppLayout><Tags /></AppLayout>
      </Route>
      <Route path="/memories">
        <AppLayout><Memories /></AppLayout>
      </Route>
      <Route path="/search">
        <AppLayout><Search /></AppLayout>
      </Route>
      <Route path="/extract">
        <AppLayout><Extract /></AppLayout>
      </Route>
      <Route path="/preferences">
        <AppLayout><Preferences /></AppLayout>
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
            </TooltipProvider>
          </QueryClientProvider>
        </ConvexAuthWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
