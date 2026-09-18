"use client";

import { MarkdownPage } from "@tempo-v0/components/marketing/markdown-page";
import { LandingView } from "@tempo-v0/components/marketing/landing-view";
import { BrainDumpView } from "@tempo-v0/components/tempo/brain-dump-view";
import { CoachView } from "@tempo-v0/components/tempo/coach-view";
import { DailyNoteView } from "@tempo-v0/components/tempo/daily-note-view";
import { DashboardView } from "@tempo-v0/components/tempo/dashboard-view";
import { HabitsView } from "@tempo-v0/components/tempo/habits-view";
import { JournalView } from "@tempo-v0/components/tempo/journal-view";
import { MemoryView } from "@tempo-v0/components/tempo/memory-view";
import { NoteEditor } from "@tempo-v0/components/tempo/note-editor";
import { NotesView } from "@tempo-v0/components/tempo/notes-view";
import { OnboardingView } from "@tempo-v0/components/tempo/onboarding-view";
import { PlanView } from "@tempo-v0/components/tempo/plan-view";
import { SettingsView } from "@tempo-v0/components/tempo/settings-view";
import { TasksView } from "@tempo-v0/components/tempo/tasks-view";
import { TodayView } from "@tempo-v0/components/tempo/today-view";
import {
  ABOUT_MD,
  CHANGELOG_MD,
  PRIVACY_MD,
  TERMS_MD,
} from "@tempo-v0/lib/content/pages";
import { useParams, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { GraftAuthScreen } from "./auth-screen";
import { FlowMount } from "./flow-mount";

function wrap(view: ReactNode) {
  return <FlowMount>{view}</FlowMount>;
}

export function LandingPage() {
  return wrap(<LandingView />);
}

export function LoginPage() {
  return wrap(<GraftAuthScreen mode="login" />);
}

export function SignUpPage() {
  return wrap(<GraftAuthScreen mode="signup" />);
}

export function AboutPage() {
  return wrap(<MarkdownPage eyebrow="About" source={ABOUT_MD} />);
}

export function ChangelogPage() {
  return wrap(<MarkdownPage eyebrow="Changelog" source={CHANGELOG_MD} />);
}

export function PrivacyPage() {
  return wrap(<MarkdownPage eyebrow="Privacy" source={PRIVACY_MD} />);
}

export function TermsPage() {
  return wrap(<MarkdownPage eyebrow="Terms" source={TERMS_MD} />);
}

export function OnboardingPage() {
  return wrap(<OnboardingView />);
}

export function TodayPage() {
  return wrap(<TodayView />);
}

export function DailyNotePage() {
  const search = useSearchParams();
  const raw = search.get("scope");
  const scope =
    raw === "week" || raw === "month" || raw === "year" || raw === "day"
      ? raw
      : "day";
  return wrap(<DailyNoteView initialScope={scope} />);
}

export function CoachPage() {
  return wrap(<CoachView />);
}

export function TasksPage() {
  return wrap(<TasksView />);
}

export function HabitsPage() {
  return wrap(<HabitsView />);
}

export function DashboardPage() {
  return wrap(<DashboardView />);
}

export function MemoryPage() {
  return wrap(<MemoryView />);
}

export function NotesPage() {
  return wrap(<NotesView />);
}

export function NoteIdPage() {
  const params = useParams<{ id: string }>();
  return wrap(<NoteEditor id={params.id} />);
}

export function JournalPage() {
  return wrap(<JournalView />);
}

export function BrainDumpPage() {
  return wrap(<BrainDumpView />);
}

export function PlanPage() {
  return wrap(<PlanView />);
}

export function SettingsPage() {
  return wrap(<SettingsView />);
}
