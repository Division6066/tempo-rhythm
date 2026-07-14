import { expect, test } from "@playwright/test";

const today = Date.UTC(2026, 6, 14, 12);
const tomorrow = Date.UTC(2026, 6, 15, 12);

export const html = String.raw`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Task variants browser proof</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 24px; background: #f8f3ec; color: #25211d; }
      button, select, input { min-height: 36px; margin: 4px; }
      nav { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
      section { border: 1px solid #d9c9b8; border-radius: 16px; padding: 12px; margin: 10px 0; background: white; }
      article { border: 1px solid #e6d8ca; border-radius: 12px; padding: 10px; margin: 8px 0; }
      .columns { display: grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap: 10px; }
      .done .title { text-decoration: line-through; color: #766b61; }
    </style>
  </head>
  <body>
    <h1>Task variants browser proof</h1>
    <nav aria-label="Task variants">
      <button data-variant="all">All tasks</button>
      <button data-variant="today">Today</button>
      <button data-variant="project">Project</button>
      <button data-variant="priority">Priority</button>
      <button data-variant="energy">Energy</button>
      <button data-variant="kanban">Kanban</button>
      <button data-variant="recurring">Recurring</button>
      <button data-variant="checklists">Checklists</button>
    </nav>
    <main id="app"></main>
    <script>
      const STORAGE_KEY = "tempo-task-variants-proof";
      const startMs = ${Date.UTC(2026, 6, 14)};
      const endMs = ${Date.UTC(2026, 6, 15)};
      const seedTasks = [
        {
          id: "alpha",
          title: "Alpha launch checklist",
          status: "todo",
          priority: "high",
          energyLevel: "low",
          projectKey: "alpha-launch",
          dueAt: ${today},
          checklist: [
            { id: "draft", text: "Draft copy", completed: true },
            { id: "send", text: "Send copy", completed: false }
          ],
          recurrence: { frequency: "weekly", interval: 1, nextDueAt: ${tomorrow} }
        },
        {
          id: "inbox",
          title: "Inbox medium",
          status: "in_progress",
          priority: "medium",
          energyLevel: "medium",
          projectKey: "admin"
        },
        {
          id: "deep",
          title: "Deep work",
          status: "done",
          priority: "low",
          energyLevel: "high",
          projectKey: "alpha-launch"
        }
      ];

      function loadTasks() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));
        return seedTasks;
      }

      function saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      }

      function progress(task) {
        const total = task.checklist?.length ?? 0;
        const completed = task.checklist?.filter((item) => item.completed).length ?? 0;
        return total === 0 ? "" : "Checklist " + completed + "/" + total;
      }

      function isToday(task) {
        return task.dueAt >= startMs && task.dueAt < endMs;
      }

      function filtered(tasks, variant) {
        if (variant === "today") return tasks.filter(isToday);
        if (variant === "project") return tasks.filter((task) => task.projectKey === "alpha-launch");
        if (variant === "recurring") return tasks.filter((task) => task.recurrence);
        if (variant === "checklists") return tasks.filter((task) => (task.checklist?.length ?? 0) > 0);
        return tasks;
      }

      function taskCard(task) {
        const doneClass = task.status === "done" ? " done" : "";
        const checklist = (task.checklist ?? []).map((item) => (
          '<label><input data-checklist="' + task.id + ':' + item.id + '" type="checkbox" ' +
          (item.completed ? "checked" : "") + ' /> ' + item.text + '</label>'
        )).join("<br />");
        const recurrence = task.recurrence
          ? '<button data-next="' + task.id + '">Create next</button>'
          : "";
        return '<article class="' + doneClass + '" data-task="' + task.id + '">' +
          '<strong class="title">' + task.title + '</strong>' +
          '<p>Status: <span data-status-label="' + task.id + '">' + task.status + '</span></p>' +
          '<p>Project: ' + (task.projectKey || "none") + ' | Priority: ' + task.priority + ' | Energy: ' + task.energyLevel + '</p>' +
          '<button data-complete="' + task.id + '">Toggle complete</button>' +
          '<select data-status="' + task.id + '">' +
            ["todo", "in_progress", "done", "cancelled"].map((status) => (
              '<option value="' + status + '" ' + (task.status === status ? "selected" : "") + '>' + status + '</option>'
            )).join("") +
          '</select>' +
          '<p data-progress="' + task.id + '">' + progress(task) + '</p>' +
          checklist +
          recurrence +
          '</article>';
      }

      function grouped(tasks, field, values) {
        return '<div class="columns">' + values.map((value) => (
          '<section data-group="' + value + '"><h2>' + value + '</h2>' +
          tasks.filter((task) => (task[field] || "medium") === value).map(taskCard).join("") +
          '</section>'
        )).join("") + '</div>';
      }

      function render(variant = new URLSearchParams(location.search).get("view") || "all") {
        const tasks = loadTasks();
        const visible = filtered(tasks, variant);
        const app = document.getElementById("app");
        app.innerHTML = '<h2 data-view="' + variant + '">' + variant + '</h2>';
        if (variant === "priority") {
          app.innerHTML += grouped(visible, "priority", ["high", "medium", "low"]);
        } else if (variant === "energy") {
          app.innerHTML += grouped(visible, "energyLevel", ["low", "medium", "high"]);
        } else if (variant === "kanban") {
          app.innerHTML += grouped(visible, "status", ["todo", "in_progress", "done", "cancelled"]);
        } else {
          app.innerHTML += visible.map(taskCard).join("");
        }
      }

      document.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        const tasks = loadTasks();
        const variant = button.dataset.variant;
        if (variant) {
          history.replaceState(null, "", "?view=" + variant);
          render(variant);
          return;
        }
        const completeId = button.dataset.complete;
        if (completeId) {
          const task = tasks.find((item) => item.id === completeId);
          task.status = task.status === "done" ? "todo" : "done";
          saveTasks(tasks);
          render(new URLSearchParams(location.search).get("view") || "all");
          return;
        }
        const nextId = button.dataset.next;
        if (nextId) {
          const task = tasks.find((item) => item.id === nextId);
          tasks.push({
            ...task,
            id: nextId + "-next",
            status: "todo",
            dueAt: task.recurrence.nextDueAt,
            checklist: task.checklist?.map((item) => ({ ...item, completed: false }))
          });
          saveTasks(tasks);
          render("recurring");
        }
      });

      document.addEventListener("change", (event) => {
        const tasks = loadTasks();
        if (event.target.dataset.status) {
          const task = tasks.find((item) => item.id === event.target.dataset.status);
          task.status = event.target.value;
        }
        if (event.target.dataset.checklist) {
          const [taskId, itemId] = event.target.dataset.checklist.split(":");
          const task = tasks.find((item) => item.id === taskId);
          const item = task.checklist.find((entry) => entry.id === itemId);
          item.completed = event.target.checked;
        }
        saveTasks(tasks);
        render(new URLSearchParams(location.search).get("view") || "all");
      });

      document.querySelectorAll("button[data-variant]").forEach((button) => {
        button.addEventListener("click", () => render(button.dataset.variant));
      });

      render();
    </script>
  </body>
</html>
`;

