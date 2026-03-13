import { Router, type IRouter } from "express";

const router: IRouter = Router();

const defaultTemplates = [
  {
    id: "top3",
    name: "Top 3 Priorities",
    type: "top3" as const,
    content: { items: [], maxItems: 3 },
    isDefault: true,
  },
  {
    id: "focusBlock",
    name: "Focus Block",
    type: "focusBlock" as const,
    content: { title: "Deep Work", duration: 90, task: "" },
    isDefault: true,
  },
  {
    id: "taskSection",
    name: "Task Section",
    type: "taskSection" as const,
    content: { title: "Quick Wins", tasks: [] },
    isDefault: true,
  },
  {
    id: "reflection",
    name: "Reflection",
    type: "reflection" as const,
    content: { prompt: "What's the ONE thing that would make today a win?" },
    isDefault: true,
  },
  {
    id: "checklist",
    name: "Checklist",
    type: "checklist" as const,
    content: { items: [] },
    isDefault: true,
  },
  {
    id: "heading",
    name: "Heading",
    type: "heading" as const,
    content: { text: "" },
    isDefault: true,
  },
  {
    id: "notesSection",
    name: "Notes Section",
    type: "notesSection" as const,
    content: { text: "" },
    isDefault: true,
  },
  {
    id: "habitSection",
    name: "Habit Tracker",
    type: "habitSection" as const,
    content: { habits: [] },
    isDefault: true,
  },
  {
    id: "studySession",
    name: "Study Session",
    type: "studySession" as const,
    content: { subject: "", duration: 45, technique: "pomodoro" },
    isDefault: true,
  },
  {
    id: "weeklyReview",
    name: "Weekly Review",
    type: "weeklyReview" as const,
    content: { wins: [], challenges: [], nextWeekFocus: "" },
    isDefault: true,
  },
];

router.get("/templates", async (_req, res): Promise<void> => {
  res.json(defaultTemplates);
});

export default router;
