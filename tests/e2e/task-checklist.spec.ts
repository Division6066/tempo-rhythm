import { createServer, type Server } from "node:http";
import { AddressInfo } from "node:net";
import { expect, test } from "@playwright/test";
import {
  appendChecklistItem,
  toggleChecklistItemState,
  type ChecklistItem,
} from "../../convex/lib/checklist";

type TaskFixture = {
  title: string;
  checklist: ChecklistItem[];
};

let server: Server;
let baseUrl = "";
let task: TaskFixture;

function renderTaskPage() {
  const checklistMarkup = task.checklist
    .map((item) => {
      const checkedAttribute = item.completed ? "checked" : "";
      return `<li>
        <label>
          <input
            data-item-id="${item.id}"
            type="checkbox"
            ${checkedAttribute}
            aria-label="${item.text}"
          />
          ${item.text}
        </label>
      </li>`;
    })
    .join("");

  return `<!doctype html>
    <html lang="en">
      <head>
        <title>Task checklist persistence test</title>
      </head>
      <body>
        <main>
          <h1>${task.title}</h1>
          <ul>${checklistMarkup}</ul>
          <form id="add-step">
            <label>
              Add a smaller step
              <input id="step-text" name="text" />
            </label>
            <button type="submit">Add step</button>
          </form>
        </main>
        <script>
          document.querySelectorAll("input[type=checkbox]").forEach((input) => {
            input.addEventListener("change", async (event) => {
              await fetch("/toggle", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  itemId: event.currentTarget.dataset.itemId,
                  checked: event.currentTarget.checked,
                }),
              });
            });
          });
          document.getElementById("add-step").addEventListener("submit", async (event) => {
            event.preventDefault();
            await fetch("/add", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ text: new FormData(event.currentTarget).get("text") }),
            });
            window.location.reload();
          });
        </script>
      </body>
    </html>`;
}

test.beforeEach(async () => {
  task = {
    title: "Submit insurance paperwork",
    checklist: [],
  };

  server = createServer((request, response) => {
    if (request.method === "POST" && request.url === "/add") {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk;
      });
      request.on("end", () => {
        const payload = JSON.parse(body) as { text: string };
        task = {
          ...task,
          checklist: appendChecklistItem(task.checklist, payload.text, "photo-id"),
        };
        response.writeHead(204);
        response.end();
      });
      return;
    }

    if (request.method === "POST" && request.url === "/toggle") {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk;
      });
      request.on("end", () => {
        const payload = JSON.parse(body) as { itemId: string; checked: boolean };
        task = {
          ...task,
          checklist: toggleChecklistItemState(
            task.checklist,
            payload.itemId,
            payload.checked,
            1_783_528_800_000,
          ),
        };
        response.writeHead(204);
        response.end();
      });
      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(renderTaskPage());
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

test("checking off a checklist item persists after reload", async ({ page }) => {
  await page.goto(baseUrl);

  await page.getByLabel("Add a smaller step").fill("Attach photo ID");
  await page.getByRole("button", { name: "Add step" }).click();

  const checklistItem = page.getByLabel("Attach photo ID");
  await expect(checklistItem).not.toBeChecked();

  await checklistItem.check();
  await expect(checklistItem).toBeChecked();

  await page.reload();
  await expect(page.getByLabel("Attach photo ID")).toBeChecked();
});
