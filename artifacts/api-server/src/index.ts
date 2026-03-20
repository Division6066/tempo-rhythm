import app from "./app";
import { ensureEmbeddingsTable } from "./embeddings";
import { createAiJobWorker } from "./lib/bullmq";
import { startCronJobs } from "./services/cronJobs";
import { ensurePushSubscriptionsTable } from "./services/ensurePushTable";

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

let aiWorker: ReturnType<typeof createAiJobWorker> | null = null;

async function initBullMQ() {
  if (!process.env["REDIS_URL"]) {
    console.log("[BullMQ] No REDIS_URL configured, skipping queue worker initialization");
    return;
  }
  try {
    aiWorker = createAiJobWorker();
    aiWorker.on("completed", (job) => {
      console.log(`[BullMQ] Job ${job.id} completed`);
    });
    aiWorker.on("failed", (job, err) => {
      console.error(`[BullMQ] Job ${job?.id} failed:`, err.message);
    });
    console.log("[BullMQ] AI job worker initialized");
  } catch (err) {
    console.warn("[BullMQ] Failed to initialize worker:", err);
  }
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await ensureEmbeddingsTable();
  await ensurePushSubscriptionsTable();
  await initBullMQ();
  startCronJobs();
  console.log("[Libraries] LlamaIndex, LangChain, instructor-js, BullMQ modules available");
});