test("all task variants render and key persisted states survive reload", async ({ page }) => {
  await page.route("http://task-variants.local/**", async (route) => {
    await route.fulfill({ body: html, contentType: "text/html" });
  });

  await page.goto("http://task-variants.local/");

  for (const variant of [
    "all",
    "today",
    "project",
    "priority",
    "energy",
    "kanban",
    "recurring",
    "checklists",
  ]) {
    await page
      .getByRole("button", { name: variant === "all" ? "All tasks" : new RegExp(variant, "i") })
      .click();
    await expect(page.locator(`[data-view="${variant}"]`)).toBeVisible();
  }

  await page.getByRole("button", { name: "All tasks" }).click();
  await page.locator('[data-complete="alpha"]').click();
  await page.reload();
  await expect(page.locator('[data-status-label="alpha"]')).toHaveText("done");

  await page.getByRole("button", { name: "Kanban" }).click();
  await page.locator('[data-status="inbox"]').selectOption("done");
  await page.reload();
  await page.getByRole("button", { name: "Kanban" }).click();
  await expect(page.locator('[data-group="done"] [data-task="inbox"]')).toBeVisible();

  await page.getByRole("button", { name: "Checklists" }).click();
  await page.locator('[data-checklist="alpha:send"]').check();
  await page.reload();
  await page.getByRole("button", { name: "Checklists" }).click();
  await expect(page.locator('[data-progress="alpha"]')).toHaveText("Checklist 2/2");

  await page.getByRole("button", { name: "Recurring" }).click();
  await page.locator('[data-next="alpha"]').click();
  await expect(page.locator('[data-task="alpha-next"]')).toBeVisible();
});
