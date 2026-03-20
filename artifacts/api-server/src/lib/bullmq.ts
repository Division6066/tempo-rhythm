import { Queue, Worker, type Job } from "bullmq";

const REDIS_URL = process.env["REDIS_URL"] || "redis://localhost:6379";

function parseRedisConnection(url: string) {
  try {
    const parsed = new URL(url);
    const useTls = parsed.protocol === "rediss:";
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port || "6379", 10),
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      ...(useTls ? { tls: {} } : {}),
    };
  } catch {
    return { host: "localhost", port: 6379 };
  }
}

export const redisConnection = parseRedisConnection(REDIS_URL);

export function createQueue(name: string) {
  return new Queue(name, { connection: redisConnection });
}

export function createWorker<T = unknown>(
  queueName: string,
  processor: (job: Job<T>) => Promise<unknown>,
  options?: { concurrency?: number }
) {
  return new Worker<T>(queueName, processor, {
    connection: redisConnection,
    concurrency: options?.concurrency ?? 1,
  });
}

let _aiJobsQueue: Queue | null = null;

export function getAiJobsQueue(): Queue {
  if (!_aiJobsQueue) {
    _aiJobsQueue = createQueue("ai-jobs");
  }
  return _aiJobsQueue;
}

export const aiJobsQueue = { get name() { return "ai-jobs"; } } as Pick<Queue, "name">;

export function createAiJobWorker() {
  return createWorker(
    "ai-jobs",
    async (job: Job) => {
      const { type, payload } = job.data as { type: string; payload: unknown };
      console.log(`Processing AI job: ${type}`, { jobId: job.id });

      switch (type) {
        case "document-process":
          console.log("Processing document:", payload);
          return { status: "completed", type };
        case "embedding-generate":
          console.log("Generating embeddings:", payload);
          return { status: "completed", type };
        default:
          console.log(`Unknown job type: ${type}`);
          return { status: "skipped", type };
      }
    },
    { concurrency: 2 }
  );
}

export { Queue, Worker, type Job };
