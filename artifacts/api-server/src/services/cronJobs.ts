import cron from "node-cron";
import { db, tasksTable, dailyPlansTable, pushSubscriptionsTable, notesTable } from "@workspace/db";
import { eq, and, lt, sql, count } from "drizzle-orm";
import { PushNotificationService } from "./pushNotification";

export function startCronJobs() {
  console.log("[Cron] Registering cron jobs...");

  cron.schedule("0 8 * * *", async () => {
    console.log("[Cron] Morning Briefing - sending notifications");
    try {
      await PushNotificationService.sendToAllUsers({
        title: "Ready to plan your day?",
        body: "Let's set up your daily plan and crush it today!",
        url: "/plan",
        tag: "morning-briefing",
      });
      console.log("[Cron] Morning Briefing sent");
    } catch (err) {
      console.error("[Cron] Morning Briefing error:", err);
    }
  });

  cron.schedule("0 21 * * *", async () => {
    console.log("[Cron] Streak Guardian - checking for users with streaks");
    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const todayPlans = await db
        .select()
        .from(dailyPlansTable)
        .where(eq(dailyPlansTable.date, todayDate));

      if (todayPlans.length === 0) {
        await PushNotificationService.sendToAllUsers({
          title: "Don't break your streak!",
          body: "You haven't planned today yet. A quick plan keeps momentum going.",
          url: "/plan",
          tag: "streak-guardian",
        });
      }
      console.log("[Cron] Streak Guardian completed");
    } catch (err) {
      console.error("[Cron] Streak Guardian error:", err);
    }
  });

  cron.schedule("0 */6 * * *", async () => {
    console.log("[Cron] Overdue Escalator - bumping overdue tasks");
    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const result = await db
        .update(tasksTable)
        .set({ status: "today", priority: "high" })
        .where(
          and(
            eq(tasksTable.status, "scheduled"),
            lt(tasksTable.dueDate, todayDate)
          )
        )
        .returning({ id: tasksTable.id });

      console.log(`[Cron] Overdue Escalator bumped ${result.length} tasks`);
    } catch (err) {
      console.error("[Cron] Overdue Escalator error:", err);
    }
  });

  cron.schedule("0 19 * * 0", async () => {
    console.log("[Cron] Weekly Review - generating summary");
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const completedTasks = await db
        .select({ taskCount: count() })
        .from(tasksTable)
        .where(
          and(
            eq(tasksTable.status, "done"),
            sql`${tasksTable.updatedAt} >= ${weekAgo}`
          )
        );

      const plansCount = await db
        .select({ planCount: count() })
        .from(dailyPlansTable)
        .where(sql`${dailyPlansTable.date} >= ${weekAgoStr}`);

      const tasksDone = completedTasks[0]?.taskCount ?? 0;
      const plansMade = plansCount[0]?.planCount ?? 0;

      const summaryContent = `# Weekly Review - ${new Date().toLocaleDateString()}\n\n` +
        `## This Week's Stats\n` +
        `- **Tasks Completed:** ${tasksDone}\n` +
        `- **Daily Plans Created:** ${plansMade}\n\n` +
        `## Reflection\n` +
        `Take a moment to reflect on what went well and what you'd like to improve next week.`;

      await db.insert(notesTable).values({
        title: `Weekly Review - ${new Date().toLocaleDateString()}`,
        content: summaryContent,
        isPinned: true,
      });

      await PushNotificationService.sendToAllUsers({
        title: "Your weekly review is ready!",
        body: `You completed ${tasksDone} tasks and made ${plansMade} daily plans this week.`,
        url: "/notes",
        tag: "weekly-review",
      });

      console.log("[Cron] Weekly Review completed");
    } catch (err) {
      console.error("[Cron] Weekly Review error:", err);
    }
  });

  cron.schedule("0 10 * * *", async () => {
    console.log("[Cron] Inbox Nudge - checking inbox count");
    try {
      const inboxTasks = await db
        .select({ inboxCount: count() })
        .from(tasksTable)
        .where(eq(tasksTable.status, "inbox"));

      const inboxCount = inboxTasks[0]?.inboxCount ?? 0;

      if (inboxCount > 5) {
        await PushNotificationService.sendToAllUsers({
          title: `${inboxCount} items in your inbox`,
          body: "Take a few minutes to sort your inbox — your future self will thank you!",
          url: "/inbox",
          tag: "inbox-nudge",
        });
      }

      console.log(`[Cron] Inbox Nudge: ${inboxCount} items in inbox`);
    } catch (err) {
      console.error("[Cron] Inbox Nudge error:", err);
    }
  });

  console.log("[Cron] All cron jobs registered:");
  console.log("  - Morning Briefing: 8:00 AM daily");
  console.log("  - Streak Guardian: 9:00 PM daily");
  console.log("  - Overdue Escalator: Every 6 hours");
  console.log("  - Weekly Review: Sunday 7:00 PM");
  console.log("  - Inbox Nudge: 10:00 AM daily (if >5 inbox items)");
}
