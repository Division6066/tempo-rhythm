import { expect, test } from "@playwright/test";

test("moving a Kanban card persists its status after reload", async ({ page }) => {
  await page.route("**/api/tasks", async (route) => {
    if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON() as { taskId: string; status: string };
      await page.evaluate((next) => {
        window.localStorage.setItem(`task-status:${next.taskId}`, next.status);
      }, body);
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    const persistedStatus = await page.evaluate(() =>
      window.localStorage.getItem("task-status:task-1"),
    );
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "task-1",
          title: "Review project board",
          status: persistedStatus ?? "todo",
        },
      ]),
    });
  });

  await page.setContent(`
    <main>
      <section data-testid="kanban-column-todo" aria-label="To do"></section>
      <section data-testid="kanban-column-in_progress" aria-label="In progress"></section>
      <script>
        const columns = {
          todo: document.querySelector('[data-testid="kanban-column-todo"]'),
          in_progress: document.querySelector('[data-testid="kanban-column-in_progress"]'),
        };

        async function loadBoard() {
          const tasks = await fetch('/api/tasks').then((response) => response.json());
          for (const column of Object.values(columns)) {
            column.replaceChildren();
          }
          for (const task of tasks) {
            const card = document.createElement('article');
            card.dataset.testid = 'kanban-card-' + task.id;
            card.textContent = task.title;
            const button = document.createElement('button');
            button.dataset.testid = 'move-' + task.id + '-in_progress';
            button.textContent = 'Move to In progress';
            button.addEventListener('click', async () => {
              await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ taskId: task.id, status: 'in_progress' }),
              });
              await loadBoard();
            });
            card.append(button);
            columns[task.status].append(card);
          }
        }

        window.addEventListener('load', loadBoard);
      </script>
    </main>
  `);

  await expect(page.getByTestId("kanban-column-todo").getByTestId("kanban-card-task-1")).toBeVisible();

  await page.getByTestId("move-task-1-in_progress").click();
  await expect(
    page.getByTestId("kanban-column-in_progress").getByTestId("kanban-card-task-1"),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByTestId("kanban-column-in_progress").getByTestId("kanban-card-task-1"),
  ).toBeVisible();
});
