import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import TodayView from "@/pages/TodayView";
import Inbox from "@/pages/Inbox";
import TaskDetail from "@/pages/TaskDetail";
import Notes from "@/pages/Notes";
import NoteEditor from "@/pages/NoteEditor";
import Projects from "@/pages/Projects";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";
import DailyPlan from "@/pages/DailyPlan";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/onboarding" component={Onboarding} />
      
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
      <Route path="/chat">
        <AppLayout><Chat /></AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout><Settings /></AppLayout>
      </Route>
      <Route path="/plan">
        <AppLayout><DailyPlan /></AppLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
